import bodyParser from 'body-parser';
import compression from 'compression';
import express from 'express';
import fs from 'fs';
import http from 'http';
import PiwikTracker from 'matomo-tracker';
import moment from 'moment';
import path from 'path';
import REDIS from 'redis';
import request from 'request';
import URL from 'url';
import config from './config';
import MediathekManager from './MediathekManager';
import RSSFeedGenerator from './RSSFeedGenerator';
import SearchEngine from './SearchEngine';
import * as utils from './utils';

(async () => {
  var redis = REDIS.createClient(config.redis);
  redis.on('error', (err) => console.error(err));

  if (config.piwik.enabled) {
    var piwik = new PiwikTracker(config.piwik.siteId, config.piwik.piwikUrl);

    var origTrack = piwik.track.bind(piwik);
    piwik.track = (options) => {
      if (options.action_name != 'index') {
        return;
      }

      origTrack(options);
    }
  }

  var app = express();
  var httpServer = new http.Server(app);
  var io = require('socket.io')(httpServer);

  var elasticsearchSettings = JSON.stringify(config.elasticsearch);

  var searchEngine = new SearchEngine(elasticsearchSettings);
  await searchEngine.waitForConnection();

  var mediathekManager = new MediathekManager();
  var rssFeedGenerator = new RSSFeedGenerator(searchEngine);

  var indexing = false;
  var lastIndexingState;
  var filmlisteTimestamp = 0;

  process.on('SIGTERM', () => httpServer.close(() => process.exit(0)));

  mediathekManager.on('state', (state) => {
    console.log();
    console.log(state);
    console.log();
  });

  mediathekManager.getCurrentFilmlisteTimestamp((timestamp) => {
    filmlisteTimestamp = timestamp;
  });

  if (!!piwik) {
    piwik.on('error', function (err) {
      console.error('piwik: error tracking request: ', err)
    });
  }

  app.use(compression());

  app.use((request, response, next) => {
    const webSocketSource = (request.protocol === 'http' ? 'ws://' : 'wss://') + request.hostname;

    response.set({
      'Content-Security-Policy': `default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self'; font-src 'self' data:; connect-src 'self' ${webSocketSource}; media-src *; base-uri 'none'; form-action 'none'; frame-ancestors 'none';`,
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    });

    next();
  });

  console.log(path.join(__dirname, '/client/static'));

  app.use('/static', express.static(path.join(__dirname, '/client/static')));
  app.use('/api', bodyParser.text());

  app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '/client/index.html'));
  });
  app.get('/donate', function (req, res) {
    res.sendFile(path.join(__dirname, '/client/donate.html'));
  });
  app.get('/impressum', function (req, res) {
    res.sendFile(path.join(__dirname, '/client/impressum.html'));
  });
  app.get('/datenschutz', function (req, res) {
    res.sendFile(path.join(__dirname, '/client/datenschutz.html'));
  });

  app.get('/stats', function (req, res) {
    res.send(`Socket.io connections: ${io.engine.clientsCount}`);
  });

  app.get('/feed', function (req, res) {
    rssFeedGenerator.createFeed(req.protocol + '://' + req.get('host') + req.originalUrl, (err, result) => {
      if (err) {
        res.status(500).send(err.message);
      } else {
        res.set('Content-Type', 'application/rss+xml');
        res.send(result);

        if (!!piwik) {
          piwik.track({
            token_auth: config.piwik.token_auth,
            url: config.piwik.siteUrl + (config.piwik.siteUrl.endsWith('/') ? '' : '/'),
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

      if (!!piwik) {
        piwik.track({
          token_auth: config.piwik.token_auth,
          url: config.piwik.siteUrl + (config.piwik.siteUrl.endsWith('/') ? '' : '/'),
          uid: 'api',
          action_name: 'api-channels'
        });
      }
    });
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

    let begin = process.hrtime();
    searchEngine.search(query, (result, err) => {
      let end = process.hrtime(begin);

      if (err) {
        if (err[0] == 'cannot query while indexing') {
          res.status(503);
        } else {
          res.status(500);
        }

        res.json({
          result: result,
          err: err
        });
        return;
      }

      let searchEngineTime = (end[0] * 1e3 + end[1] / 1e6).toFixed(2);

      let queryInfo = {
        filmlisteTimestamp: filmlisteTimestamp,
        searchEngineTime: searchEngineTime,
        resultCount: result.result.length,
        totalResults: result.totalResults
      };

      res.status(200).json({
        result: {
          results: result.result,
          queryInfo: queryInfo
        },
        err: null
      });

      if (!!piwik) {
        piwik.track({
          token_auth: config.piwik.token_auth,
          url: config.piwik.siteUrl + (config.piwik.siteUrl.endsWith('/') ? '' : '/'),
          uid: 'api',
          action_name: 'api-query'
        });
      }

      console.log(moment().format('HH:mm') + ' - api used');
    });
  });

  io.on('connection', (socket) => {
    var clientIp = socket.request.headers['x-forwarded-for'] || socket.request.connection.remoteAddress.match(/(\d+\.?)+/g)[0];
    var socketUid = null;

    console.log('client connected, ip: ' + clientIp);

    if (indexing && lastIndexingState != null) {
      socket.emit('indexState', lastIndexingState);
    }

    socket.on('getContentLength', (url, callback) => {
      redis.hget('mvw:contentLengthCache', url, (err, result) => {
        if (result) {
          callback(result);
        } else {
          request.head(url, (error, response) => {
            let contentLength = -1;

            if (!!response && !!response.headers['content-length']) {
              contentLength = response.headers['content-length'];
            }

            callback(contentLength);
            redis.hset('mvw:contentLengthCache', url, contentLength.toString());
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
      socket.emit('uid', utils.randomValueBase64(32));
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

      if (!!piwik) {
        if (!(typeof data.href === 'string' || data.href instanceof String)) {
          return;
        }

        let host = URL.parse(data.href).hostname;
        let siteHost = URL.parse(config.piwik.siteUrl).hostname;
        if (siteHost != host) {
          return;
        }

        piwik.track({
          token_auth: config.piwik.token_auth,
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
      fs.readFile(path.join(__dirname, '/client/impressum.html'), 'utf-8', (err, data) => {
        if (err) {
          callback(err.message);
        } else {
          callback(data);
        }
      });
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
    let begin = process.hrtime();
    searchEngine.search(query, (result, err) => {
      let end = process.hrtime(begin);

      if (err) {
        callback(result, err);
        return;
      }

      let searchEngineTime = (end[0] * 1e3 + end[1] / 1e6).toFixed(2);

      let queryInfo = {
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

  function updateLoop() {
    mediathekManager.updateFilmlisteIfUpdateAvailable((err) => {
      if (err) {
        console.error(err);
      } else {
        mediathekManager.getCurrentFilmlisteTimestamp((timestamp) => {
          filmlisteTimestamp = timestamp;
        });
      }

      setTimeout(() => updateLoop(), 10 * 60 * 1000);
    });
  }

  if (config.index) {
    setImmediate(() => updateLoop());
  }
})();