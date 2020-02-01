import { FilmlistProvider } from '../provider';
import { Filmlist } from '../filmlist';

export class MultiFilmlistProvider implements FilmlistProvider {
  private readonly providers: FilmlistProvider[];

  readonly type: string = 'multi';

  constructor() {
    this.providers = [];
  }

  async getLatest(): Promise<Filmlist> {
    for (const provider of providers) {

    }
  }

  getArchive(): AsyncIterable<Filmlist> {
    throw new Error("Method not implemented.");
  }
}
