import * as FS from 'fs';
import { IEntry } from '../common';
import { FilmlistParser } from './filmlist-parser';
import { HttpFilmlist } from './http-filmlist';
import { MVWArchiveFilmlistProvider } from './mvw-archive-filmlist-provider';
import { MVWArchiveListing, MVWArchiveFile } from './listing';
import { CacheManager } from './cache-manager';

(<any>Symbol).asyncIterator = Symbol.asyncIterator || Symbol.for("Symbol.asyncIterator");

(async () => {
  try {
    const filmlistProvider = new MVWArchiveFilmlistProvider();
    const cacheManager = new CacheManager('../../data/cache');

    const filmlist = await filmlistProvider.getLatest();

    console.log(await cacheManager.has(filmlist.ressource));

    const filmlisteStream = filmlist.getStream();
    cacheManager.set('https://archiv.mediathekviewweb.de/Filmliste-akt.xz', filmlisteStream);

    const filmlistParser = new FilmlistParser(filmlist, (metadata) => {
      console.log(metadata);
    });

    let counter = 0;

    const iterator = filmlistParser.parse();
    console.log(iterator);

    for await (let entry of iterator) {
      counter++;
      if (counter % 5000 == 0)
        console.log(counter);
    }

    console.log(counter)
  }
  catch (error) {
    console.error(error);
  }
})();
