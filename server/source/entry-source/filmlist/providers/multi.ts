import type { Filmlist } from '../filmlist-parser';
import type { FilmlistResource } from '../filmlist-resource';
import type { FilmlistProvider } from '../provider';

export class MultiFilmlistProvider implements FilmlistProvider {
  private readonly providers: FilmlistProvider[];

  readonly type: string = 'multi';

  readonly sourceId: string;

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
  async *getArchive(minimumTimestamp: number): AsyncIterable<Filmlist> {
    for (const provider of this.providers) {
      yield* provider.getArchive(minimumTimestamp);
    }
  }

  async getFromResource(resource: FilmlistResource): Promise<Filmlist> {
    for (const provider of this.providers) {
      if (provider.type == resource.type) {
        const canHandle = provider.canHandle(resource);

        if (canHandle) {
          return provider.getFromResource(resource);
        }
      }
    }

    throw new Error(`no provider for filmlist-resource with type ${resource.type} available`);
  }
}
