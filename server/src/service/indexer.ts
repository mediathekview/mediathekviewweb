import { EntriesIndexer } from '../entries-indexer/indexer';
import { InstanceProvider } from '../instance-provider';
import { Service } from './service';
import { ServiceBase } from './service-base';

export class MediathekViewWebIndexer extends ServiceBase implements Service {
  private indexer: EntriesIndexer;

  serviceName: string = 'Indexer';

  constructor() {
    super();
  }

  protected async _initialize(): Promise<void> {
    this.indexer = await InstanceProvider.entriesIndexer();
  }

  protected async _run(): Promise<void> {
    await this.indexer.run();
  }

  protected async _stop(): Promise<void> {
    await this.indexer.dispose();
  }
}
