import * as Request from 'request';
import { RedisService } from './redis-service';

const TOLERANCE = 25 * 60; //25 minutes, as not all mirrors are updated at same time

export class FilmlisteUtils {
  static redisService: RedisService = RedisService.getInstance();

  static getRandomFilmlisteMirror(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      Request.get('https://res.mediathekview.de/akt.xml', (err, response, body) => {
        if (err) {
          reject(err);
        } else if (response.statusCode == 200) {
          let filmlisteUrlRegex = /<URL>\s*(.*?)\s*<\/URL>/g;
          let urlMatches: RegExpExecArray[] = [];

          let match: RegExpExecArray;
          while ((match = filmlisteUrlRegex.exec(body)) !== null) {
            urlMatches.push(match);
          }

          let url = urlMatches[Math.floor(Math.random() * urlMatches.length)][1];

          resolve(url);
        } else {
          reject(new Error(`Error: statuscode ${response.statusCode}`));
        }
      });
    });
  }

  static getModifiedTimestampFromMirror(mirror: string): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      Request.head(mirror, (error, response, body) => {
        if (error) {
          reject(error);
        } else if (response.statusCode == 200 && response.headers['last-modified'] != undefined) {
          var lastModified = Math.floor(new Date(response.headers['last-modified']).getTime() / 1000);
          resolve(lastModified);
        } else if (response.statusCode != 200) {
          reject(new Error(`statuscode ${response.statusCode}`));
        } else if (response.headers['last-modified'] == undefined) {
          reject(new Error(`no 'last-modified' header in response`));
        }
      });
    });
  }

  static async checkUpdateAvailable(tries: number): Promise<{ available: boolean, mirror: string }> {
    while (tries-- > 0) {
      try {
        let mirror = await this.getRandomFilmlisteMirror();
        let modifiedTimestamp = await this.getModifiedTimestampFromMirror(mirror);
        let filmlisteTimestamp = await this.redisService.getFilmlisteTimestamp();

        let available = (modifiedTimestamp - filmlisteTimestamp) >= TOLERANCE;
        return { available: available, mirror: mirror };
      }
      catch (exception) {
        if (tries == 0) {
          throw exception;
        }
      }
    }
  }
}
