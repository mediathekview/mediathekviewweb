import { Entry } from '../model';

export class NativeFilmlisteParser {
  static parseFilmliste(file: string, regex: string, batchSize: number, batchCallback: (batch: Entry[]) => void, endCallback: () => void): void;
  static parseFilmliste(file: string, regex: string, batchSize: number, batchCallback: (batch: Entry[]) => void): Promise<void>;
}
