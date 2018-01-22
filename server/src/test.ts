(Symbol as any).asyncIterator = Symbol.asyncIterator || Symbol.for("Symbol.asyncIterator");

import * as Redis from 'ioredis';
import * as Mongo from 'mongodb';
import * as Elasticsearch from 'elasticsearch';

import { FilmlistManager } from './entry-source/filmlist/filmlist-manager';
import { RedisDatastoreProvider } from './datastore/redis';
import { MediathekViewWebVerteilerFilmlistRepository } from './entry-source/filmlist/repository';
import { RedisLockProvider } from './lock/redis';
import { QueueProvider } from './queue';
import { AsyncEnumerable } from './common/enumerable/async-enumerable';
import { now, sleep, interrupt } from './common/utils';
import { Serializer, Serializable } from './serializer';
import { BullQueueProvider } from './queue/bull/provider';
import { DistributedLoopProvider } from './distributed-loop/index';
import { FilmlistEntrySource } from './entry-source/filmlist/filmlist-entry-source';
import { Filmlist } from './entry-source/filmlist/filmlist';
import { HighPrecisionTimer,  EventLoopWatcher } from './utils/index';
import { MongoEntryRepository } from './repository/mongo/entry-repository';
import { EntriesImporter } from './entries-importer/importer';
import { Keys } from './keys';
import { DataType } from './datastore/index';
import { EntriesIndexer } from './entries-indexer/indexer';
import { NonWorkingAggregatedEntryRepository } from './repository/non-working-aggregated-entry-repository';
import { ElasticsearchSearchEngine } from './search-engine/elasticsearch';
import { ElasticsearchSettings, ElasticsearchMapping } from './elasticsearch-definitions/index';
import { AggregatedEntry } from './common/model';

async function* counter(to: number) {
  for (let i = 0; i < to; i++) {
    yield i;
  }
}

(async () => {
  try {
    Serializer.registerPrototype(Filmlist)

    const watcher = new EventLoopWatcher(100);

    watcher
      .watch(0, 10, 'max')
      .map((measure) => Math.round(measure * 10000) / 10000)
      .subscribe((delay) => console.log(`eventloop: ${delay} ms`));

    const redis = new Redis();
    const mongo = await Mongo.MongoClient.connect('mongodb://localhost:27017');
    const elasticsearch = new Elasticsearch.Client({});

    const db = mongo.db('mediathekviewweb');
    const entriesCollection = db.collection('entries');

    const datastoreProvider = new RedisDatastoreProvider(redis);
    const lockProvider = new RedisLockProvider(redis);
    const filmlistRepository = new MediathekViewWebVerteilerFilmlistRepository('https://verteiler.mediathekviewweb.de/');
    const loopProvider = new DistributedLoopProvider(lockProvider);
    const queueProvider = new BullQueueProvider();
    const entryRepository = new MongoEntryRepository(entriesCollection);
    const aggregatedEntryRepository = new NonWorkingAggregatedEntryRepository(entryRepository);
    const entrySearchEngine = new ElasticsearchSearchEngine<AggregatedEntry>('mediathekviewweb', 'entry', elasticsearch, ElasticsearchSettings, ElasticsearchMapping);

    await entrySearchEngine.initialize();

    const filmlistManager = new FilmlistManager(datastoreProvider, filmlistRepository, loopProvider, queueProvider);
    filmlistManager.run();

    const filmlistEntrySource = new FilmlistEntrySource(datastoreProvider, queueProvider);
    filmlistEntrySource.run();

    const importer = new EntriesImporter(entryRepository, datastoreProvider);
    importer.import(filmlistEntrySource);

    const indexer = new EntriesIndexer(aggregatedEntryRepository, entrySearchEngine, lockProvider, datastoreProvider);
    indexer.run();
  } catch (error) {
    console.log(error);
  }
})();
