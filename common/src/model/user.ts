import { Entity } from './entity';

export type User = Entity & {
  username: string;
  registered: boolean;
  yearOfBirth: number | null;
}
