import { EntriesImporter } from './entries-importer/importer';
import { EntrySource } from './entry-source';
import { InstanceProvider } from './instance-provider';

export class MediathekViewWebImporter {
  private importer: EntriesImporter | null;
  private sources: EntrySource[];
  private started: boolean;

  constructor() {
    this.importer = null;
    this.sources = [];
    this.started = false;
  }

  async initialize() {
    if (this.importer == null) {
      this.importer = await InstanceProvider.entriesImporter();
      
      const filmlistEntrySource = await InstanceProvider.filmlistEntrySource();
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

    await this.importSources();
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

