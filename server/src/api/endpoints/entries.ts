import { Entry } from '../../common/models';
import { EntryRepository } from '../../repositories';

export type DeltaParameters = {
  timestamp: number
};

export type DeltaResult = {
  added: Entry[],
  removed: string[]
};

export class SearchApiEndpoint {
  private readonly entryRepository: EntryRepository;

  constructor(entryRepository: EntryRepository) {
    this.entryRepository = entryRepository;
  }

  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/require-await, @typescript-eslint/no-unused-vars
  async added({ timestamp }: DeltaParameters): Promise<DeltaResult> {
    throw new Error('not implemented');
  }
}
