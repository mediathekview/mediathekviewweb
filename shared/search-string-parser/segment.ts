export enum SegmentType {
  Normal = 0,
  Quoted = 1,
  Pattern = 2
}

export type Segment = {
  readonly type: SegmentType,
  readonly exclude: boolean,
  readonly selector: string,
  readonly value: string,
  readonly sourceIndex: number,
  readonly sourceLength: number
};
