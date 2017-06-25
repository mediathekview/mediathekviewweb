import { IFilmliste, IFilmlisteArchive, BatchType } from './interfaces';
import { ISet, ISortedSet, AggregationMode } from './data-store';
import { Entry } from './model';

export class FilmlisteManager {
  private filmlisteArchive: IFilmlisteArchive;
  private indexedFilmlists: ISet<number>;
  private entriesToBeAdded: ISortedSet<Entry>;
  private entriesToBeRemoved: ISortedSet<Entry>;
  private deltaAddedEntries: ISortedSet<Entry>;
  private deltaRemovedEntries: ISortedSet<Entry>;
  private currentParsedEntries: ISortedSet<Entry>;
  private lastParsedEntries: ISortedSet<Entry>;

  private currentFilmlisteTimestamp: number;

  constructor(filmlisteArchive: IFilmlisteArchive, indexedFilmlists: ISet<number>, entriesToBeAdded: ISortedSet<Entry>, entriesToBeRemoved: ISortedSet<Entry>, deltaAddedEntries: ISortedSet<Entry>, deltaRemovedEntries: ISortedSet<Entry>, currentParsedEntries: ISortedSet<Entry>, lastParsedEntries: ISortedSet<Entry>) {
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
    return new Promise<void>(async (resolve, reject) => {
      console.log('getEntries');
      this.currentFilmlisteTimestamp = await filmliste.getTimestamp();

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
      this.currentParsedEntries.diff(this.deltaAddedEntries, [this.lastParsedEntries]),
      this.lastParsedEntries.diff(this.deltaRemovedEntries, [this.currentParsedEntries]),
      this.deltaAddedEntries.union(this.entriesToBeAdded, [this.entriesToBeAdded]),
      this.deltaRemovedEntries.union(this.entriesToBeRemoved, [this.entriesToBeRemoved]),
      this.currentParsedEntries.move(this.lastParsedEntries)
    ]);
  }

  private async handleBatch(batch: BatchType) {
    let sortedSetMembers = batch.data.map((entry) => ({ member: entry, score: this.currentFilmlisteTimestamp }));
    await this.currentParsedEntries.addWithScore(...sortedSetMembers);

    batch.next();
  }

  private async handleComplete(filmliste: IFilmliste) {
    let timestamp = await filmliste.getTimestamp();
    //await this.createDelta();
    await this.indexedFilmlists.add(timestamp);
  }

  private async sortFilmlistsDescending(filmlists: IFilmliste[]): Promise<IFilmliste[]> {
    let sorted: { timestamp: number, filmliste: IFilmliste }[] = [];

    for (let i = 0; i < filmlists.length; i++) {
      let timestamp = await filmlists[i].getTimestamp();
      sorted.push({ timestamp: timestamp, filmliste: filmlists[i] });
    }

    sorted.sort((a, b) => b.timestamp - a.timestamp);

    return sorted.map((i) => i.filmliste);
  }
}
