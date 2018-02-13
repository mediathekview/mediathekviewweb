import { MongoFilter } from './filter';

type AllOperator = { $all: any[] }
type ElemMatchOperator = { $elemMatch: MongoFilter | ObjectMap<MongoFilter> }
type SizeOperator = { $size: number }

type NonFieldedArrayOperator = AllOperator | ElemMatchOperator | SizeOperator
type FieldedArrayOperator = ObjectMap<NonFieldedArrayOperator>

export type ArrayOperator = NonFieldedArrayOperator | FieldedArrayOperator
