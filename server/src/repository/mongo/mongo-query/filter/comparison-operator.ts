type EqualsOperator = { $eq: any }
type NotEqualsOperator = { $ne: any }
type GreaterOperator = { $gt: any }
type LessOperator = { $lt: any }
type GreaterEqualsOperator = { $gte: any }
type LessEqualsOperator = { $lte: any }
type InOperator = { $in: any[] }
type NotInOperator = { $nin: any[] }

type NonFieldedComparisonOperator = EqualsOperator | NotEqualsOperator | GreaterOperator | LessOperator | GreaterEqualsOperator | LessEqualsOperator | InOperator | NotInOperator
type FieldedComparisonOperator = StringMap<NonFieldedComparisonOperator>

export type ComparisonOperator = NonFieldedComparisonOperator | FieldedComparisonOperator
