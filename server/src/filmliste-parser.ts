import * as FS from 'fs';

import * as LZMA from 'lzma-native';
import * as Request from 'request';
import * as RequestProgress from 'request-progress';

import { NativeFilmlisteParser } from './native-filmliste-parser';
import { FilmlisteUtils } from './filmliste-utils';
import { Utils } from './utils';
import { Entry } from './model';

const PATH_TO_CURRENT_FILMLISTE = __dirname + '/filmlisten/currentFilmliste';

function handleBatch() {

}

function handleEnd() {

}

function downloadFilmliste(mirror: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    FS.open(PATH_TO_CURRENT_FILMLISTE, 'w', (error, fd) => {
      if (error) {
        reject(error);
        return;
      }

      let fileStream = FS.createWriteStream(null, {
        fd: fd,
        autoClose: true
      });

      let req = RequestProgress(Request.get(mirror), {
        throttle: 500
      });

      fileStream.on('error', (error) => {
        req.abort();
        FS.close(fd);
        reject(error);
      });

      req.on('error', (error) => {
        FS.close(fd, () => {
          reject(error);
        });
      });

      req.on('progress', (state) => {
        let progress = {
          progress: state.percent,
          speed: Utils.formatBytes(state.speed) + '/s',
          transferred: Utils.formatBytes(state.size.transferred) + ' / ' + Utils.formatBytes(state.size.total),
          elapsed: state.time.elapsed + ' seconds',
          remaining: state.time.remaining + ' seconds'
        };
      });

      let decompressor = LZMA.createDecompressor();
      req.pipe(decompressor).pipe(fileStream).on('finish', () => {
        FS.close(fd, () => {
          resolve();
        });
      });
    });
  });
}

function parseFilmliste() {
  NativeFilmlisteParser.parseFilmliste(PATH_TO_CURRENT_FILMLISTE, '({|,)?"(Filmliste|X)":', 150, handleBatch, handleEnd);
}

async function loop() {
  try {
    let update = await FilmlisteUtils.checkUpdateAvailable(3);

    if (update.available) {
      await downloadFilmliste(update.mirror);
      parseFilmliste();
    }
  } catch (exception) {
    console.error(exception);
  }


  setTimeout(() => loop(), 2000);
}

loop();
