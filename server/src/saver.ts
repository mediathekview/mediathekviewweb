import { EntriesSaver } from './entries-saver/saver';
import { InstanceProvider } from './instance-provider';

export class MediathekViewWebSaver {
  private saver: EntriesSaver | null;
  private running: boolean;

  constructor() {
    this.saver = null;
    this.running = false;
  }

  async initialize() {
    if (this.saver == null) {
      this.saver = await InstanceProvider.entriesSaver();
    }
  }

  async run() {
    if (this.saver == null) {
      throw new Error('not initialized');
    }

    if (this.running) {
      throw new Error('already running');
    }

    this.running = true;
    await this.saver.run();
    this.running = false;
  }
}
