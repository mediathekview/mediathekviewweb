import lzma from 'lzma-native';
import EventEmitter from 'events';
import config from './config.js';
import fs from 'fs';
import path from 'path';
import request from 'request';
import MediathekIndexer from './MediathekIndexer';
import REDIS from 'redis';
import StateEmitter from './StateEmitter.js';
import requestProgress from 'request-progress';
import * as utils from './utils';
import { promisify } from 'util';

const open = promisify(fs.open);
const close = promisify(fs.close);
const unlink = promisify(fs.unlink);

export default class MediathekManager extends EventEmitter {
  stateEmitter: StateEmitter;
  mediathekIndexer: MediathekIndexer;
  redis: REDIS.RedisClient;

  constructor() {
    super();

    this.stateEmitter = new StateEmitter(this);
    this.mediathekIndexer = new MediathekIndexer(config.elasticsearch);
    this.redis = REDIS.createClient(config.redis);

    this.mediathekIndexer.on('state', (state) => {
      this.stateEmitter.setState(state);
    });
  }

  getCurrentFilmlisteTimestamp(callback) {
    this.redis.get('mediathekIndexer:currentFilmlisteTimestamp', (err, reply) => {
      if (!err) {
        callback(reply);
      } else {
        callback(0);
      }
    });
  }

  getRandomFilmlisteMirror(callback) {
    this.stateEmitter.setState('step', 'getRandomFilmlisteMirror');

    return callback(null, 'https://liste.mediathekview.de/Filmliste-akt.xz');

    request.get('https://res.mediathekview.de/akt.xml', (err, response, body) => {
      if (err) {
        callback(err, null);
      } else if (response.statusCode == 200) {
        const filmlisteUrlRegex = /<URL>\s*(.*?)\s*<\/URL>/g;
        const urlMatches = [];

        let match;
        while ((match = filmlisteUrlRegex.exec(body)) !== null) {
          urlMatches.push(match);
        }

        const url = urlMatches[Math.floor(Math.random() * urlMatches.length)][1];

        callback(null, url);
      } else {
        callback(new Error('Error statuscode: ' + response.statusCode), null);
      }
    });
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
              const available = (hour % 2 != 0) && ((lastModified - filmlisteTimestamp) >= tolerance); //only uneven hours (UTC) because only they contain BR

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
