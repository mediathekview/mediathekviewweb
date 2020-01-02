import { PartialProperty } from '@tstdl/base/types';

export type Entity = {
  id: string;
};

export type EntityWithPartialId<T extends Entity = Entity> = PartialProperty<T, 'id'>;

export type EntityWithoutId<T extends Entity = Entity> = Omit<T, 'id'>;
