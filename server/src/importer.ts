import { ServiceBase } from './service-base';
import { EntriesImporter } from './entries-importer/importer';
import { EntrySource } from './entry-source';
import { InstanceProvider } from './instance-provider';
import { Service } from './service';
import { AsyncDisposer } from './common/disposable';

export class MediathekViewWebImporter extends ServiceBase implements Service {
  private disposer: AsyncDisposer;
  private importer: EntriesImporter;
  private sources: EntrySource[];

  readonly serviceName = 'Importer';

  constructor() {
    super();

    this.disposer = new AsyncDisposer();
  }

  protected async _initialize() {
    this.importer = await InstanceProvider.entriesImporter();

    this.sources = [
      await InstanceProvider.filmlistEntrySource()
    ];

    for (const source of this.sources) {
      this.disposer.addSubDisposables(source);
    }
  }

  protected async _run(): Promise<void> {
    if (this.sources.length == 0) {
      throw new Error('no source available');
    }

    await this.importSources();
  }

  protected async _stop(): Promise<void> {
    await this.disposer.dispose();
  }

  private async importSources(): Promise<void> {
    const promises: Promise<void>[] = [];

    for (const source of this.sources) {
      const promise = this.importer.import(source);
      promises.push(promise);
    }

    await Promise.all(promises);
  }
}

