import { FilmlisteManager } from './filmliste-manager';
import { MVWFilmlisteArchive } from './mvw-filmliste-archive';
import { DataStoreProvider } from './data-store/data-store-provider';
import { RedisKeys } from './redis-keys';
import { Entry } from '../../model';

let filmlisteArchive = new MVWFilmlisteArchive();
let dataStore = DataStoreProvider.getDataStore();

let indexedFilmlists = dataStore.getSet<number>(RedisKeys.IndexedFilmlists);
let entriesToBeAdded = dataStore.getSet<Entry>(RedisKeys.EntriesToBeAdded);
let entriesToBeRemoved = dataStore.getSet<Entry>(RedisKeys.EntriesToBeRemoved);
let deltaAddedEntries = dataStore.getSet<Entry>(RedisKeys.DeltaAddedEntries);
let deltaRemovedEntries = dataStore.getSet<Entry>(RedisKeys.DeltaRemovedEntries);
let currentParsedEntries = dataStore.getSet<Entry>(RedisKeys.CurrentParsedEntries);
let lastParsedEntries = dataStore.getSet<Entry>(RedisKeys.LastParsedEntries);

let filmlisteManager = new FilmlisteManager(filmlisteArchive, indexedFilmlists, entriesToBeAdded, entriesToBeRemoved, deltaAddedEntries, deltaRemovedEntries, currentParsedEntries, lastParsedEntries);

let loop = async () => {
  await filmlisteManager.update();
  setTimeout(() => loop(), 3 * 60 * 1000);
}

(async () => {
  await filmlisteManager.buildArchive(30);

  console.log('buildArchive end - loop');
  setImmediate(() => loop());
})();
