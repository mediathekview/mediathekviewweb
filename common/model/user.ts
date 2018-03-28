import { Entity } from './entity';

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

export type GuestUser = {
  type: UserType.Guest;
  username: null;
  email: null;
  birthday: null;
}

export type RegisteredUser = {
  type: UserType.Registered;
  username: string;
  email: string;
  birthday: Date;
}
