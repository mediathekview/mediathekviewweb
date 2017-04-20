import * as Request from 'request';
import { RedisService } from './redis-service';


export class FilmlisteUtils {

  constructor() {
  }

  getRandomFilmlisteMirror(): Promise<string> {
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

  checkUpdateAvailable(tries: number): Promise<{ available: boolean, mirror: string }> {
    return new Promise<{ available: boolean, mirror: string }>((resolve, reject) => {
      this.getRandomFilmlisteMirror().then((mirror) => {
        this.getCurrentFilmlisteTimestamp().then((filmlisteTimestamp) => {
          Request.head(mirror, (err, response, body) => {
            if (err) {
              if (tries > 0) {
                return this.checkUpdateAvailable(tries - 1);
              } else {
                reject(err);
              }
            } else if (response.statusCode == 200 && response.headers['last-modified'] != undefined) {
              var lastModified = Math.floor(new Date(response.headers['last-modified']).getTime() / 1000);
              let tolerance = 25 * 60; //25 minutes, as not all mirrors update at same time
              let available = (lastModified - filmlisteTimestamp) >= tolerance;

              resolve({ available: available, mirror: null });
            } else if (response.statusCode != 200) {
              if (tries > 0) {
                return this.checkUpdateAvailable(tries - 1);
              } else {
                reject(new Error(`Error: statuscode ${response.statusCode}`));
              }
            } else if (response.headers['last-modified'] == undefined) {
              if (tries > 0) {
                return this.checkUpdateAvailable(tries - 1);
              } else {
                reject(new Error(`Error: statuscode ${response.statusCode}`));
              }
            }
          });
        });
      }).catch((err) => {
        reject(err);
      });
    });
  }
}
