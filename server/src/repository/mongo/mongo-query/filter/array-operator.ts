import { MongoFilter } from './filter';

type AllOperator = { $all: any[] };
type ElemMatchOperator = { $elemMatch: MongoFilter | StringMap<MongoFilter> };
type SizeOperator = { $size: number };

type NonFieldedArrayOperator = AllOperator | ElemMatchOperator | SizeOperator;
type FieldedArrayOperator = StringMap<NonFieldedArrayOperator>;

export type ArrayOperator = NonFieldedArrayOperator | FieldedArrayOperator;
