import { PartialProperty } from '@common-ts/base/types';

export type Entity = {
  id: string;
};

export type EntityWithPartialId<T extends Entity> = PartialProperty<T, 'id'>;
