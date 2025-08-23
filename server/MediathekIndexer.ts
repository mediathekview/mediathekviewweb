import cp from 'node:child_process';
import EventEmitter from 'node:events';

import { Client, ClientOptions } from '@opensearch-project/opensearch';
import { Batch } from '@valkey/valkey-glide';

import { config } from './config';
import { IPC } from './IPC';
import * as opensearchDefinitions from './OpenSearchDefinitions';
import { StateEmitter } from './StateEmitter';
import { getValkeyClient, ValkeyClient } from './ValKey';

export class MediathekIndexer extends EventEmitter {
  valkey: ValkeyClient;
  searchClient: Client;
  stateEmitter: StateEmitter;

  constructor(opensearchOptions: ClientOptions) {
    super();

    const configClone = JSON.parse(JSON.stringify(opensearchOptions));

    this.searchClient = new Client(configClone);
    this.valkey = getValkeyClient();
    this.stateEmitter = new StateEmitter(this);
  }

  async indexFilmliste(file): Promise<void> {
    this.stateEmitter.setState('step', 'indexFilmliste');

    const hasCurrent = await this.hasCurrentState();

    if (hasCurrent) {
      await this.deltaIndexFilmliste(file);
    }
    else {
      await this.fullIndexFilmliste(file);
    }

    await this.finalize();
  }

  async finalize(): Promise<void> {
    this.stateEmitter.setState('step', 'finalize');

    const batch = new Batch(true)
      .rename('mediathekIndexer:newFilmliste', 'mediathekIndexer:currentFilmliste')
      .rename('mediathekIndexer:newFilmlisteTimestamp', 'mediathekIndexer:currentFilmlisteTimestamp')
      .unlink(['mediathekIndexer:addedEntries', 'mediathekIndexer:removedEntries'])

    await this.valkey.exec(batch, true, { timeout: 10000 });

    this.emit('done');
    this.stateEmitter.setState('step', 'waiting');
  }

  async hasCurrentState(): Promise<boolean> {
    const result = await this.valkey.exists(['mediathekIndexer:currentFilmliste']);
    return result == 1;
  }

  async fullIndexFilmliste(file: string): Promise<void> {
    this.stateEmitter.setState('step', 'fullIndexFilmliste');

    await this.recreateOSIndex();
    await this._parseFilmliste(file, 'mediathekIndexer:newFilmliste', 'mediathekIndexer:newFilmlisteTimestamp');
    await this.createDelta('mediathekIndexer:newFilmliste', 'mediathekIndexer:none');
    await this._indexDelta();
  }

  async recreateOSIndex(): Promise<void> {
    this.stateEmitter.setState('step', 'recreateOSIndex');

    await this.searchClient.indices.delete({
      index: 'filmliste',
      ignore_unavailable: true
    });

    await this.searchClient.indices.create({ index: 'filmliste' });
    await this.searchClient.indices.close({ index: 'filmliste' });
    await this.searchClient.indices.putSettings({ index: 'filmliste', body: opensearchDefinitions.settings });
    await this.searchClient.indices.putMapping({ index: 'filmliste', body: opensearchDefinitions.mapping });
    await this.searchClient.indices.open({ index: 'filmliste' });
  }

  async deltaIndexFilmliste(file: string): Promise<void> {
    this.stateEmitter.setState('step', 'deltaIndexFilmliste');

    await this._parseFilmliste(file, 'mediathekIndexer:newFilmliste', 'mediathekIndexer:newFilmlisteTimestamp');
    await this.createDelta('mediathekIndexer:newFilmliste', 'mediathekIndexer:currentFilmliste');
    await this._indexDelta();
  }

  async createDelta(newSet: string, currentSet: string): Promise<void> {
    this.stateEmitter.setState('step', 'createDelta');

    const batch = new Batch(true)
      .sdiffstore('mediathekIndexer:addedEntries', [newSet, currentSet])
      .sdiffstore('mediathekIndexer:removedEntries', [currentSet, newSet])
      .scard('mediathekIndexer:addedEntries')
      .scard('mediathekIndexer:removedEntries');

    const [, , added, removed] = await this.valkey.exec(batch, true, { timeout: 10000 });

    this.stateEmitter.updateState({ added, removed });
  }

  combineWorkerStates(workerStates) {
    let addedEntries = 0,
      removedEntries = 0;

    for (let i = 0; i < workerStates.length; i++) {
      if (workerStates[i] != undefined) {
        addedEntries += workerStates[i].addedEntries;
        removedEntries += workerStates[i].removedEntries;
      }
    }

    return {
      addedEntries: addedEntries,
      removedEntries: removedEntries
    };
  }

  _indexDelta(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.indexDelta((err) => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  }

  indexDelta(callback) {
    this.stateEmitter.setState('step', 'indexDelta');

    let indexerWorkers: cp.ChildProcess[] = [];
    let indexerWorkersState = [];

    let workersDone = 0;
    let lastStatsUpdate = 0;

    for (let i = 0; i < config.workerCount; i++) {
      let indexerWorker = cp.fork(__dirname + '/MediathekIndexerWorker.js', [], { execArgv: config.workerArgs });

      indexerWorkers[i] = indexerWorker;

      let ipc = new IPC(indexerWorker);

      ipc.on('state', (state) => {
        indexerWorkersState[i] = state;

        if ((Date.now() - lastStatsUpdate) > 500) { //wait atleast 500ms
          this.stateEmitter.updateState(this.combineWorkerStates(indexerWorkersState));
          lastStatsUpdate = Date.now();
        }
      });
      ipc.on('done', () => {
        workersDone++;

        if (workersDone == config.workerCount) {
          this.stateEmitter.updateState(this.combineWorkerStates(indexerWorkersState));
          callback(null);
        }
      });
      ipc.on('error', (err) => {
        callback(new Error(err));
      });
    }
  }

  _parseFilmliste(file: string, setKey: string, timestampKey: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.parseFilmliste(file, setKey, timestampKey, (err) => {
        if (err) {
          return reject(err);
        }

        resolve();
      });
    });
  }

  parseFilmliste(file, setKey, timestampKey, callback) {
    this.stateEmitter.setState('step', 'parseFilmliste');
    let filmlisteParser = cp.fork(__dirname + '/FilmlisteParser.js', [], { execArgv: config.workerArgs });

    let ipc = new IPC(filmlisteParser);

    ipc.on('error', (errMessage) => {
      callback(new Error(errMessage));
    });

    let lastState = null;
    let lastStatsUpdate = 0;

    ipc.on('state', (state) => {
      lastState = state;

      if ((Date.now() - lastStatsUpdate) > 500) { //wait atleast 500ms
        this.stateEmitter.updateState(lastState);
        lastStatsUpdate = Date.now();
      }
    });

    ipc.on('done', () => {
      this.stateEmitter.updateState(lastState);
      callback(null);
    });

    ipc.send('parseFilmliste', {
      file: file,
      setKey: setKey,
      timestampKey: timestampKey
    });
  }
}
