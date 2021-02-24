/* eslint-disable @typescript-eslint/naming-convention */
import type { IndicesPutMapping } from '@elastic/elasticsearch/api/requestParams';
import type { StringMap } from '@tstdl/base/types';
import { assertDefinedPass } from '@tstdl/base/utils';

export const elasticsearchMapping: IndicesPutMapping['body'] = {
  properties: {
    id: {
      type: 'keyword',
      index: true
    },
    channel: {
      type: 'text',
      index: true,
      analyzer: 'mvw_index_analyzer',
      search_analyzer: 'mvw_search_analyzer',
      fields: {
        keyword: {
          type: 'keyword',
          ignore_above: 256
        }
      }
    },
    topic: {
      type: 'text',
      index: true,
      analyzer: 'mvw_index_analyzer',
      search_analyzer: 'mvw_search_analyzer',
      fields: {
        keyword: {
          type: 'keyword',
          ignore_above: 256
        }
      }
    },
    title: {
      type: 'text',
      index: true,
      analyzer: 'mvw_index_analyzer',
      search_analyzer: 'mvw_search_analyzer',
      fields: {
        keyword: {
          type: 'keyword',
          ignore_above: 256
        }
      }
    },
    description: {
      type: 'text',
      index: true,
      analyzer: 'mvw_index_analyzer',
      search_analyzer: 'mvw_search_analyzer',
      fields: {
        keyword: {
          type: 'keyword',
          ignore_above: 256
        }
      }
    },
    timestamp: {
      type: 'date',
      index: true,
      format: 'epoch_millis'
    },
    date: {
      type: 'date',
      index: true,
      format: 'epoch_millis'
    },
    time: {
      type: 'integer',
      index: true
    },
    duration: {
      type: 'integer',
      index: true
    },
    website: {
      type: 'keyword',
      index: false
    },
    firstSeen: {
      type: 'date',
      index: true,
      format: 'epoch_millis'
    },
    lastSeen: {
      type: 'date',
      index: true,
      format: 'epoch_millis'
    },
    media: {
      type: 'object',
      dynamic: 'strict',
      properties: {
        type: {
          type: 'keyword',
          index: true
        },
        url: {
          type: 'keyword',
          index: false
        },
        size: {
          type: 'long',
          index: false
        },
        quality: {
          type: 'object',
          dynamic: 'strict',
          properties: {
            resolution: {
              type: 'object',
              dynamic: 'strict',
              properties: {
                width: {
                  type: 'integer',
                  index: false
                },
                height: {
                  type: 'integer',
                  index: false
                }
              }
            },
            bitrate: {
              type: 'long',
              index: false
            }
          }
        }
      }
    },
    metadata: {
      type: 'object',
      dynamic: 'strict',
      properties: {
        downloads: {
          type: 'long',
          index: true
        },
        plays: {
          type: 'long',
          index: true
        },
        comments: {
          type: 'long',
          index: true
        },
        averageRating: {
          type: 'float',
          index: true
        },
        secondsPlayed: {
          type: 'long',
          index: true
        },
        secondsPaused: {
          type: 'long',
          index: true
        }
      }
    },
    source: {
      type: 'object',
      properties: {
        identifier: {
          type: 'keyword',
          index: false
        }
      }
    }
  }
};

export const textTypeFields = Object.getOwnPropertyNames(elasticsearchMapping.properties).filter((property) => {
  const type = assertDefinedPass((elasticsearchMapping.properties as StringMap<{ type: string }>)[property]).type;
  const isTextType = type == 'text';

  return isTextType;
});
