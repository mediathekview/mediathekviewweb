import { QueryBody } from '../../../common/search-engine';

export interface Converter {
  tryConvert(query: QueryBody, index: string, type: string): object | null;
}