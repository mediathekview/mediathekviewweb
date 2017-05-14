import { NativeFilmlisteParser } from './native-filmliste-parser';
import { RedisService, RedisKeys } from './redis-service';
import { FilmlisteUtils } from './filmliste-utils';
import { Utils } from './utils';
import { Entry } from './model';

const PATH_TO_CURRENT_FILMLISTE = __dirname + '/filmlisten/currentFilmliste';

class FilmlisteManager {
  redisService: RedisService;

  constructor() {
    this.redisService = RedisService.getInstance();
  }

  async buildArchive(days: number) {

  }

  async update() {

  }

  private async parseFilmliste() {
    return NativeFilmlisteParser.parseFilmliste(PATH_TO_CURRENT_FILMLISTE, '({|,)?"(Filmliste|X)":', 150, (batch) => this.handleBatch(batch));
  }

  private handleBatch(entries: Entry[]) {

  }
}

function handleEnd() {

}

async function loop() {
  try {
    let update = await FilmlisteUtils.checkUpdateAvailable();

    if (update.available) {
      await FilmlisteUtils.downloadFilmliste(PATH_TO_CURRENT_FILMLISTE, update.mirror);
      await parseFilmliste();
    }
  } catch (exception) {
    console.error(exception);
  }


  setTimeout(() => loop(), 2000);
}

loop();
