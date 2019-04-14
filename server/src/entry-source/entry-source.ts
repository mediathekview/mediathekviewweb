import { CancellationToken } from '@common-ts/base/utils/cancellation-token';
import { Entry } from '../common/model';

export interface EntrySource {
  getEntries(cancellationToken: CancellationToken): AsyncIterableIterator<Entry[]>;
}
