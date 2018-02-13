import { ComparisonOperator } from './comparison-operator';
import { LogicalOperator } from './logical-operator';
import { ElementOperator } from './element-operator';
import { EvaluationOperator, WhereEvaluation } from './evaluation-operator';
import { ArrayOperator } from './array-operator';
import { BitOperator } from './bit-operator';
import { ObjectID } from 'bson';

type EqualType = string | number | Date | ObjectID | RegExp

export type MongoFilter = WhereEvaluation | ComparisonOperator | LogicalOperator | ElementOperator | EvaluationOperator | ArrayOperator | BitOperator | ObjectMap<EqualType | EqualType[]>
