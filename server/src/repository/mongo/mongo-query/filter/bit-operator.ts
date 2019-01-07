import { BitOperatorValue } from '../value-types';

type BitsAllClearOperator = { $bitsAllClear: BitOperatorValue };
type BitsAllSetOperator = { $bitsAllSet: BitOperatorValue };
type BitsAnyClearOperator = { $bitsAnyClear: BitOperatorValue };
type BitsAnySetOperator = { $bitsAnySet: BitOperatorValue };

type NonFieldedBitOperator = BitsAllClearOperator | BitsAllSetOperator | BitsAnyClearOperator | BitsAnySetOperator;
type FieldedBitOperator = StringMap<NonFieldedBitOperator>;

export type BitOperator = NonFieldedBitOperator | FieldedBitOperator;
