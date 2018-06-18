import { Entity, EntityWithPartialId } from './entity';
import { Quality } from './entry';

export enum UserActionType {
  Visit = 'visit',
  Download = 'download',
  Play = 'play',
  Pause = 'pause',
  Comment = 'comment',
  Rating = 'rating'
}

export type UserActionFilter = Partial<Visit | Download | Play | Pause | Comment | Rating>;

export type UserAction = Entity & {
  actionType: UserActionType;
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
  actionType: UserActionType.Visit;
  route: string;
}

export type Download = EntryAction & {
  actionType: UserActionType.Download;
  quality: Quality;
}

export type Play = PlayPause & {
  actionType: UserActionType.Play;
  quality: Quality;
}

export type Pause = PlayPause & {
  actionType: UserActionType.Pause;
}

export type Comment = EntryAction & {
  actionType: UserActionType.Comment;
  text: string;
}

export type Rating = EntryAction & {
  actionType: UserActionType.Rating;
  value: number;
}

export type UserActionWithPartialId = EntityWithPartialId<UserAction>;

export type VisitWithPartialId = EntityWithPartialId<Visit>;

export type DownloadWithPartialId = EntityWithPartialId<Download>;

export type PlayWithPartialId = EntityWithPartialId<Play>;

export type PauseWithPartialId = EntityWithPartialId<Pause>;

export type CommentWithPartialId = EntityWithPartialId<Comment>;

export type RatingWithPartialId = EntityWithPartialId<Rating>;