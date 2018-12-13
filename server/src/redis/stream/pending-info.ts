export type PendingInfoConsumer = {
  name: string,
  count: number
};

export type PendingInfo = {
  count: number,
  firstId: string,
  lastId: string,
  consumers: PendingInfoConsumer[]
};
