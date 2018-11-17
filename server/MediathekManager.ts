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

    return callback(null, 'https://verteiler.mediathekviewweb.de/Filmliste-akt.xz');

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
              const available = (lastModified - filmlisteTimestamp) >= tolerance;

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
        this.updateFilmliste(mirror, (err) => {
          if (err) {
            callback(err, false);
          } else {
            callback(null, true);
          }
        });
      } else {
        callback(null, false);
      }
    });
  }

  updateFilmliste(mirror, callback) {
    this.stateEmitter.setState('step', 'updateFilmliste');

    const file = path.join(config.dataDirectory, 'newFilmliste');

    this.downloadFilmliste(mirror, file, (error) => {
      if (error) {
        callback(error);
      } else {
        this.mediathekIndexer.indexFilmliste(file, (error) => {
          if (error) {
            callback(error);
          } else {
            callback(null);
          }

          fs.unlink(file, (error) => {
            console.error(error);
          })
        });
      }
    });
  }

  downloadFilmliste(mirror, file, callback) {
    this.stateEmitter.setState('step', 'downloadFilmliste');
    fs.open(file, 'w', (err, fd) => {
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
        callback(err);
      });

      req.on('error', (err) => {
        fs.close(fd, () => {
          callback(err);
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
      req.pipe(decompressor).pipe(fileStream).on('finish', () => {
        fs.close(fd, () => {
          callback(null);
        });
      });
    });
  }
}
