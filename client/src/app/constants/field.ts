import { Field } from '../shared/models';

export type FieldViewModel = {
  field: Field,
  display: string
};

export const fieldView: FieldViewModel[] = [
  { field: Field.Channel, display: 'channel' },
  { field: Field.Topic, display: 'topic' },
  { field: Field.Title, display: 'title' },
  { field: Field.Timestamp, display: 'timestamp' },
  { field: Field.Date, display: 'date' },
  { field: Field.Time, display: 'time' },
  { field: Field.Duration, display: 'duration' },
  { field: Field.FirstSeen, display: 'firstSeen' },
  { field: Field.LastSeen, display: 'lastSeen' }
];
