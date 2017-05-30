import { FilmlisteUtils } from './filmliste-utils';
import { IFilmliste, IFilmlisteArchive } from './interfaces';
import { IDataStore, DataStoreProvider, IBag, ISet } from './data-store';
import { Utils } from './utils';
import { Entry } from './model';

class FilmlisteManager {
  filmlisteArchive: IFilmlisteArchive;
  dataStore: IDataStore;
  indexedFilmlists: ISet<number>;
  entries: ISet<Entry>;

  constructor(filmlisteArchive: IFilmlisteArchive) {
    this.filmlisteArchive = filmlisteArchive;
    this.dataStore = DataStoreProvider.getDataStore();
    this.indexedFilmlists = this.dataStore.getSet<number>('indexedFilmlists');
    this.entries = this.dataStore.getSet<Entry>('entriesToBeIndexed');
  }

  async indexFilmliste(filmliste: IFilmliste) {
    filmliste.getEntries((entries) => {
      this.entries.add(...entries);
    }, async () => {
      let timestamp = await filmliste.getTimestamp();
      this.indexedFilmlists.add(timestamp);
    });
  }

  async buildArchive(days: number) {
    let date = new Date();
    let end = Math.floor(date.getTime() / 1000);
    date.setDate(date.getDate() - days);
    let begin = Math.floor(date.getTime() / 1000);

    let filmlists = await this.sortFilmlistsDescending(await this.filmlisteArchive.getRange(begin, end));


    for (let i = 0; i < filmlists.length; i++) {
      let filmliste = filmlists[i];
      let timestamp = await filmliste.getTimestamp();

      if (await this.indexedFilmlists.has(timestamp)) {
        continue;
      }

      await this.indexFilmliste(filmliste);
    }
  }

  async sortFilmlistsDescending(filmlists: IFilmliste[]): Promise<IFilmliste[]> {
    let sorted: { timestamp: number, filmliste: IFilmliste }[] = [];

    for (let i = 0; i < filmlists.length; i++) {
      let timestamp = await filmlists[i].getTimestamp();
      sorted.push({ timestamp: timestamp, filmliste: filmlists[i] });
    }

    sorted.sort((a, b) => b.timestamp - a.timestamp);

    return sorted.map((i) => i.filmliste);
  }

  async update() {

  }
}

async function loop() {
  try {
    let update = await FilmlisteUtils.checkUpdateAvailable();

    if (update.available) {

    }
  } catch (exception) {
    console.error(exception);
  }


  setTimeout(() => loop(), 2000);
}

loop();
