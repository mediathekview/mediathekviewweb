import type { Readable } from 'stream';
import type { FilmlistResource } from '../filmlist-resource';
import type { FilmlistProvider } from '../provider';

export class MultiFilmlistProvider implements FilmlistProvider {
  private readonly providers: FilmlistProvider[];

  readonly type: string = 'multi';

  readonly sourceId: string;

  constructor() {
    this.providers = [];
  }

  canHandle(resource: FilmlistResource): boolean {
    return this.providers.some((provider) => provider.canHandle(resource));
  }

  registerProvider(provider: FilmlistProvider): void {
    this.providers.push(provider);
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async *getLatest(): AsyncIterable<FilmlistResource> {
    for (const provider of this.providers) {
      yield* provider.getLatest();
    }
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async *getArchive(minimumTimestamp: number): AsyncIterable<FilmlistResource> {
    for (const provider of this.providers) {
      yield* provider.getArchive(minimumTimestamp);
    }
  }

  async getFromResource(resource: FilmlistResource): Promise<Readable> {
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
