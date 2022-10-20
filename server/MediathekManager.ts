import EventEmitter from 'events';
import fs from 'fs';
import lzma from 'lzma-native';
import path from 'path';
import request from 'request';
import requestProgress from 'request-progress';
import { promisify } from 'util';
import config from './config';
import MediathekIndexer from './MediathekIndexer';
import { getRedisClient, RedisClient } from './Redis';
import StateEmitter from './StateEmitter';
import * as utils from './utils';

const open = promisify(fs.open);
const close = promisify(fs.close);
const unlink = promisify(fs.unlink);

export default class MediathekManager extends EventEmitter {
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

  getCurrentFilmlisteTimestamp(callback) {
    this.redis.get('mediathekIndexer:currentFilmlisteTimestamp')
      .then((reply) => callback(reply))
      .catch(() => callback(0));
  }

  getRandomFilmlisteMirror(callback) {
    this.stateEmitter.setState('step', 'getRandomFilmlisteMirror');
    return callback(null, 'https://liste.mediathekview.de/Filmliste-akt.xz');
  }

  checkUpdateAvailable(callback, tries = 3) {
    this.stateEmitter.setState({
      step: 'checkUpdateAvailable',
      try: 4 - tries
    });

    this.getRandomFilmlisteMirror((err, mirror) => {
      if (err) {
        callback(err, null);
      } else {
        this.getCurrentFilmlisteTimestamp((filmlisteTimestamp) => {
          request.head(mirror, (err, response, body) => {
            if (err) {
              if (tries > 0) {
                this.checkUpdateAvailable(callback, tries - 1);
              } else {
                callback(err, null);
              }
            } else if (response.statusCode == 200 && response.headers['last-modified'] != undefined) {
              const lastModified = Math.floor(new Date(response.headers['last-modified']).getTime() / 1000);
              const tolerance = 25 * 60; //25 minutes, as not all mirrors update at same time
              const hour = Math.floor(lastModified / 3600) % 24;
              const available = /* (hour % 2 != 0) && */ ((lastModified - filmlisteTimestamp) >= tolerance); //only uneven hours (UTC) because only they contain BR

              this.stateEmitter.setState({
                step: 'checkUpdateAvailable',
                try: 4 - tries,
                available
              });

              callback(null, available ? mirror : null);
            } else if (response.statusCode != 200) {
              if (tries > 0) {
                this.checkUpdateAvailable(callback, tries - 1);
              } else {
                callback(new Error('Error statuscode: ' + response.statusCode), null);
              }
            } else if (response.headers['last-modified'] == undefined) {
              if (tries > 0) {
                this.checkUpdateAvailable(callback, tries - 1);
              } else {
                callback(new Error('Server-Response had no last-modified header'), null);
              }
            }
          });
        });
      }
    });
  }

  updateFilmlisteIfUpdateAvailable(callback) {
    this.checkUpdateAvailable((err, mirror) => {
      if (err) {
        callback(err, false);
      } else if (mirror != null) {
        this.updateFilmliste(mirror)
          .then(() => callback(null, true))
          .catch((error) => callback(error, false));
      } else {
        callback(null, false);
      }
    });
  }

  async updateFilmliste(mirror): Promise<void> {
    this.stateEmitter.setState('step', 'updateFilmliste');

    var filemlisteFilename = Date.now().toString() + Math.round(Math.random() * 100000).toString();

    const file = path.join(config.dataDirectory, filemlisteFilename);

    await this.downloadFilmliste(mirror, file);

    try {
      await this.mediathekIndexer.indexFilmliste(file);
    }
    finally {
      try {
        await unlink(file);
      }
      catch (error) {
        console.error(error)
      }
    }
  }

  async downloadFilmliste(mirror, file): Promise<void> {
    this.stateEmitter.setState('step', 'downloadFilmliste');

    const fd = await open(file, 'w');

    return new Promise<void>((resolve, reject) => {
      const fileStream = fs.createWriteStream(null, {
        fd: fd,
        autoClose: true
      });

      const req = requestProgress(request.get(mirror), {
        throttle: 500
      });

      fileStream.on('error', (err) => {
        req.abort();
        fs.close(fd, () => { });
        reject(err);
      });

      req.on('error', (err) => {
        fs.close(fd, () => {
          reject(err);
        });
      });

      req.on('progress', (state) => {
        this.stateEmitter.updateState({
          progress: state.percent,
          speed: utils.formatBytes(state.speed, 2) + '/s',
          transferred: utils.formatBytes(state.size.transferred, 2) + ' / ' + utils.formatBytes(state.size.total, 2),
          elapsed: state.time.elapsed + ' seconds',
          remaining: state.time.remaining + ' seconds'
        });
      });

      const decompressor = lzma.createDecompressor();
      req.pipe(decompressor).pipe(fileStream).on('finish', async () => {
        try {
          await close(fd);
        }
        catch (error) {
          console.error(error);
        }

        resolve(null);
      });
    });
  }
}
