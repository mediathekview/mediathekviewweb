import { SearchEngine } from '../../search-engine/src/search-engine';
import { ISet } from './data-store';
import { Entry } from '../../model';
import { Utils } from './utils';

export class FilmlisteIndexer {
  private searchEngine: SearchEngine<Entry>;
  private entriesToBeAdded: ISet<Entry>;
  private entriesToBeRemoved: ISet<Entry>;

  private addedBatchBuffer: Entry[][] = [];
  private removedBatchBuffer: Entry[][] = [];

  constructor(searchEngine: SearchEngine<Entry>, entriesToBeAdded: ISet<Entry>, entriesToBeRemoved: ISet<Entry>) {
    this.searchEngine = searchEngine;
    this.entriesToBeAdded = entriesToBeAdded;
    this.entriesToBeRemoved = entriesToBeRemoved;
  }

  async index() {
    let timeout = Utils.promiseTimeout(this.fillBuffers(), 1000);

    if ((this.addedBatchBuffer.length < 0) && (this.removedBatchBuffer.length < 0)) {
      try {
        await timeout;
      } catch (err) {
        return;
      }
    }

    await this.addBatch();

    return this.index();
  }

  async addBatch(batch: Entry[]) {
    let ids: string[] = [];

    for (let i = 0; i < batch.length; i++) {
      ids[i] = batch[i].id;
    }

    await this.searchEngine.index(batch, ids);
  }

  async fillBuffers() {
    return Promise.race([
      this.fillAddedBuffer(),
      this.fillRemovedBuffer()
    ]);
  }

  async fillAddedBuffer() {
    if (this.addedBatchBuffer.length < 5) {
      let batch = await this.entriesToBeAdded.pop(100);

      if (batch.length > 0) {
        this.addedBatchBuffer.push(batch);
      }
    }
  }

  async fillRemovedBuffer() {
    if (this.removedBatchBuffer.length < 5) {
      let batch = await this.entriesToBeRemoved.pop(100);

      if (batch.length > 0) {
        this.removedBatchBuffer.push(batch);
      }
    }
  }
}
