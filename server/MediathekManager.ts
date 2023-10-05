import EventEmitter from 'events';
import fs from 'fs/promises';
import lzma from 'lzma-native';
import path from 'path';
import request from 'request';
import requestProgress from 'request-progress';
import { config } from './config';
import { MediathekIndexer } from './MediathekIndexer';
import { getRedisClient, RedisClient } from './Redis';
import { StateEmitter } from './StateEmitter';
import * as utils from './utils';

export class MediathekManager extends EventEmitter {
  stateEmitter: StateEmitter;
  mediathekIndexer: MediathekIndexer;
  redis: RedisClient;

  constructor() {
    super();

    this.stateEmitter = new StateEmitter(this);
    this.mediathekIndexer = new MediathekIndexer(config.elasticsearch);
    this.redis = getRedisClient();

    this.mediathekIndexer.on('state', (state) => {
      this.stateEmitter.setState(state);
    });
  }

  async getCurrentFilmlisteTimestamp(): Promise<number> {
    try {
      const timestamp = await this.redis.get('mediathekIndexer:currentFilmlisteTimestamp')
      return Number(timestamp);
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

      if (response.status != 200) {
        throw new Error('Non 200 status code.');
      }

      const lastModifiedHeader = response.headers.get('last-modified');

      if (lastModifiedHeader == undefined) {
        throw new Error('Server-Response had no last-modified header');
      }

      const lastModified = Math.floor(new Date(lastModifiedHeader).getTime() / 1000);
      const tolerance = 30 * 60; // 30 minutes, as not all mirrors update at same time
      const available = ((lastModified - filmlisteTimestamp) >= tolerance);

      this.stateEmitter.setState({ step: 'checkUpdateAvailable', try: 4 - tries, available });

      return available ? mirror : null;
    }
    catch (error) {
      if (tries > 0) {
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

  async updateFilmliste(mirror): Promise<void> {
    this.stateEmitter.setState('step', 'updateFilmliste');

    var filemlisteFilename = Date.now().toString() + Math.round(Math.random() * 100000).toString();

    const file = path.join(config.dataDirectory, filemlisteFilename);

    try {
      await this.downloadFilmliste(mirror, file);
      await this.mediathekIndexer.indexFilmliste(file);
    }
    finally {
      try {
        await fs.unlink(file);
      }
      catch (error) {
        console.error(error)
      }
    }
  }

  async downloadFilmliste(mirror, file): Promise<void> {
    this.stateEmitter.setState('step', 'downloadFilmliste');

    const fileHandle = await fs.open(file, 'w');

    return new Promise<void>((resolve, reject) => {
      const fileStream = fileHandle.createWriteStream({ autoClose: true });

      const req = requestProgress(request.get(mirror), {
        throttle: 500
      });

      fileStream.on('error', (err) => {
        req.abort();
        void fileHandle.close();
        reject(err);
      });

      req.on('error', (err) => {
        fileHandle.close()
          .then(() => reject(err))
          .catch(() => reject(err));
      });

      req.on('progress', (state) => {
        this.stateEmitter.updateState({
          progress: utils.formatPercent(state.percent),
          speed: utils.formatBytes(state.speed, 2) + '/s',
          transferred: utils.formatBytes(state.size.transferred, 2) + ' / ' + utils.formatBytes(state.size.total, 2),
          elapsed: utils.formatDuration(state.time.elapsed),
          remaining: utils.formatDuration(state.time.remaining)
        });
      });

      const decompressor = lzma.createDecompressor();

      req.pipe(decompressor).pipe(fileStream).on('finish', async () => {
        try {
          await fileHandle.close();
        }
        catch (error) {
          console.error(error);
        }

        resolve(null);
      });
    });
  }
}
