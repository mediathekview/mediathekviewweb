import { CancellationToken } from '@tstdl/base/utils/cancellation-token';
import { Entry } from '$shared/models';

export interface EntrySource {
  getEntries(cancellationToken: CancellationToken): AsyncIterableIterator<Entry[]>;
}
