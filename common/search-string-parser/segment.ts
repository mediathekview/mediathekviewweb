export enum SegmentType {
  Normal,
  Quoted,
  Pattern
}

export type Segment = {
  readonly type: SegmentType,
  readonly exclude: boolean,
  readonly selector: string,
  readonly value: string,
  readonly sourceIndex: number,
  readonly sourceLength: number
};
