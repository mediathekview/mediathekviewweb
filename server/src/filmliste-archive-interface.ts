export interface IFilmlisteArchive {
  has(year: number, month: number, day: number): Promise<boolean>;
  getUrl(year: number, month: number, day: number): Promise<string>;
  getLatestUrl(year: number, month: number, day: number): Promise<string>;
}
