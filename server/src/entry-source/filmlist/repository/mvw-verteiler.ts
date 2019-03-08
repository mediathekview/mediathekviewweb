import { mapAsync, singleAsync } from '../../../common/utils';
import { File, Listing } from '../../../listing/';
import { NginxListing } from '../../../listing/nginx';
import { Filmlist, FilmlistResource } from '../../../model/filmlist';
import { parseFilmlistResourceFilmlist } from '../filmlist-parser';
import { FilmlistRepository } from './repository';

const FILENAME_DATE_REGEX = /^(\d+)-(\d+)-(\d+)-filme\.xz$/;

export class MediathekViewWebVerteilerFilmlistRepository implements FilmlistRepository {
  private readonly listing: Listing;

  constructor(url: string) {
    this.listing = new NginxListing(url);
  }

  async getLatest(): Promise<Filmlist> {
    const directory = this.listing.getBaseDirectory();
    const files = directory.getFiles();

    const latestFile = await singleAsync(files, (file) => file.name == 'Filmliste-akt.xz');
    const filmlist = this.latestFileToFilmlist(latestFile);

    return filmlist;
  }

  async *getArchive(): AsyncIterable<Filmlist> {
    const directory = this.listing.getBaseDirectory();
    const directories = directory.getDirectories();

    const archiveDirectory = await singleAsync(directories, (directory) => directory.name == 'archiv');
    const archiveFiles = archiveDirectory.getFiles(true);

    const filmlists = mapAsync(archiveFiles, async (file) => this.archiveFileToFilmlist(file));
    yield* filmlists;
  }

  private async latestFileToFilmlist(file: File): Promise<Filmlist> {
    const date = file.date;
    const timestamp = date.getTime();

    const filmlistResource: FilmlistResource = {
      url: file.resource.uri,
      timestamp,
      compressed: true
    };

    const filmlist = await parseFilmlistResourceFilmlist(filmlistResource);
    return filmlist;
  }

  private archiveFileToFilmlist(file: File): Filmlist {
    const date = this.parseFilenameDate(file.name);
    const timestamp = date.getTime();

    const filmlist: Filmlist = {
      id: `archive-${timestamp}`,
      timestamp,
      resource: {
        url: file.resource.uri,
        timestamp,
        compressed: true
      }
    };

    return filmlist;
  }

  private parseFilenameDate(name: string): Date {
    const match = name.match(FILENAME_DATE_REGEX);

    if (match == undefined) {
      throw new Error('failed matching date on filename');
    }

    const [, yearString, monthString, dayString] = match;
    const year = parseInt(yearString);
    const month = parseInt(monthString) - 1;
    const day = parseInt(dayString);
    const date = new Date(Date.UTC(year, month, day));

    return date;
  }
}
