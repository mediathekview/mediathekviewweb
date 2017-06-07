import { IFilmliste, IFilmlisteArchive, BatchType } from './interfaces';
import { IDataStore, ISet } from './data-store';
import { RedisKeys } from './redis-keys';
import { Entry } from './model';

export class FilmlisteManager {
  private filmlisteArchive: IFilmlisteArchive;
  private dataStore: IDataStore;
  private indexedFilmlists: ISet<number>;
  private entries: ISet<Entry>;

  constructor(filmlisteArchive: IFilmlisteArchive, dataStore: IDataStore) {
    this.filmlisteArchive = filmlisteArchive;
    this.dataStore = dataStore;
    this.indexedFilmlists = this.dataStore.getSet<number>(RedisKeys.IndexedFilmlists);
    this.entries = this.dataStore.getSet<Entry>(RedisKeys.EntriesToBeIndexed);
  }

  async update() {
    console.log('update');
    let filmliste = await this.filmlisteArchive.getLatest();
    let timestamp = await filmliste.getTimestamp();

    if (await this.indexedFilmlists.has(timestamp)) {
      return;
    }

    await this.indexFilmliste(filmliste);
  }

  async buildArchive(days: number) {
    console.log('buildArchive');
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

  private async indexFilmliste(filmliste: IFilmliste) {
    console.log('indexFilmliste');
    return new Promise<void>((resolve, reject) => {
      filmliste.getEntries().subscribe({
        next: async (batch) => await this.handleBatch(batch),
        error: (error) => reject(error),
        complete: async () => {
          let timestamp = await filmliste.getTimestamp();
          await this.indexedFilmlists.add(timestamp);
          resolve();
        }
      });
    });
  }

  added = 0;
  private async handleBatch(batch: BatchType) {
    this.added += batch.data.length;
    console.log('parsed', this.added);

    await this.entries.add(...batch.data)

    batch.next();
  }

  private async sortFilmlistsDescending(filmlists: IFilmliste[]): Promise<IFilmliste[]> {
    console.log('sortFilmlistsDescending');
    let sorted: { timestamp: number, filmliste: IFilmliste }[] = [];

    for (let i = 0; i < filmlists.length; i++) {
      let timestamp = await filmlists[i].getTimestamp();
      sorted.push({ timestamp: timestamp, filmliste: filmlists[i] });
    }

    sorted.sort((a, b) => b.timestamp - a.timestamp);

    return sorted.map((i) => i.filmliste);
  }
}
