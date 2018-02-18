(Symbol as any).asyncIterator = Symbol.asyncIterator || Symbol.for("Symbol.asyncIterator");

import * as Elasticsearch from 'elasticsearch';
import * as Redis from 'ioredis';
import * as Mongo from 'mongodb';

import { Serializer } from './serializer';
import { LockProvider } from './common/lock';
import { AggregatedEntry } from './common/model';
import { SearchEngine } from './common/search-engine';
import { DatastoreFactory } from './datastore';
import { RedisDatastoreFactory } from './datastore/redis';
import { DistributedLoopProvider } from './distributed-loop';
import { ElasticsearchMapping, ElasticsearchSettings } from './elasticsearch-definitions';
import { EntriesImporter } from './entries-importer/importer';
import { EntriesIndexer } from './entries-indexer/indexer';
import { Filmlist } from './entry-source/filmlist/filmlist';
import { FilmlistEntrySource } from './entry-source/filmlist/filmlist-entry-source';
import { FilmlistManager } from './entry-source/filmlist/filmlist-manager';
import { FilmlistRepository, MediathekViewWebVerteilerFilmlistRepository } from './entry-source/filmlist/repository';
import { RedisLockProvider } from './lock/redis';
import { QueueProvider } from './queue';
import { BullQueueProvider } from './queue/bull/provider';
import { AggregatedEntryRepository, EntryRepository } from './repository';
import { MongoEntryRepository } from './repository/mongo/entry-repository';
import { NonWorkingAggregatedEntryRepository } from './repository/non-working-aggregated-entry-repository';
import { ElasticsearchSearchEngine } from './search-engine/elasticsearch';
import { EventLoopWatcher } from './utils';


const watcher = new EventLoopWatcher(10);

watcher
  .watch(0, 25, 'avg')
  .map((measure) => Math.round(measure * 10000) / 10000)
  .subscribe((delay) => setTerminalTitle(`eventloop: ${delay} ms`));

function setTerminalTitle(title: string) {
  process.stdout.write(
    String.fromCharCode(27) + "]0;" + title + String.fromCharCode(7)
  );
}

async function init() {
  Serializer.registerPrototype(Filmlist)

  const redis = new Redis();
  const elasticsearch = new Elasticsearch.Client({});

  const mongo = await Mongo.MongoClient.connect('mongodb://localhost:27017');
  const db = mongo.db('mediathekviewweb');
  const entriesCollection = db.collection('entries');

  const datastoreFactory = new RedisDatastoreFactory(redis);
  const lockProvider = new RedisLockProvider(redis);
  const filmlistRepository = new MediathekViewWebVerteilerFilmlistRepository('https://verteiler.mediathekviewweb.de/');
  const loopProvider = new DistributedLoopProvider(lockProvider);
  const queueProvider = new BullQueueProvider();
  const entryRepository = new MongoEntryRepository(entriesCollection);
  const aggregatedEntryRepository = new NonWorkingAggregatedEntryRepository(entryRepository);
  const entrySearchEngine = new ElasticsearchSearchEngine<AggregatedEntry>(elasticsearch, 'mediathekviewweb', 'entry', ElasticsearchSettings, ElasticsearchMapping);

  await entrySearchEngine.initialize();

  await Promise.all([
    runFilmlistManager(datastoreFactory, filmlistRepository, loopProvider, queueProvider),
    runImporter(datastoreFactory, queueProvider, entryRepository),
    runIndexer(aggregatedEntryRepository, entrySearchEngine, lockProvider, datastoreFactory)
  ]);
}

async function runFilmlistManager(datastoreFactory: DatastoreFactory, filmlistRepository: FilmlistRepository, loopProvider: DistributedLoopProvider, queueProvider: QueueProvider) {
  const filmlistManager = new FilmlistManager(datastoreFactory, filmlistRepository, loopProvider, queueProvider);
  filmlistManager.run();
}

async function runImporter(datastoreFactory: DatastoreFactory, queueProvider: QueueProvider, entryRepository: EntryRepository) {
  const filmlistEntrySource = new FilmlistEntrySource(datastoreFactory, queueProvider);
  filmlistEntrySource.run();

  const importer = new EntriesImporter(entryRepository, datastoreFactory);
  await importer.import(filmlistEntrySource);
}

async function runIndexer(aggregatedEntryRepository: AggregatedEntryRepository, entrySearchEngine: SearchEngine<AggregatedEntry>, lockProvider: LockProvider, datastoreFactory: DatastoreFactory) {
  const indexer = new EntriesIndexer(aggregatedEntryRepository, entrySearchEngine, lockProvider, datastoreFactory);
  await indexer.run();
}

(async () => {
  try {
    await init();
  }
  catch (error) {
    console.error(error);
  }
})();