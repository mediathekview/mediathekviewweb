import { ServiceBase } from './service-base';
import { Service } from './service';
import { FilmlistManager } from '../entry-source/filmlist/filmlist-manager';
import { InstanceProvider } from '../instance-provider';

export class FilmlistManagerService extends ServiceBase implements Service {
  private filmlistManager: FilmlistManager;

  serviceName: string = 'FilmlistImporter';

  protected async _initialize(): Promise<void> {
    this.filmlistManager = await InstanceProvider.filmlistManager();
  }

  protected async _run(): Promise<void> {
    await this.filmlistManager.run();
  }

  protected async _stop(): Promise<void> {
    await this.filmlistManager.stop();
  }
}
