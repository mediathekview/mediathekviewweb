import { Filmlist } from '../filmlist';

export interface FilmlistRepository {
    getLatest(): Promise<Filmlist>;
    getArchive(): AsyncIterable<Filmlist>;
}
