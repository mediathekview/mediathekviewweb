import { IDatastoreProvider, IKey, ISet } from '../data-store';
import { IFilmlist } from './filmlist-interface';
import { FilmlistParser } from './filmlist-parser';
import { IFilmlistProvider } from './filmlist-provider-interface';
import config from '../config';
import { random } from '../utils';
import * as Bull from 'bull';
import { ILockProvider, ILock } from '../lock';
import { QueueProvider, ImportQueueType } from '../queue';
import { HttpFilmlist } from './http-filmlist';

export class FilmlistImporter {
  private importQueue: Bull.Queue;

  constructor(private datastoreProvider: IDatastoreProvider, private lockProvider: ILockProvider, private queueProvider: QueueProvider) {
    this.importQueue = queueProvider.getImportQueue();
  }

  run() {
    this.importQueue.process(1, (job, done) => this.process(job));
  }

  async process(job: Bull.Job) {
    const data: ImportQueueType = job.data;

    let filmlist: IFilmlist;

    if (data.ressource.startsWith('http')) {
      filmlist = new HttpFilmlist(data.ressource, data.timestamp);
    } else {
      return Promise.reject(new Error(`no filmlist-handler for ressource ${data.ressource} available`));
    }

    const parser = new FilmlistParser(filmlist, (metadata) => filmlistTimestamp = metadata.timestamp);

    for await (const entry of parser.parse()) {
      //put into redis
    }
  }
}
