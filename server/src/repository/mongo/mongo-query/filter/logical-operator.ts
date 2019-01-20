import { StringMap } from '../../../../common/types';
import { MongoFilter } from './filter';

type AndOperator = { $and: MongoFilter[] };
type NorOperator = { $nor: MongoFilter[] };
type OrOperator = { $or: MongoFilter[] };
type NotOperator = { $not: MongoFilter };

export type LogicalOperator = AndOperator | NorOperator | OrOperator | NotOperator | StringMap<{ $not: MongoFilter }>;
