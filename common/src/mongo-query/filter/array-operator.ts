import { MongoFilter } from './filter';

type AllOperator = { $all: any[] }
type ElemMatchOperator = { $elemMatch: MongoFilter | { [key: string]: MongoFilter } }
type SizeOperator = { $size: number }

type NonFieldedArrayOperator = AllOperator | ElemMatchOperator | SizeOperator
type FieldedArrayOperator = { [key: string]: NonFieldedArrayOperator }

export type ArrayOperator = NonFieldedArrayOperator | FieldedArrayOperator
