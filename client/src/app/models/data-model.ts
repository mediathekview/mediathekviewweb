export interface Entry {
  channel: string;
  topic: string;
  title: string;
  timestamp: number;
  duration: number;
  description: string;
  website: string;
  videos: Video[];
}

export interface Video {
  url: string;
  text: string; // for example "High", "Mid" & "Low"
  size: number;
}
