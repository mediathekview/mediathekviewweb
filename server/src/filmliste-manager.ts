import { IFilmliste, IFilmlisteArchive, BatchType } from './interfaces';
import { ISet } from './data-store';
import { Entry } from './model';

export class FilmlisteManager {
  private filmlisteArchive: IFilmlisteArchive;
  private indexedFilmlists: ISet<number>;
  private entriesToBeAdded: ISet<Entry>;
  private entriesToBeRemoved: ISet<Entry>;
  private deltaAddedEntries: ISet<Entry>;
  private deltaRemovedEntries: ISet<Entry>;
  private currentParsedEntries: ISet<Entry>;
  private lastParsedEntries: ISet<Entry>;

  constructor(filmlisteArchive: IFilmlisteArchive, indexedFilmlists: ISet<number>, entriesToBeAdded: ISet<Entry>, entriesToBeRemoved: ISet<Entry>, deltaAddedEntries: ISet<Entry>, deltaRemovedEntries: ISet<Entry>, currentParsedEntries: ISet<Entry>, lastParsedEntries: ISet<Entry>) {
    this.filmlisteArchive = filmlisteArchive;
    this.indexedFilmlists = indexedFilmlists;
    this.entriesToBeAdded = entriesToBeAdded;
    this.entriesToBeRemoved = entriesToBeRemoved;
    this.deltaAddedEntries = deltaAddedEntries;
    this.deltaRemovedEntries = deltaRemovedEntries;
    this.currentParsedEntries = currentParsedEntries;
    this.lastParsedEntries = lastParsedEntries;
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
          await this.handleComplete(filmliste);
          resolve();
        }
      });
    });
  }

  private async createDelta() {
    await Promise.all([
      this.currentParsedEntries.diff(this.deltaAddedEntries, this.lastParsedEntries),
      this.lastParsedEntries.diff(this.deltaRemovedEntries, this.currentParsedEntries),
      this.deltaAddedEntries.union(this.entriesToBeAdded, this.entriesToBeAdded),
      this.deltaRemovedEntries.union(this.entriesToBeRemoved, this.entriesToBeRemoved),
      this.currentParsedEntries.move(this.lastParsedEntries)
    ]);
  }

  private async handleBatch(batch: BatchType) {
    await this.currentParsedEntries.add(batch.data)

    batch.next();
  }

  private async handleComplete(filmliste: IFilmliste) {
    let timestamp = await filmliste.getTimestamp();
    await this.indexedFilmlists.add(timestamp);
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
