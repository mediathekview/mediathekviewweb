import { QueryBody } from '../../../common/search-engine/query';

export type ConvertResult = { success: true, result: object } | { success: false };

export interface ConvertHandler {
  tryConvert(query: QueryBody, index: string, type: string): ConvertResult;
}
