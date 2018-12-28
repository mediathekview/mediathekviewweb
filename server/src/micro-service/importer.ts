import { AsyncDisposer } from '../common/disposable';
import { EntriesImporter } from '../entries-importer/importer';
import { InstanceProvider } from '../instance-provider';
import { MicroService } from '../service';
import { MicroServiceBase } from '../service-base';

export class ImporterService extends MicroServiceBase implements MicroService {
  private disposer: AsyncDisposer;
  private importer: EntriesImporter;

  constructor() {
    super('Importer');

    this.disposer = new AsyncDisposer();
    this.importer = InstanceProvider.entriesImporter();

    this.disposer.addDisposeTasks(async () => await this.importer.dispose());
  }

  async _dispose(): Promise<void> {
    await this.disposer.dispose();
  }

  protected async _initialize(): Promise<void> {
    await this.importer.initialize();

    const source = InstanceProvider.filmlistEntrySource();
    await source.initialize();

    this.disposer.addDisposeTasks(async () => await source.dispose());
    this.importer.registerSources(source);
  }

  protected async _start(): Promise<void> {
    await this.importer.start();
  }

  protected async _stop(): Promise<void> {
    await this.importer.stop();
  }
}

