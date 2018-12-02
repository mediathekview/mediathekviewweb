import { QueryBody } from '../../../common/search-engine/query';

export interface ConvertHandler {
  tryConvert(query: QueryBody, index: string, type: string): object | null;
}
