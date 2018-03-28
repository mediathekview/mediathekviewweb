import { Entity } from './entity';

type UserAction = Entity & {
  userID: string;
  timestamp: number;
}

type EntryAction = UserAction & {
  entryID: string;
}

type PlayPause = EntryAction & {
  seconds: number;
}

export type Visit = UserAction & {
  route: string;
}

export type Download = EntryAction;

export type Play = PlayPause;

export type Pause = PlayPause;

export type Comment = EntryAction & {
  text: string;
}

export type Rating = EntryAction & {
  value: number;
}
