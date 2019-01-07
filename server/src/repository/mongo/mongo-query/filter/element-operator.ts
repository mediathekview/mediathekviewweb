import { BSONType } from '../bson-type';

type ExistsOperator = { $exists: boolean };
type TypeOperator = { $type: BSONType };

type NonFieldedElementOperator = ExistsOperator | TypeOperator;
type FieldedElementOperator = NonFieldedElementOperator | StringMap<NonFieldedElementOperator>;

export type ElementOperator = NonFieldedElementOperator | FieldedElementOperator;
