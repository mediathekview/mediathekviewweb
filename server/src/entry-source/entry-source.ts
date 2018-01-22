import { Entry } from '../common/model';

export interface EntrySource extends AsyncIterable<Entry[]> {
}
