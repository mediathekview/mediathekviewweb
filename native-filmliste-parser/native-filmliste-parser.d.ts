import { Entry } from '../model';

export type BatchCallbackType = (data: Entry[], next: () => void) => void;

export class NativeFilmlisteParser {
  static parseFilmliste(file: string, regex: string, batchSize: number, batchCallback: BatchCallbackType, endCallback: () => void): void;
  static parseFilmliste(file: string, regex: string, batchSize: number, batchCallback: BatchCallbackType): Promise<void>;
}
