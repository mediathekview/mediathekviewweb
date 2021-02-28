import type { NewEntry } from '$shared/models/core';
import type { CancellationToken } from '@tstdl/base/utils/cancellation-token';

export interface EntrySource {
  getEntries(cancellationToken: CancellationToken): AsyncIterableIterator<NewEntry[]>;
}
