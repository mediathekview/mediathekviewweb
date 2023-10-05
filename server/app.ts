import bodyParser from 'body-parser';
import compression from 'compression';
import express from 'express';
import fs from 'fs';
import http from 'http';
import MatomoTracker from 'matomo-tracker';
import moment from 'moment';
import path from 'path';
import request from 'request';
import * as SocketIO from 'socket.io';
import URL from 'url';
import { MediathekManager } from './MediathekManager';
import { RSSFeedGenerator } from './RSSFeedGenerator';
import { getRedisClient, initializeRedis } from './Redis';
import { SearchEngine } from './SearchEngine';
import { config } from './config';
import { renderImpressum } from './pages/impressum';

const impressum = renderImpressum(config.contact);

(async () => {
  await initializeRedis();
  const redis = getRedisClient();

  let matomo: MatomoTracker | null = null;

  if (config.matomo.enabled) {
    matomo = new MatomoTracker(config.matomo.siteId, config.matomo.matomoUrl);

    const origTrack = matomo.track.bind(matomo);
    matomo.track = (options) => {
      if (options.action_name != 'index') {
        return;
      }

      origTrack(options);
    }
  }

  const app = express();
  const httpServer = new http.Server(app);
  const io = new SocketIO.Server(httpServer);

  app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal']);

  process.on('SIGTERM', () => httpServer.close(() => process.exit(0)));

  const searchEngine = new SearchEngine(config.elasticsearch);
  await searchEngine.waitForConnection();

  const mediathekManager = new MediathekManager();
  const rssFeedGenerator = new RSSFeedGenerator(searchEngine);

  const indexing = false;
  let lastIndexingState;
  let filmlisteTimestamp = await mediathekManager.getCurrentFilmlisteTimestamp();

  mediathekManager.on('state', (state) => {
    if (state == null) {
      return;
    }

    console.log();
    console.log(state);
    console.log();
  });

  if (matomo != null) {
    matomo.on('error', function (err) {
      console.error('matomo: error tracking request: ', err)
    });
  }

  app.use(compression());

  app.use((request, response, next) => {
    const webSocketSource = (request.protocol === 'http' ? 'ws://' : 'wss://') + request.get('host');
    const orfCdn = 'https://apasfiis.sf.apa.at https://varorfvod.sf.apa.at';
    const srfCdn = 'https://hdvodsrforigin-f.akamaihd.net http://hdvodsrforigin-f.akamaihd.net https://srfvodhd-vh.akamaihd.net';

    response.set({
      // 'Content-Security-Policy': `default-src 'none'; script-src 'self'; worker-src 'self' blob:; style-src 'self' 'unsafe-inline'; img-src 'self'; font-src 'self' data:; connect-src 'self' ${webSocketSource} ${orfCdn} ${srfCdn}; media-src * blob:; base-uri 'none'; form-action 'none'; frame-ancestors 'none';`,
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer'
    });

    next();
  });

  app.use('/static', express.static(path.join(__dirname, '/client/static')));
  app.use('/api', bodyParser.text());

  app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '/client/index.html'));
  });

  app.get('/donate', function (req, res) {
    res.sendFile(path.join(__dirname, '/client/donate.html'));
  });

  app.get('/impressum', function (req, res) {
    res.send(impressum);
  });

  app.get('/ads.txt', function (req, res) {
    res.send(config.adsText);
  });

  app.get('/datenschutz', function (req, res) {
    res.sendFile(path.join(__dirname, '/client/datenschutz.html'));
  });

  app.get('/stats', function (req, res) {
    res.send(`Socket.io connections: ${io.sockets.sockets.size}`);
  });

  app.get('/feed', function (req, res) {
    rssFeedGenerator.createFeed(req.protocol + '://' + req.get('host') + req.originalUrl, (err, result) => {
      if (err) {
        res.status(500).send(err.message);
      } else {
        res.set('Content-Type', 'text/xml');
        res.send(result);

        if (!!matomo) {
          matomo.track({
            token_auth: config.matomo.token_auth,
            url: config.matomo.siteUrl + (config.matomo.siteUrl.endsWith('/') ? '' : '/'),
            uid: 'feed',
            action_name: 'feed'
          });
        }
      }
    });
  });

  app.get('/api/channels', (req, res) => {
    searchEngine.getChannels((error, channels) => {
      if (error == undefined) {
        error = null;
      }

      res.json({
        error: error,
        channels: channels
      });

      if (!!matomo) {
        matomo.track({
          token_auth: config.matomo.token_auth,
          url: config.matomo.siteUrl + (config.matomo.siteUrl.endsWith('/') ? '' : '/'),
          uid: 'api',
          action_name: 'api-channels'
        });
      }
    });
  });

  app.post('/api/entries', async (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');

    try {
      const ids = req.body;
      const entries = searchEngine.getEntries(ids);

      res.status(200).json({
        result: {
          results: entries
        },
        err: null
      });

      console.log(moment().format('HH:mm') + ' - entries api used');
    }
    catch (error) {
      res.status(400).json({
        result: null,
        err: [error.message]
      });
    }
  });

  app.post('/api/query', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');

    let query;
    try {
      query = JSON.parse(req.body);
    } catch (e) {
      res.status(400).json({
        result: null,
        err: [e.message]
      });
      return;
    }

    handleQuery(query, res);
  });

  app.get('/api/query', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');

    let query;
    try {
      query = JSON.parse(req.query.query as string);
    } catch (e) {
      res.status(400).json({
        result: null,
        err: [e.message]
      });
      return;
    }

    handleQuery(query, res);
  });

  function handleQuery(query: object, response: express.Response): void {
    const begin = process.hrtime();
    searchEngine.search(query, (result, err) => {
      const end = process.hrtime(begin);

      if (err) {
        if (err[0] == 'cannot query while indexing') {
          response.status(503);
        } else {
          response.status(500);
        }

        response.json({
          result: result,
          err: err
        });
        return;
      }

      const searchEngineTime = (end[0] * 1e3 + end[1] / 1e6).toFixed(2);

      const queryInfo = {
        filmlisteTimestamp: filmlisteTimestamp,
        searchEngineTime: searchEngineTime,
        resultCount: result.result.length,
        totalResults: result.totalResults
      };

      response.status(200).json({
        result: {
          results: result.result,
          queryInfo: queryInfo
        },
        err: null
      });

      if (!!matomo) {
        matomo.track({
          token_auth: config.matomo.token_auth,
          url: config.matomo.siteUrl + (config.matomo.siteUrl.endsWith('/') ? '' : '/'),
          uid: 'api',
          action_name: 'api-query'
        });
      }

      console.log(moment().format('HH:mm') + ' - search api used');
    });
  }

  io.on('connection', (socket) => {
    const clientIp = socket.request.headers['x-forwarded-for'] || socket.request.connection.remoteAddress.match(/(\d+\.?)+/g)[0];
    let socketUid = null;

    console.log('client connected, ip: ' + clientIp);

    socket.on('disconnect', () => {
      console.log('client disconnected, ip: ' + clientIp);
    });

    if (indexing && lastIndexingState != null) {
      socket.emit('indexState', lastIndexingState);
    }

    socket.on('getContentLength', (url, callback) => {
      redis.hGet('mvw:contentLengthCache', url).then((result) => {
        if (result) {
          callback(result);
        } else {
          request.head(url, (error, response) => {
            let contentLength = -1;

            if (!!response && !!response.headers['content-length']) {
              contentLength = response.headers['content-length'];
            }

            callback(contentLength);
            redis.hSet('mvw:contentLengthCache', url, contentLength.toString());
          });
        }
      });
    });

    socket.on('getDescription', (id, callback) => {
      if (indexing) {
        callback('cannot get description while indexing');
        return;
      }

      searchEngine.getDescription(id, callback);
    });

    socket.on('queryEntries', (query, callback) => {
      if (indexing) {
        callback({
          result: null,
          err: ['cannot query while indexing']
        });
        return;
      }

      queryEntries(query, (result, err) => {
        callback({
          result: result,
          err: err
        });
      });
    });

    function emitNewUid() {
      socket.emit('uid', crypto.randomUUID());
    }

    socket.on('requestUid', () => {
      emitNewUid();
    });

    socket.on('track', (data) => {
      if (!data.uid || data.uid.length != 32) {
        emitNewUid();
        return;
      }

      if (!socketUid) {
        socketUid = data.uid;
      } else if (data.uid != socketUid) {
        socket.emit('uid', socketUid);
        return;
      }

      if (!!matomo) {
        if (!(typeof data.href === 'string' || data.href instanceof String)) {
          return;
        }

        const host = URL.parse(data.href).hostname;
        const siteHost = URL.parse(config.matomo.siteUrl).hostname;
        if (siteHost != host) {
          return;
        }

        matomo.track({
          token_auth: config.matomo.token_auth,
          url: data.href,
          uid: socketUid,
          cip: clientIp,

          pv_id: data.pv_id,
          ua: data.ua,
          lang: data.lang,
          res: data.res,
          urlref: data.urlref,
          action_name: data.action_name,
          h: data.h,
          m: data.m,
          s: data.s,
          rand: data.rand
        });
      }
    });

    socket.on('getDonate', (callback) => {
      fs.readFile(path.join(__dirname, '/client/donate.html'), 'utf-8', (err, data) => {
        if (err) {
          callback(err.message);
        } else {
          callback(data);
        }
      });
    });

    socket.on('getImpressum', (callback) => {
      callback(impressum);
    });

    socket.on('getDatenschutz', (callback) => {
      fs.readFile(path.join(__dirname, '/client/datenschutz.html'), 'utf-8', (err, data) => {
        if (err) {
          callback(err.message);
        } else {
          callback(data);
        }
      });
    });
  });

  httpServer.listen(config.webserverPort, () => {
    console.log('server listening on *:' + config.webserverPort);
    console.log();
  });

  function queryEntries(query, callback) {
    const begin = process.hrtime();
    searchEngine.search(query, (result, err) => {
      const end = process.hrtime(begin);

      if (err) {
        callback(result, err);
        return;
      }

      const searchEngineTime = (end[0] * 1e3 + end[1] / 1e6).toFixed(2);

      const queryInfo = {
        filmlisteTimestamp: filmlisteTimestamp,
        searchEngineTime: searchEngineTime,
        resultCount: result.result.length,
        totalResults: result.totalResults
      };

      callback({
        results: result.result,
        queryInfo: queryInfo
      }, err);
    });
  }

  async function updateLoop() {
    try {
      const updated = await mediathekManager.updateFilmlisteIfUpdateAvailable();

      if (updated) {
        filmlisteTimestamp = await mediathekManager.getCurrentFilmlisteTimestamp();
      }
    }
    catch (error) {
      console.error(error);
    }
    finally {
      setTimeout(updateLoop, 3 * 60 * 1000).unref();
    }
  }

  if (config.index) {
    setImmediate(updateLoop);
  }
})();
