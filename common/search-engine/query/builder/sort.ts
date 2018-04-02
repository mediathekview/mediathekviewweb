import { Sort, Order, Aggregation } from '../';

export class SortBuilder {
  private readonly _sort: Sort[];

  constructor() {
    this._sort = [];
  }

  add(field: string, order: Order): this
  add(field: string, order: Order, aggregation: Aggregation): this
  add(field: string, order: Order, aggregation?: Aggregation): this {
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