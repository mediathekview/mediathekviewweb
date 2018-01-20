/*
export interface IEntry {
  id: string;
  metadata?: IEntryMetadata;

  channel: string;
  topic: string;
  title: string;
  timestamp: number;
  duration: number;
  description: string;
  website: string;
  media: IMedia[];
}

export interface IEntryMetadata {
  lastSeen: number;
  downloads: IUserAction[];
  plays: IUserAction[];
  secondsPlayed?: number;
  secondsPaused?: number;
}

export interface IUserAction {
  userID: string;
  timestamp: number;
}

export interface IMedia {
  type: MediaType;
  url: string;
  size: number;
}
*/

const UserActionMapping = {
  type: 'nested',
  dynamic: false,
  properties: {
    userID: {
      type: 'keyword',
      index: false,
    },
    timestamp: {
      type: 'long',
      index: true,
    }
  }
}

export const ElasticsearchMapping = {
  properties: {
    channel: {
      type: 'text',
      index: true,
      analyzer: 'german',
      search_analyzer: 'german',
      fielddata: true,
      fields: {
        keyword: {
          type: 'keyword'
        }
      }
    },
    topic: {
      type: 'text',
      index: true,
      analyzer: 'german',
      search_analyzer: 'german',
      fielddata: true,
      fields: {
        keyword: {
          type: 'keyword'
        }
      }
    },
    title: {
      type: 'text',
      index: true,
      analyzer: 'german',
      search_analyzer: 'german'
    },
    description: {
      type: 'text',
      index: true,
      analyzer: 'german',
      search_analyzer: 'german'
    },
    timestamp: {
      type: 'date',
      index: true,
      format: 'epoch_second',
    },
    duration: {
      type: 'long',
      index: true,
    },
    website: {
      type: 'keyword',
      index: false,
    },
    media: {
      type: 'nested',
      dynamic: false,
      properties: {
        type: {
          type: 'byte',
          index: true
        },
        url: {
          type: 'keyword',
          index: false
        },
        size: {
          type: 'long',
          index: true
        },
        quality: {
          type: 'byte',
          index: true
        }
      }
    },
    metadata: {
      type: 'object',
      dynamic: false,
      properties: {
        lastSeen: {
          type: 'long',
          index: true
        },
        downloads: UserActionMapping,
        plays: UserActionMapping,
        secondsPlayed: {
          type: 'long',
          index: true
        },
        secondsPaused: {
          type: 'long',
          index: true
        }
      }
    }
  }
}
