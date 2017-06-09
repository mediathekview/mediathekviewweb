import { IQuery, IWordQuery, ITextQuery, TextQueryMode, IAndQuery } from '../query';
import { QueryResponse, QueryOptions } from '../model';
import * as Redis from 'ioredis';

interface IRedisQuery<T> extends IQuery<T> {
  getResultSet(transaction: Redis.Pipeline): string;
  cleanUp(transaction: Redis.Pipeline);
  transaction(transaction: Redis.Pipeline);
}

abstract class RedisQueryBase implements IRedisQuery<any> {
  private itemType: string;
  private _transaction: Redis.Pipeline;

  _itemType(type: string) {
    this.itemType = type;
  }

  getKey(field: string, value: string = null) {
    return `${this.itemType}:${field}${(value != null) ? value : ''}`;
  }

  query(options: QueryOptions): Promise<QueryResponse<T>> {
    this.getResultSet(this._transaction);

    this._transaction.spop
  }

  transaction(transaction: Redis.Pipeline) {
    this._transaction = transaction;
  }

  abstract getResultSet(transaction: Redis.Pipeline);
  abstract cleanUp(transaction: Redis.Pipeline);
}

export class RedisWordQuery<T> extends RedisQueryBase implements IRedisQuery<T>, IWordQuery<T> {
  private _field: string;

  field(value: string): RedisWordQuery<T> {
    this._field = value;
    return this;
  }

  set(value: string): RedisWordQuery<T> {
    return this;
  }

  getResultSet(transaction: Redis.Pipeline): string {
    throw;
  }

  cleanUp(transaction: Redis.Pipeline) {
    transaction.del
  }
}


export class RedisTextQuery<T> implements ITextQuery<T> {
  private _field: string;

  field(value: string): RedisTextQuery<T> {
    this._field = value;
    return this;
  }

  async query(): Promise<QueryResponse<T>> {
    throw '';
  }

  set(value: string): RedisTextQuery<T> {

    return this;
  }

  mode(mode: TextQueryMode): RedisTextQuery<T> {

    return this;
  }

  minMatch(percentage: number): RedisTextQuery<T> {

    return this;
  }
}

export class RedisAndQuery implements IAndQuery<T> {
  query() { }

  add(...queries: IRedisQuery[]): RedisAndQuery {

    return this;
  }
}
