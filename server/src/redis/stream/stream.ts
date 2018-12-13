import { Redis } from 'ioredis';
import { SyncEnumerable } from '../../common/enumerable';
import { Nullable } from '../../common/utils';
import { Consumer } from './consumer';
import { ConsumerGroup } from './consumer-group';
import { Entry } from './entry';
import { SourceEntry } from './source-entry';
import { StreamInfo } from './stream-info';
import { PendingEntry } from './pending-entry';
import { PendingInfo, PendingInfoConsumer as PendingConsumerInfo } from './pending-info';

export type ReadParameters = {
  id: string,
  count?: number,
  block?: number
};

export type ReadGroupParameters = {
  id: string,
  group: string,
  consumer: string,
  count?: number,
  block?: number,
  noAck?: boolean
};

export type GetPendingInfoParameters = {
  group: string,
  consumer?: string,
};

export type GetPendingEntriesParameters = GetPendingInfoParameters & {
  start: string,
  end: string,
  count: number
};

export type ClaimParameters = {
  group: string,
  consumer: string,
  minimumIdleTime: number,
  ids: string[]
};

type StreamReadData =
  [
    string,
    [
      string,
      string[]
    ][]
  ][];

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

  async read(parameters: ReadParameters): Promise<Entry<T>[]> {
    const { id, block, count } = parameters;

    const parametersArray = [
      ...(count != null ? ['COUNT', count] : []),
      ...(block != null ? ['BLOCK', block] : []),
      'STREAMS', this.stream,
      'ID', id
    ];

    const data = await this.redis.xread(...parametersArray) as StreamReadData;
    const entries = this.parseStreamReadData(data);

    return entries;
  }

  async readGroup(parameters: ReadGroupParameters): Promise<Entry<T>[]> {
    const { id, group, consumer, count, block, noAck } = parameters;

    const parametersArray = [
      'GROUP', group, consumer,
      ...(count != null ? ['COUNT', count] : []),
      ...(block != null ? ['BLOCK', block] : []),
      ...(noAck != null ? ['NOACK'] : []),
      'STREAMS', this.stream,
      'ID', id
    ] as ['GROUP', string, string, ...string[]];

    const data = await this.redis.xreadgroup(...parametersArray) as StreamReadData;
    const entries = this.parseStreamReadData(data);

    return entries;
  }

  async acknowledge(group: string, ...ids: string[]): Promise<number> {
    const acknowledgedCount = await this.redis.xack(this.stream, group, ...ids);
    return acknowledgedCount;
  }

  async claim(): Promise<void> {

  }

  async trim(maxLength: number, approximate: boolean): Promise<number> {
    const trimmedCount = await this.redis.xtrim(this.stream, 'MAXLEN', ...(approximate ? ['~'] : []), maxLength);
    return trimmedCount;
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

  async getPendingInfo(parameters: GetPendingInfoParameters): Promise<PendingInfo> {
    const { group, consumer } = parameters;

    const [count, firstId, lastId, pendingConsumerInfo] = await this.redis.xpending(this.stream, group, ...(consumer != null ? [consumer] : [])) as [number, string, string, [string, string][]];
    const consumers: PendingConsumerInfo[] = pendingConsumerInfo.map(([name, count]) => ({ name, count: parseInt(count) }));
    const pendingInfo: PendingInfo = {
      count,
      firstId,
      lastId,
      consumers
    };

    return pendingInfo;
  }

  async getPendingEntries(parameters: GetPendingEntriesParameters): Promise<PendingEntry[]> {
    const { group, consumer, start, end, count } = parameters;

    const info = await this.redis.xpending(this.stream, group, start, end, count, ...(consumer != null ? [consumer] : [])) as [string, string, number, number][];
    const pendingEntries: PendingEntry[] = info.map(([id, consumerName, elapsed, deliveryCount]) => ({ id, consumerName, elapsed, deliveryCount }));

    return pendingEntries;
  }

  async createGroup(group: string): Promise<void>;
  async createGroup(group: string, startAtId: '0' | '$' | string): Promise<void>;
  async createGroup(group: string, makeStream: boolean): Promise<void>;
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

  private parseStreamReadData(data: StreamReadData): Entry<T>[] {
    const entries = SyncEnumerable.from(data)
      .mapMany(([stream, entries]) => entries)
      .map((entry) => this.parseEntry(entry))
      .toArray();

    return entries;
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
