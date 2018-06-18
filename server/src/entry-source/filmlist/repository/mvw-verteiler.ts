import { mapAsync, singleAsync } from '../../../common/utils';
import { File, Listing } from '../../../listing/';
import { NginxListing } from '../../../listing/nginx';
import { Filmlist } from '../filmlist';
import { FilmlistRepository } from './repository';

const FILENAME_DATE_REGEX = /^(\d+)-(\d+)-(\d+)-filme\.xz$/;

export class MediathekViewWebVerteilerFilmlistRepository implements FilmlistRepository {
    private listing: Listing;

    constructor(url: string) {
        this.listing = new NginxListing(url);
    }

    async getLatest(): Promise<Filmlist> {
        const directory = this.listing.getBaseDirectory();
        const files = directory.getFiles();

        const latestFile = await singleAsync(files, (file) => file.name == 'Filmliste-akt.xz');
        const filmlist = this.fileToFilmlist(latestFile, false);

        return filmlist;
    }

    async *getArchive(): AsyncIterable<Filmlist> {
        const directory = this.listing.getBaseDirectory();
        const directories = directory.getDirectories();

        const archiveDirectory = await singleAsync(directories, (directory) => directory.name == 'archiv');

        const archiveFiles = archiveDirectory.getFiles(true);
        const filmlists = mapAsync(archiveFiles, (file) => this.fileToFilmlist(file, true));

        yield* filmlists;
    }

    private fileToFilmlist(file: File, parseFilenameForDate: boolean): Filmlist {
        let date: Date = file.date;

        if (parseFilenameForDate) {
            date = this.parseFilenameDate(file.name);
        }

        const filmlist = new Filmlist(file, true, date);
        return filmlist;
    }

    private parseFilenameDate(name: string): Date {
        const match = name.match(FILENAME_DATE_REGEX);

        if (match == null) {
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
