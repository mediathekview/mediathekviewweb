export type MediaInfoBase = {
  size: number,
  format: string,
  codec: string,
  bitrate: number,
  duration: number
};

export type ContainerInfo = MediaInfoBase;

export type VideoInfo = MediaInfoBase & {
  framerate: number,
  width: number,
  height: number,
  aspectratio: number,
  bitdepth: number
};

export type AudioInfo = MediaInfoBase & {
  channels: number,
  samplingrate: number,
  bitdepth: number
};

export type MediaInfo = {
  container: ContainerInfo,
  video: VideoInfo[],
  audio: AudioInfo[]
};

export class MediaInfoApi {
  getMediaInfo(_file: string): MediaInfo {
    throw new Error('not implemented');
  }
}
