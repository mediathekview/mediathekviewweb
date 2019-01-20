import { Field } from '../../../model';
import { Aggregation, Order, Sort } from '../definition';

export class SortBuilder {
  private readonly _sort: Sort[];

  constructor() {
    this._sort = [];
  }

  add(field: Field, order: Order, aggregation?: Aggregation): this {
    const sort: Sort = {
      field,
      order
    };

    if (aggregation != undefined) {
      sort.aggregation = aggregation;
    }

    this._sort.push(sort);

    return this;
  }

  build(): Sort[] {
    return this._sort;
  }
}
