import type { Entity, NewEntity } from '@tstdl/database';

export enum UserType {
  Guest = 0,
  Registered = 1
}

type UserBase<Type extends UserType> = Entity & {
  type: Type
};

export type GuestUser = UserBase<UserType.Guest> & {
  type: UserType.Guest
};

export type RegisteredUser = UserBase<UserType.Registered> & {
  username: string,
  email: string,
  birthday: Date
};

export type User = GuestUser | RegisteredUser;

export type NewGuestUser = NewEntity<GuestUser>;
export type NewRegisteredUser = NewEntity<RegisteredUser>;
export type NewUser = NewEntity<User>;
