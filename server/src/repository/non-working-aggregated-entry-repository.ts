import { AggregatedEntryRepository } from './aggregated-entry-repository';
import { EntryRepository } from './entry-repository';
import { AggregatedEntry, Entry, Document } from '../common/model';
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

  private toAggregated(entryDocument: Document<Entry>): AggregatedEntry {
    const lastSeenTimestamp = Math.floor(entryDocument.updated.valueOf() / 1000);

    const entry = {
      ...entryDocument.item,
      metadata: {
        lastSeenTimestamp: lastSeenTimestamp,
        downloads: 1234,
        plays: 1234,
        comments: 0,
        averageRating: 2.5,
        secondsPlayed: 1234,
        secondsPaused: 1234
      }
    };

    return entry;
  }
}
