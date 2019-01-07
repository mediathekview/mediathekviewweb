import { AsyncDisposer } from '../common/disposable';
import { EntriesImporter } from '../entries-importer/importer';
import { InstanceProvider } from '../instance-provider';
import { MicroServiceBase } from '../micro-service-base';
import { MicroService } from '../service';

export class ImporterService extends MicroServiceBase implements MicroService {
  private readonly disposer: AsyncDisposer;
  private readonly importer: EntriesImporter;

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

