import { EntriesIndexer } from '../entries-indexer/indexer';
import { InstanceProvider } from '../instance-provider';
import { MicroService } from '../service';
import { MicroServiceBase } from '../service-base';

export class IndexerService extends MicroServiceBase implements MicroService {
  private indexer: EntriesIndexer;

  constructor() {
    super('Indexer');

    this.indexer = InstanceProvider.entriesIndexer();
  }

  protected async _dispose(): Promise<void> {
    await this.indexer.dispose();
  }

  protected async _initialize(): Promise<void> {
    await this.indexer.initialize();
  }

  protected async _start(): Promise<void> {
    await this.indexer.start();
  }

  protected async _stop(): Promise<void> {
    await this.indexer.stop();
  }
}
