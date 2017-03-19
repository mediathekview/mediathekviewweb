export interface Entry {
    id?: string;
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
    quality: Quality; // for example "High", "Mid" & "Low"
    size: number;
}

export enum Quality {
    UltraLow = 0,
    VeryLow = 1,
    Low = 2,
    Medium = 3,
    High = 4
}
