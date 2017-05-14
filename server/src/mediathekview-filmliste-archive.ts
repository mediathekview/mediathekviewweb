import { IFilmlisteArchive } from './filmliste-archive-interface';

//https://archiv.mediathekview.de/2015/03/2015-03-08-filme.xz

export class MediathekViewFilmlisteArchive implements IFilmlisteArchive {
  has(year: number, month: number, day: number): Promise<boolean> {
      
  }

  getUrl(year: number, month: number, day: number): Promise<string> {

  }

  getLatestUrl(): Promise<string> {

  }
}
