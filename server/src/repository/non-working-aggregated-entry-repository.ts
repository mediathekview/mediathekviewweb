import { AggregatedEntryRepository } from './aggregated-entry-repository';
import { EntryRepository } from './entry-repository';
import { AggregatedEntry, Entry } from '../common/model';
import { AnyIterable } from '../common/utils';
import { AsyncEnumerable } from '../common/enumerable/index';

export class NonWorkingAggregatedEntryRepository implements AggregatedEntryRepository {
  private readonly entryRepository: EntryRepository;

  constructor(entryRepository: EntryRepository) {
    this.entryRepository = entryRepository;
  }

  async load(id: string): Promise<AggregatedEntry | null> {
    let result: AggregatedEntry | null = null;

    const entryDocument = await this.entryRepository.load(id);

    if (entryDocument != null) {
      result = this.toAggregated(entryDocument);
    }

    return result;
  }

  loadMany(ids: AnyIterable<string>): AsyncIterable<AggregatedEntry> {
    const entryDocuments = this.entryRepository.loadMany(ids);

    const result = AsyncEnumerable.map(entryDocuments, (entryDocument) => this.toAggregated(entryDocument));
    return result;
  }

  private toAggregated(entry: Entry): AggregatedEntry {
    const aggregatedEntry = {
      ...entry,
      time: this.getTime(entry.timestamp),

      metadata: {
        downloads: 1234,
        plays: 1234,
        comments: 0,
        averageRating: 2.5,
        secondsPlayed: 1234,
        secondsPaused: 1234
      }
    };

    return aggregatedEntry;
  }

  private getTime(timestamp: number): number {
    return timestamp % 86400;
  }
}
