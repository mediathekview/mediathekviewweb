import { FilmlisteTransformer } from './filmliste-transformer';
import { StateEmitter } from './state-emitter';
import * as FS from 'fs';
import * as LineReader from 'line-reader';
import * as Redis from 'redis';

export class FilmlisteParser extends StateEmitter {
    redis: Redis.RedisClient;

    constructor() {
        super();
    }

    parseFilmliste(file: string = '/home/patrick/Documents/mediathekviewweb/server/src/liste'): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            FS.open(file, 'r', (err, fd) => {
                if (err) {
                    reject(err);
                    return;
                }

                FS.fstat(fd, (err, stats) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    let size = stats.size;

                    let fileStream = FS.createReadStream(null, { fd: fd, autoClose: true });

                    let filmlisteTransformer = new FilmlisteTransformer();
                    let counter: number = 0;

                    filmlisteTransformer.on('data', (chunk) => {
                        if (counter++ % 1000 == 0) {
                            this.updateState('parsedEntries', counter);
                        }
                    });

                    filmlisteTransformer.on('end', () => {
                        this.updateState('parsedEntries', counter);
                    });

                    LineReader.eachLine((fileStream as any), { separator: /^{"Filmliste":|,"X":|}$/ }, (line, last, getNext) => {
                        if (!last) {
                            filmlisteTransformer.write(line);
                        }

                        getNext();
                    });
                });
            });
        });
    }
}
