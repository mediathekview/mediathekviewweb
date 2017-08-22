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
  include_in_all: false,
  properties: {
    userID: {
      type: 'keyword',
      index: false,
      include_in_all: false
    },
    timestamp: {
      type: 'long',
      index: true,
      include_in_all: false
    }
  }
}

export const ElasticsearchMapping = {
  properties: {
    channel: {
      type: 'text',
      index: true,
      include_in_all: false,
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
      include_in_all: false,
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
      include_in_all: false,
      analyzer: 'german',
      search_analyzer: 'german'
    },
    description: {
      type: 'text',
      index: true,
      include_in_all: false,
      analyzer: 'german',
      search_analyzer: 'german'
    },
    timestamp: {
      type: 'date',
      index: true,
      include_in_all: false,
      format: 'epoch_second',
    },
    duration: {
      type: 'long',
      index: true,
      include_in_all: false,
    },
    website: {
      type: 'keyword',
      index: false,
      include_in_all: false
    },
    media: {
      type: 'nested',
      dynamic: false,
      include_in_all: false,
      properties: {
        type: {
          type: 'byte',
          index: true,
          include_in_all: false
        },
        url: {
          type: 'keyword',
          index: false,
          include_in_all: false
        },
        size: {
          type: 'long',
          index: true,
          include_in_all: false
        },
        quality: {
          type: 'byte',
          index: true,
          include_in_all: false
        }
      }
    },
    metadata: {
      type: 'object',
      dynamic: false,
      include_in_all: false,
      properties: {
        lastSeen: {
          type: 'long',
          index: true,
          include_in_all: false
        },
        downloads: UserActionMapping,
        plays: UserActionMapping,
        secondsPlayed: {
          type: 'long',
          index: true,
          include_in_all: false
        },
        secondsPaused: {
          type: 'long',
          index: true,
          include_in_all: false
        }
      }
    }
  }
}
