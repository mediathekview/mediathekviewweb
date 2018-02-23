import { EntriesImporter } from './entries-importer/importer';
import { EntrySource } from './entry-source';
import { InstanceProvider } from './instance-provider';
import { FilmlistEntrySource } from './entry-source/filmlist/filmlist-entry-source';

export class MediathekViewWebImporter {
  private importer: EntriesImporter | null;
  private sources: EntrySource[];
  private prepares: (() => void | Promise<void>)[];
  private started: boolean;

  constructor() {
    this.importer = null;
    this.sources = [];
    this.prepares = [];
    this.started = false;
  }

  async initialize() {
    if (this.importer == null) {
      const datastoreFactory = await InstanceProvider.datastoreFactory();
      const queueProvider = await InstanceProvider.queueProvider();
      const entryRepository = await InstanceProvider.entryRepository();

      this.importer = new EntriesImporter(entryRepository, datastoreFactory);

      const filmlistEntrySource = new FilmlistEntrySource(datastoreFactory, queueProvider);
      this.prepares.push(() => filmlistEntrySource.run());

      this.sources.push(filmlistEntrySource);
    }
  }

  async run() {
    if (this.importer == null) {
      throw new Error('not initialized');
    }

    if (this.started) {
      throw new Error('already called run');
    }

    if (this.sources.length == 0) {
      throw new Error('no source available');
    }

    this.started = true;

    await this.callPrepares();
    await this.importSources();
  }

  private async callPrepares(): Promise<void> {
    for (const prepare of this.prepares) {
      await prepare();
    }
  }

  private async importSources(): Promise<void> {
    const promises: Promise<void>[] = [];

    for (const source of this.sources) {
      const promise = this.importer!.import(source);
      promises.push(promise);
    }

    await Promise.all(promises);
  }
}
