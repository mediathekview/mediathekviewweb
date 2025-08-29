import fs from 'node:fs';
import path from 'node:path';

import compression from 'compression';
import express from 'express';
import got from 'got';
import moment from 'moment';

import { MediathekManager } from './MediathekManager';
import { RSSFeedGenerator } from './RSSFeedGenerator';
import { getValkeyClient, initializeValkey } from './ValKey';
import { SearchEngine } from './SearchEngine';
import { config } from './config';

(async () => {
  await initializeValkey();
  const valkey = getValkeyClient();

  const app = express();

  const indexHtmlPath = path.join(__dirname, '/client/index.html');
  let indexHtmlContent: string;

  try {
    indexHtmlContent = fs.readFileSync(indexHtmlPath, 'utf-8');

    if (config.injectHtmlPath && config.injectHtmlPath.length > 0) {
      const injectHtml = fs.readFileSync(config.injectHtmlPath, 'utf-8');
      indexHtmlContent = indexHtmlContent.replace('</head>', `${injectHtml}\n</head>`);
    }
  }
  catch (error) {
    console.error(`Failed to read or process index.html: ${error}`);
    process.exit(1);
  }

  app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal']);

  const searchEngine = new SearchEngine(config.opensearch);
  await searchEngine.waitForConnection();

  const mediathekManager = new MediathekManager();
  const rssFeedGenerator = new RSSFeedGenerator(searchEngine);

  let filmlisteTimestamp = await mediathekManager.getCurrentFilmlisteTimestamp();

  mediathekManager.on('state', (state) => {
    if (state == null) {
      return;
    }

    console.log();
    console.log(state);
    console.log();
  });

  app.use(compression());

  app.use((request, response, next) => {
    // const webSocketSource = (request.protocol === 'http' ? 'ws://' : 'wss://') + request.get('host');
    // const orfCdn = 'https://apasfiis.sf.apa.at https://varorfvod.sf.apa.at';
    // const srfCdn = 'https://hdvodsrforigin-f.akamaihd.net http://hdvodsrforigin-f.akamaihd.net https://srfvodhd-vh.akamaihd.net';

    response.set({
      // 'Content-Security-Policy': `default-src 'none'; script-src 'self'; worker-src 'self' blob:; style-src 'self' 'unsafe-inline'; img-src 'self'; font-src 'self' data:; connect-src 'self' ${webSocketSource} ${orfCdn} ${srfCdn}; media-src * blob:; base-uri 'none'; form-action 'none'; frame-ancestors 'none';`,
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer'
    });

    next();
  });

  app.use('/assets', express.static(path.join(__dirname, '/client/assets')));
  app.use('/api', express.json(), express.text());

  app.get('/', function (req, res) {
    res.send(indexHtmlContent);
  });

  app.get('/ads.txt', function (req, res) {
    res.send(config.adsText);
  });

  app.get('/stats', function (req, res) {
    res.send('Server is up and running.');
  });

  app.get('/feed', async function (req, res) {
    try {
      const result = await rssFeedGenerator.createFeed(req.protocol + '://' + req.get('host') + req.originalUrl);

      res.set('Content-Type', 'text/xml');
      res.send(result);

    }
    catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      res.status(500).send(errorMessage);
    }
  });

  app.get('/api/contact-info', (req, res) => {
    res.json(config.contact);
  });

  app.get('/api/channels', async (req, res) => {
    try {
      const channels = await searchEngine.getChannels();
      res.json({
        error: null,
        channels: channels
      });
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({
        error: errorMessage,
        channels: null
      });
    }
  });

  app.get('/api/content-length', async (req, res) => {
    const url = req.query.url as string;

    if (!url) {
      res.status(400).send('URL parameter is missing');
      return;
    }

    try {
      const cachedResult = await valkey.hget('mvw:contentLengthCache', url);

      if (cachedResult) {
        res.send(cachedResult);
      }
      else {
        const response = await got.head(url);
        const contentLength = Number(response.headers['content-length'] || -1);
        res.send(contentLength.toString());
        await valkey.hset('mvw:contentLengthCache', { [url]: contentLength.toString() });
      }
    }
    catch (error) {
      res.send('-1');
    }
  });

  app.post('/api/entries', async (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');

    try {
      const ids: string[] = req.body;
      const entries = await searchEngine.getEntries(ids);

      res.status(200).json({
        result: {
          results: entries
        },
        err: null
      });

      console.log(moment().format('HH:mm') + ' - entries api used');
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(400).json({
        result: null,
        err: [errorMessage]
      });
    }
  });

  app.post('/api/query', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');

    let query;
    try {
      query = (typeof req.body == 'string') ? JSON.parse(req.body) : req.body;
    }
    catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
      res.status(400).json({
        result: null,
        err: [errorMessage]
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
    }
    catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
      res.status(400).json({
        result: null,
        err: [errorMessage]
      });
      return;
    }

    handleQuery(query, res);
  });

  async function handleQuery(query: object, response: express.Response): Promise<void> {
    const begin = process.hrtime();
    try {
      const result = await searchEngine.search(query);
      const end = process.hrtime(begin);
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

      console.log(moment().format('HH:mm') + ' - search api used');

    }
    catch (err) {
      const error = err as Error;
      if (error.message == 'cannot query while indexing') {
        response.status(503);
      }
      else {
        response.status(500);
      }

      response.json({
        result: null,
        err: [error.message]
      });
    }
  }

  const httpServer = app.listen(config.webserverPort, () => {
    console.log('server listening on *:' + config.webserverPort);
    console.log();
  });

  process.on('SIGTERM', () => httpServer.close(() => process.exit(0)));

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

process.on('SIGINT', function () {
  console.log("Caught SIGINT - exiting...");
  process.exit(0);
});
