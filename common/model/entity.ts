export type Entity = {
  id: string;
};

export type EntityWithPartialId<T extends Entity = Entity> = PartialProperty<T, 'id'>;
