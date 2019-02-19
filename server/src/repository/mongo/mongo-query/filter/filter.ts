import { ObjectId } from 'mongodb';
import { StringMap } from '../../../../common/types';
import { ArrayOperator } from './array-operator';
import { BitOperator } from './bit-operator';
import { ComparisonOperator } from './comparison-operator';
import { ElementOperator } from './element-operator';
import { EvaluationOperator } from './evaluation-operator';
import { LogicalOperator } from './logical-operator';

type EqualType = undefined | null | string | number | Date | ObjectId | RegExp;

export type MongoFilter = /* WhereEvaluation | */ ComparisonOperator | LogicalOperator | ElementOperator | EvaluationOperator | ArrayOperator | BitOperator | StringMap<EqualType | EqualType[]>;
export type TypedMongoFilter<T> = Partial<Record<keyof T, MongoFilter | EqualType | EqualType[]>> & { _id?: any };
