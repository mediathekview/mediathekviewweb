import { FilmlistManager } from '../entry-source/filmlist/filmlist-manager';
import { InstanceProvider } from '../instance-provider';
import { MicroService } from '../service';
import { MicroServiceBase } from '../service-base';

export class FilmlistManagerService extends MicroServiceBase implements MicroService {
  private readonly filmlistManager: FilmlistManager;

  constructor() {
    super('FilmlistManager');

    this.filmlistManager = InstanceProvider.filmlistManager();
  }

  protected async _dispose(): Promise<void> {
    await this.filmlistManager.dispose();
  }

  protected async _initialize(): Promise<void> {
    await this.filmlistManager.initialize();
  }

  protected async _start(): Promise<void> {
    await this.filmlistManager.start();
  }

  protected async _stop(): Promise<void> {
    await this.filmlistManager.stop();
  }
}
