import { Entity } from './entity';

export type UserAction = Entity & {
  userID: string;
  timestamp: number;
}

export type Visit = UserAction & {
  route: string;
}

export type EntryAction = UserAction & {
  entryID: string;
}

export type Download = EntryAction;

export type Play = EntryAction & {
  seconds: number;
}

export type Comment = EntryAction & {
  text: string;
}

export type Rating = EntryAction & {
  value: number;
}
