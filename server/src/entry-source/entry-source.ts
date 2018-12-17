import { AsyncDisposable } from '../common/disposable';
import { Entry } from '../common/model';

export interface EntrySource extends AsyncDisposable, AsyncIterable<Entry[]> {
}
