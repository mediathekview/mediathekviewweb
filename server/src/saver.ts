import { EntriesSaver } from './entries-saver/saver';
import { InstanceProvider } from './instance-provider';
import { ServiceBase } from './service-base';
import { Service } from './service';

export class MediathekViewWebSaver extends ServiceBase implements Service {
  private saver: EntriesSaver;

  serviceName = 'EntriesSaver';

  constructor() {
    super();
  }

  protected async _initialize(): Promise<void> {
    this.saver = await InstanceProvider.entriesSaver();
  }

  protected async _run(): Promise<void> {
    await this.saver.run();
  }

  protected async _stop(): Promise<void> {
    await this.saver.dispose();
  }
}
