(Symbol as any).asyncIterator = Symbol.asyncIterator || Symbol.for("Symbol.asyncIterator");

import * as Http from 'http';

import { Serializer } from './serializer';
import { LockProvider } from './common/lock';
import { AggregatedEntry } from './common/model';
import { SearchEngine } from './common/search-engine';
import { DatastoreFactory } from './datastore';
import { DistributedLoopProvider } from './distributed-loop';
import { EntriesImporter } from './entries-importer/importer';
import { EntriesIndexer } from './entries-indexer/indexer';
import { Filmlist } from './entry-source/filmlist/filmlist';
import { FilmlistEntrySource } from './entry-source/filmlist/filmlist-entry-source';
import { FilmlistManager } from './entry-source/filmlist/filmlist-manager';
import { FilmlistRepository } from './entry-source/filmlist/repository';
import { InstanceProvider } from './instance-provider';
import { QueueProvider } from './queue';
import { AggregatedEntryRepository, EntryRepository } from './repository';
import { EventLoopWatcher } from './utils';
import { MediathekViewWebExpose } from './expose';

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

  const datastoreFactory = await InstanceProvider.datastoreFactory();
  const lockProvider = await InstanceProvider.lockProvider();
  const filmlistRepository = await InstanceProvider.filmlistRepository();
  const distributedLoopProvider = await InstanceProvider.distributedLoopProvider();
  const queueProvider = await InstanceProvider.queueProvider();
  const entryRepository = await InstanceProvider.entryRepository();
  const aggregatedEntryRepository = await InstanceProvider.aggregatedEntryRepository();
  const entrySearchEngine = await InstanceProvider.entrySearchEngine();

  const server = new Http.Server();

  const expose = new MediathekViewWebExpose(entrySearchEngine, server);
  expose.expose();

  server.listen(8080);

  await Promise.all([
    runFilmlistManager(datastoreFactory, filmlistRepository, distributedLoopProvider, queueProvider),
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