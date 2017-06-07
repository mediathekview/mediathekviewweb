import { FilmlisteManager } from './filmliste-manager';
import { MVWFilmlisteArchive } from './mvw-filmliste-archive';
import { DataStoreProvider } from './data-store/data-store-provider';

let filmlisteArchive = new MVWFilmlisteArchive();
let dataStore = DataStoreProvider.getDataStore();
let filmlisteManager = new FilmlisteManager(filmlisteArchive, dataStore);

let loop = async () => {
  await filmlisteManager.update();
  setTimeout(() => loop(), 3 * 60 * 1000);
}

(async () => {
  await filmlisteManager.buildArchive(30);

  console.log('buildArchive end - loop');
  setImmediate(() => loop());
})();
