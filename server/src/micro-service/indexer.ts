import { EntriesIndexer } from '../entries-indexer/indexer';
import { InstanceProvider } from '../instance-provider';
import { MicroServiceBase } from '../micro-service-base';
import { MicroService } from '../service';

export class IndexerService extends MicroServiceBase implements MicroService {
  private readonly indexer: EntriesIndexer;

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
