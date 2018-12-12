import { Redis } from 'ioredis';
import { Consumer } from './consumer';
import { ConsumerGroup } from './consumer-group';
import { Entry, SourceEntry } from './entry';
import { StreamInfo } from './stream-info';
import { Nullable } from '../../common/utils';

export class RedisStream<T> {
  private readonly redis: Redis;
  private readonly stream: string;

  constructor(redis: Redis, stream: string) {
    this.redis = redis;
    this.stream = stream;
  }

  async add(entry: SourceEntry<T>): Promise<string> {
    const { id: sourceId, data } = entry;
    const parameters = this.buildFieldValueArray(data);

    const id = await this.redis.xadd(this.stream, (sourceId != null) ? sourceId : '*', ...parameters) as string;
    return id;
  }

  async addMany(entries: SourceEntry<T>[]): Promise<string[]> {
    const transaction = this.redis.multi();

    for (const entry of entries) {
      const { id: sourceId, data } = entry;
      const parameters = this.buildFieldValueArray(data);

      transaction.xadd(this.stream, (sourceId != null) ? sourceId : '*', ...parameters);
    }

    const results = await transaction.exec() as [Nullable<Error>, string][];
    const ids = results.map(([, id]) => id);

    return ids;
  }

  async getInfo(): Promise<StreamInfo<T>> {
    const info = await this.redis.xinfo('STREAM', this.stream) as (string | number | [string, string[]])[];
    const streamInfo = this.parseStreamInfo(info);

    return streamInfo;
  }

  async hasGroup(name: string): Promise<boolean> {
    const groups = await this.getGroups();
    return groups.some((group) => group.name == name);
  }

  async getGroups(): Promise<ConsumerGroup[]> {
    const info = await this.redis.xinfo('GROUPS', this.stream) as (string | number)[][];
    const groups = info.map((groupInfo) => this.parseGroupInfo(groupInfo));

    return groups;
  }

  async getConsumers(group: string): Promise<Consumer[]> {
    const info = await this.redis.xinfo('CONSUMERS', this.stream, group) as (string | number)[][];
    const consumers = info.map((consumerInfo) => this.parseConsumer(consumerInfo));

    return consumers;
  }

  async createGroup(group: string): Promise<void>;
  async createGroup(group: string, startAtId: '0' | '$' | string): Promise<void>;
  async createGroup(group: string, makeStream: boolean): Promise<void>
  async createGroup(group: string, startAtId: '0' | '$' | string, makeStream: boolean): Promise<void>;
  async createGroup(group: string, startAtIdOrMakeStream?: '0' | '$' | string | boolean, makeStream: boolean = false): Promise<void> {
    const startAtId = (typeof startAtIdOrMakeStream == 'string') ? startAtIdOrMakeStream : '0';

    if (typeof startAtIdOrMakeStream == 'boolean') {
      makeStream = startAtIdOrMakeStream;
    }

    await this.redis.xgroup('CREATE', this.stream, group, startAtId, ...(makeStream ? ['MKSTREAM'] : []));
  }

  private buildFieldValueArray(data: StringMap) {
    const parameters: string[] = [];
    const fields = Object.keys(data);

    for (const field of fields) {
      parameters.push(field, (data as StringMap)[field]);
    }

    return parameters;
  }

  private parseStreamInfo(info: (string | number | [string, string[]])[]): StreamInfo<T> {
    const consumerGroup: StreamInfo<T> = {} as any;

    for (let i = 0; i < info.length; i += 2) {
      switch (info[i]) {
        case 'length':
          consumerGroup.length = info[i + 1] as number;
          break;

        case 'radix-tree-keys':
          consumerGroup.radixTreeKeys = info[i + 1] as number;
          break;

        case 'radix-tree-nodes':
          consumerGroup.radixTreeNodes = info[i + 1] as number;
          break;

        case 'groups':
          consumerGroup.groups = info[i + 1] as number;
          break;

        case 'first-entry':
          consumerGroup.firstEntry = this.parseEntry(info[i + 1] as [string, string[]]);
          break;

        case 'last-entry':
          consumerGroup.lastEntry = this.parseEntry(info[i + 1] as [string, string[]]);
          break;
      }
    }

    return consumerGroup;
  }

  private parseEntry([id, dataArray]: [string, string[]]): Entry<T> {
    const entry: Entry<T> = { id, data: {} } as any;

    for (let i = 0; i < dataArray.length; i += 2) {
      const field = dataArray[i];
      const value = dataArray[i + 1];

      (entry.data as StringMap)[field] = value;
    }

    return entry;
  }

  private parseGroupInfo(info: (string | number)[]): ConsumerGroup {
    const consumerGroup: ConsumerGroup = {} as any;

    for (let i = 0; i < info.length; i += 2) {
      switch (info[i]) {
        case 'name':
          consumerGroup.name = info[i + 1] as string;
          break;

        case 'consumers':
          consumerGroup.consumers = info[i + 1] as number;
          break;

        case 'pending':
          consumerGroup.pending = info[i + 1] as number;
          break;
      }
    }

    return consumerGroup;
  }

  private parseConsumer(info: (string | number)[]): Consumer {
    const consumer: Consumer = {} as any;

    for (let i = 0; i < info.length; i += 2) {
      switch (info[i]) {
        case 'name':
          consumer.name = info[i + 1] as string;
          break;

        case 'pending':
          consumer.pending = info[i + 1] as number;
          break;

        case 'idle':
          consumer.idle = info[i + 1] as number;
          break;
      }
    }

    return consumer;
  }
}
