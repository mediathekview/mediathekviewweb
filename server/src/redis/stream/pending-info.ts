export type PendingConsumerInfo = {
  name: string,
  count: number
};

export type PendingInfo = {
  count: number,
  firstId: string | null,
  lastId: string | null,
  consumers: PendingConsumerInfo[]
};
