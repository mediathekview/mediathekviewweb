import { Entity, EntityWithPartialId } from './entity';

export enum UserType {
  Guest = 'guest',
  Registered = 'registered'
}

export type User = Entity & {
  type: UserType;
  username: null | string;
  email: null | string;
  birthday: null | Date;
}

export type GuestUser = Entity & {
  type: UserType.Guest;
  username: null;
  email: null;
  birthday: null;
}

export type RegisteredUser = Entity & {
  type: UserType.Registered;
  username: string;
  email: string;
  birthday: Date;
}

export type UserWithPartialId = EntityWithPartialId<User>;
export type GuestUserWithPartialId = EntityWithPartialId<GuestUser>;
export type RegisteredUserWithPartialId = EntityWithPartialId<RegisteredUser>;