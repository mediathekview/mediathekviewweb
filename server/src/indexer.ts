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
      const datastoreFactory = await InstanceProvider.datastoreFactory();
      const lockProvider = await InstanceProvider.lockProvider();
      const aggregatedEntryRepository = await InstanceProvider.aggregatedEntryRepository();
      const entrySearchEngine = await InstanceProvider.entrySearchEngine();

      this.indexer = new EntriesIndexer(aggregatedEntryRepository, entrySearchEngine, lockProvider, datastoreFactory);
    }
  }

  async run() {
    if (this.indexer == null) {
      throw new Error('not initialized');
    }

    if (this.running) {
      throw new Error('already running');
    }

    this.running = true;
    await this.indexer.run();
    this.running = false;
  }
}
