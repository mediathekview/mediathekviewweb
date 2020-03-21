import { Filmlist } from '../filmlist';
import { FilmlistResource } from '../filmlist-resource';
import { FilmlistProvider } from '../provider';

export class MultiFilmlistProvider implements FilmlistProvider {
  private readonly providers: FilmlistProvider[];

  readonly type: string = 'multi';

  readonly name: string;

  constructor() {
    this.providers = [];
  }

  registerProvider(provider: FilmlistProvider): void {
    this.providers.push(provider);
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async *getLatest(): AsyncIterable<Filmlist> {
    for (const provider of this.providers) {
      yield* provider.getLatest();
    }
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async *getArchive(): AsyncIterable<Filmlist> {
    for (const provider of this.providers) {
      yield* provider.getArchive();
    }
  }

  async getFromResource(resource: FilmlistResource): Promise<Filmlist> {
    for (const provider of this.providers) {
      if (provider.name == resource.providerName) {
        return provider.getFromResource(resource);
      }
    }

    throw new Error(`no provider named ${resource.providerName} available`);
  }
}
