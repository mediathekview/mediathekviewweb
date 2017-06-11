import { ISearchEngineBackend, State } from './backend';
import * as Queries from './query';

export class SearchEngine<T> {
  backend: ISearchEngineBackend<T>;

  constructor(backend: ISearchEngineBackend<T>) {
    this.backend = backend;
  }

  index(...items: T[]): Promise<void> {
    return this.backend.index(items);
  }

  state(): Promise<State> {
    return this.backend.state();
  }

  getWordQuery(): Queries.IWordQuery<T> {
    return this.backend.getWordQuery();
  }

  getTextQuery(): Queries.ITextQuery<T> {
    return this.backend.getTextQuery();
  }

  getRangeQuery(): Queries.IRangeQuery<T> {
    return this.backend.getRangeQuery();
  }

  getAndQuery(): Queries.IAndQuery<T> {
    return this.backend.getAndQuery();
  }

  getOrQuery(): Queries.IOrQuery<T> {
    return this.backend.getOrQuery();
  }
}
