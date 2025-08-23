import EventEmitter from 'node:events';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';

import got, { type Progress } from 'got';
import lzma from 'lzma-native';

import { config } from './config';
import { MediathekIndexer } from './MediathekIndexer';
import { StateEmitter } from './StateEmitter';
import * as utils from './utils';
import { getValkeyClient, ValkeyClient } from './ValKey';

export class MediathekManager extends EventEmitter {
  stateEmitter: StateEmitter;
  mediathekIndexer: MediathekIndexer;
  valkey: ValkeyClient;

  constructor() {
    super();

    this.stateEmitter = new StateEmitter(this);
    this.mediathekIndexer = new MediathekIndexer(config.opensearch);
    this.valkey = getValkeyClient();

    this.mediathekIndexer.on('state', (state) => {
      this.stateEmitter.setState(state);
    });
  }

  async getCurrentFilmlisteTimestamp(): Promise<number> {
    try {
      const timestamp = await this.valkey.get('mediathekIndexer:currentFilmlisteTimestamp');
      return Number(timestamp) || 0;
    }
    catch {
      return 0;
    }
  }

  async getRandomFilmlisteMirror(): Promise<string> {
    this.stateEmitter.setState('step', 'getRandomFilmlisteMirror');
    return 'https://liste.mediathekview.de/Filmliste-akt.xz';
  }

  async checkUpdateAvailable(tries = 3): Promise<string | null> {
    this.stateEmitter.setState({
      step: 'checkUpdateAvailable',
      try: 4 - tries
    });

    const mirror = await this.getRandomFilmlisteMirror();
    const filmlisteTimestamp = await this.getCurrentFilmlisteTimestamp();

    try {
      const response = await fetch(mirror, { method: 'HEAD' });

      if (!response.ok) {
        throw new Error(`Non-200 status code: ${response.status}`);
      }

      const lastModifiedHeader = response.headers.get('last-modified');

      if (lastModifiedHeader == undefined) {
        throw new Error('Server-Response had no last-modified header');
      }

      const lastModified = Math.floor(new Date(lastModifiedHeader).getTime() / 1000);
      const tolerance = 40 * 60;
      const available = (lastModified - filmlisteTimestamp) >= tolerance;

      this.stateEmitter.setState({ step: 'checkUpdateAvailable', try: 4 - tries, available });

      return available ? mirror : null;
    }
    catch (error) {
      if (tries > 0) {
        await utils.timeout(1000);
        return this.checkUpdateAvailable(tries - 1);
      }

      throw error;
    }
  }

  async updateFilmlisteIfUpdateAvailable(): Promise<boolean> {
    const mirror = await this.checkUpdateAvailable();
    const updateAvailable = mirror != null;

    if (updateAvailable) {
      await this.updateFilmliste(mirror);
    }

    return updateAvailable;
  }

  async updateFilmliste(mirror: string): Promise<void> {
    this.stateEmitter.setState('step', 'updateFilmliste');

    const filmlisteFilename = `${Date.now()}-${Math.round(Math.random() * 100000)}`;
    const file = path.join(config.dataDirectory, filmlisteFilename);

    try {
      await this.downloadFilmliste(mirror, file);
      await this.mediathekIndexer.indexFilmliste(file);
    }
    finally {
      try {
        await fs.unlink(file);
      }
      catch (error) {
        console.error(`Failed to delete temporary file: ${file}`, error);
      }
    }
  }

  async downloadFilmliste(mirror: string, file: string): Promise<void> {
    this.stateEmitter.setState('step', 'downloadFilmliste');

    const fileHandle = await fs.open(file, 'w');
    const fileStream = fileHandle.createWriteStream({ autoClose: true });
    const decompressor = lzma.createDecompressor();
    const downloadStream = got.stream(mirror);

    const startTime = Date.now();

    let lastStateUpdate = 0;
    let state = {
      progress: '0%',
      speed: '0 B/s',
      transferred: '0 B / 0 B',
      elapsed: '0 s',
      remaining: '0 s'
    };

    downloadStream.on('downloadProgress', (progress: Progress) => {
      const now = Date.now();
      const total = progress.total ?? 0;
      const elapsed = (now - startTime) / 1000;
      const speed = progress.transferred / elapsed;
      const remainingTime = total ? (total - progress.transferred) / speed : 0;

      state = {
        progress: utils.formatPercent(progress.percent),
        speed: `${utils.formatBytes(speed, 2)}/s`,
        transferred: `${utils.formatBytes(progress.transferred, 2)} / ${utils.formatBytes(total, 2)}`,
        elapsed: utils.formatDuration(elapsed),
        remaining: utils.formatDuration(remainingTime),
      };

      if (now - lastStateUpdate > 1000) {
        lastStateUpdate = now;
        this.stateEmitter.updateState(state);
      }
    });

    try {
      await pipeline(
        downloadStream,
        decompressor,
        fileStream
      );

      this.stateEmitter.updateState(state);
    }
    catch (error) {
      console.error('Download pipeline failed', error);
      throw error;
    }
    finally {
      await fileHandle.close().catch(e => console.error("Failed to close file handle on error", e));
    }
  }
}
