import { MicroServiceBase } from '../service-base';
import { MicroService } from '../service';
import { EntriesSaver } from '../entries-saver/saver';
import { InstanceProvider } from '../instance-provider';

export class SaverService extends MicroServiceBase implements MicroService {
  private readonly entriesSaver: EntriesSaver;

  constructor() {
    super('Saver');

    this.entriesSaver = InstanceProvider.entriesSaver();
  }

  protected async _dispose(): Promise<void> {
    await this.entriesSaver.dispose();
  }

  protected async _initialize(): Promise<void> {
    await this.entriesSaver.initialize();
  }

  protected async _start(): Promise<void> {
    await this.entriesSaver.start();
  }

  protected async _stop(): Promise<void> {
    await this.entriesSaver.stop();
  }
}
