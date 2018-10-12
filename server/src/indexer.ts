import { EntriesIndexer } from './entries-indexer/indexer';
import { InstanceProvider } from './instance-provider';

export class MediathekViewWebIndexer {
  private indexer: EntriesIndexer | null;
  private running: boolean;

  constructor() {
    this.indexer = null;
    this.running = false;
  }

  async initialize() {
    if (this.indexer == null) {
      this.indexer = await InstanceProvider.entriesIndexer();
    }
  }

  async run() {
    console.log('in 1. run')
    if (this.indexer == null) {
      throw new Error('not initialized');
    }

    if (this.running) {
      throw new Error('already running');
    }

    this.running = true;
    console.log('before 2. run')
    await this.indexer.run();
    this.running = false;
  }
}
