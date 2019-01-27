import { Entry } from '../common/model';
import { CancellationToken } from '../common/utils/cancellation-token';

export interface EntrySource {
  getEntries(cancellationToken: CancellationToken): AsyncIterableIterator<Entry[]>;
}
