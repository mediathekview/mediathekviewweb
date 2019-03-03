import { PartialProperty } from '../types';

export type Entity = {
  id: string;
};

export type EntityWithPartialId<T extends Entity> = PartialProperty<T, 'id'>;
