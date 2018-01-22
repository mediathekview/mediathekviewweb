type FieldOperatorValue<T> = { [key: string]: T }

type CurrentDateOperator = { $currentDate: FieldOperatorValue<boolean | 'date' | 'timestamp'> }
type IncreaseOperator = { $inc: FieldOperatorValue<number> }
type MinOperator = { $min: FieldOperatorValue<any> }
type MaxOperator = { $max: FieldOperatorValue<any> }
type MultiplyOperator = { $mul: FieldOperatorValue<number> }
type RenameOperator = { $rename: FieldOperatorValue<string> }
type SetOperator = { $set: FieldOperatorValue<any> }
type SetOnInsertOperator = { $setOnInsert: FieldOperatorValue<any> }
type UnsetOperator = { $unset: FieldOperatorValue<any> }

export type FieldOperator = CurrentDateOperator | IncreaseOperator | MinOperator | MaxOperator | MultiplyOperator | RenameOperator | SetOperator | SetOnInsertOperator | UnsetOperator
