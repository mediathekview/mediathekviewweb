import { CancellationToken } from '@common-ts/base/utils/cancellation-token';
import { Entry } from '../common/models';

export interface EntrySource {
  getEntries(cancellationToken: CancellationToken): AsyncIterableIterator<Entry[]>;
}
