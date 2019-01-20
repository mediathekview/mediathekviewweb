import { StringMap } from '../../../../common/types';
import { Divisor, Remainder } from '../value-types';

type ModOperator = { $mod: [Divisor, Remainder] };
type RegexOperator = RegExp | { $regex: RegExp };
type TextOperator = { $text: { $search: string, $language?: string, $caseSensitive?: boolean, $diacriticSensitive?: boolean } };
type WhereOperator = { $where: WhereEvaluation };

export type WhereEvaluation = ((obj: any) => boolean) | string;
export type EvaluationOperator = ModOperator | RegexOperator | TextOperator | WhereOperator | StringMap<ModOperator> | StringMap<RegexOperator>;
