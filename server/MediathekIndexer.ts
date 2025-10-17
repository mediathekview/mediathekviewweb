import cp from 'node:child_process';
import EventEmitter from 'node:events';

import { Client, ClientOptions } from '@opensearch-project/opensearch';
import { Batch } from '@valkey/valkey-glide';

import { config } from './config';
import { IPC } from './IPC';
import { OPENSEARCH_INDEX, VALKEY_KEYS } from './keys';
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

  async indexFilmliste(file: string): Promise<void> {
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
      .rename(VALKEY_KEYS.NEW_FILMLISTE, VALKEY_KEYS.CURRENT_FILMLISTE)
      .rename(VALKEY_KEYS.NEW_FILMLIST_TIMESTAMP, VALKEY_KEYS.CURRENT_FILMLIST_TIMESTAMP)
      .unlink([VALKEY_KEYS.ADDED_ENTRIES, VALKEY_KEYS.REMOVED_ENTRIES]);

    await this.valkey.exec(batch, true, { timeout: 10000 });

    this.emit('done');
    this.stateEmitter.setState('step', 'waiting');
  }

  async hasCurrentState(): Promise<boolean> {
    const result = await this.valkey.exists([VALKEY_KEYS.CURRENT_FILMLISTE]);
    return result === 1;
  }

  async fullIndexFilmliste(file: string): Promise<void> {
    this.stateEmitter.setState('step', 'fullIndexFilmliste');

    await this._parseFilmliste(file, VALKEY_KEYS.NEW_FILMLISTE, VALKEY_KEYS.NEW_FILMLIST_TIMESTAMP);
    await this._forceFullIndex(VALKEY_KEYS.NEW_FILMLISTE);
  }

  async recreateOSIndex(): Promise<void> {
    this.stateEmitter.setState('step', 'recreateOSIndex');

    await this.searchClient.indices.delete({
      index: OPENSEARCH_INDEX,
      ignore_unavailable: true,
    });

    await this.searchClient.indices.create({ index: OPENSEARCH_INDEX });
    await this.searchClient.indices.close({ index: OPENSEARCH_INDEX });
    await this.searchClient.indices.putSettings({ index: OPENSEARCH_INDEX, body: opensearchDefinitions.settings });
    await this.searchClient.indices.putMapping({ index: OPENSEARCH_INDEX, body: opensearchDefinitions.mapping });
    await this.searchClient.indices.open({ index: OPENSEARCH_INDEX });
  }

  async deltaIndexFilmliste(file: string): Promise<void> {
    this.stateEmitter.setState('step', 'deltaIndexFilmliste');

    await this._parseFilmliste(file, VALKEY_KEYS.NEW_FILMLISTE, VALKEY_KEYS.NEW_FILMLIST_TIMESTAMP);
    await this.createDelta(VALKEY_KEYS.NEW_FILMLISTE, VALKEY_KEYS.CURRENT_FILMLISTE);
    await this._indexDelta();

    const valkeyCount = await this.valkey.scard(VALKEY_KEYS.NEW_FILMLISTE);

    await this.searchClient.indices.refresh({ index: OPENSEARCH_INDEX });
    const { body: { count: opensearchCount } } = await this.searchClient.count({ index: OPENSEARCH_INDEX });

    if (valkeyCount !== opensearchCount) {
      console.warn(`Discrepancy detected after delta index. Valkey: ${valkeyCount}, OpenSearch: ${opensearchCount}. Recreating index.`);
      this.stateEmitter.setState('step', 'recreateAfterDiscrepancy');

      await this._forceFullIndex(VALKEY_KEYS.NEW_FILMLISTE);

      // Final check after recovery
      await this.searchClient.indices.refresh({ index: OPENSEARCH_INDEX });
      const { body: { count: finalOpensearchCount } } = await this.searchClient.count({ index: OPENSEARCH_INDEX });

      if (valkeyCount !== finalOpensearchCount) {
        throw new Error(`Count mismatch after full re-index. Valkey: ${valkeyCount}, OpenSearch: ${finalOpensearchCount}. Aborting.`);
      }

      console.log(`Index recreated successfully. Valkey: ${valkeyCount}, OpenSearch: ${finalOpensearchCount}.`);
    }
  }

  async createDelta(newSet: string, currentSet: string): Promise<void> {
    this.stateEmitter.setState('step', 'createDelta');

    const batch = new Batch(true)
      .sdiffstore(VALKEY_KEYS.ADDED_ENTRIES, [newSet, currentSet])
      .sdiffstore(VALKEY_KEYS.REMOVED_ENTRIES, [currentSet, newSet])
      .scard(VALKEY_KEYS.ADDED_ENTRIES)
      .scard(VALKEY_KEYS.REMOVED_ENTRIES);

    const [, , added, removed] = await this.valkey.exec(batch, true, { timeout: 10000 });

    this.stateEmitter.updateState({ added, removed });
  }

  private async _forceFullIndex(sourceSet: string): Promise<void> {
    this.stateEmitter.setState('step', 'forceFullIndex');

    await this.recreateOSIndex();
    // A full index is a delta against a non-existent set
    await this.createDelta(sourceSet, VALKEY_KEYS.NONE);
    await this._indexDelta();
  }

  combineWorkerStates(workerStates: any[]) {
    let addedEntries = 0;
    let removedEntries = 0;

    for (let i = 0; i < workerStates.length; i++) {
      if (workerStates[i] != undefined) {
        addedEntries += workerStates[i].addedEntries;
        removedEntries += workerStates[i].removedEntries;
      }
    }

    return {
      addedEntries: addedEntries,
      removedEntries: removedEntries,
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

  indexDelta(callback: (err: Error | null) => void) {
    this.stateEmitter.setState('step', 'indexDelta');

    const indexerWorkers: cp.ChildProcess[] = [];
    const indexerWorkersState: any[] = [];

    let workersDone = 0;
    let lastStatsUpdate = 0;

    for (let i = 0; i < config.workerCount; i++) {
      const indexerWorker = cp.fork(__dirname + '/MediathekIndexerWorker.js', [], { execArgv: config.workerArgs });

      indexerWorkers[i] = indexerWorker;

      const ipc = new IPC(indexerWorker);

      ipc.on('state', (state) => {
        indexerWorkersState[i] = state;

        if (Date.now() - lastStatsUpdate > 500) {
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

      ipc.on('error', (err) => callback(new Error(err)));
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

  parseFilmliste(file: string, setKey: string, timestampKey: string, callback: (err: Error | null) => void) {
    this.stateEmitter.setState('step', 'parseFilmliste');
    const filmlisteParser = cp.fork(__dirname + '/FilmlisteParser.js', [], { execArgv: config.workerArgs });

    const ipc = new IPC(filmlisteParser);

    ipc.on('error', (errMessage) => {
      callback(new Error(errMessage));
    });

    let lastState: any = null;
    let lastStatsUpdate = 0;

    ipc.on('state', (state) => {
      lastState = state;

      if (Date.now() - lastStatsUpdate > 500) {
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
      timestampKey: timestampKey,
    });
  }
}
