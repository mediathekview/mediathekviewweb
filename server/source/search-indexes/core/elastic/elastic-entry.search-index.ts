import type { IndexedEntry } from '$shared/models/core';
import type { Client } from '@elastic/elasticsearch';
import type { Logger } from '@tstdl/base/logger';
import type { ElasticIndexMapping, ElasticIndexSettings } from '@tstdl/elasticsearch';
import { ElasticSearchIndex } from '@tstdl/elasticsearch';

/* eslint-disable @typescript-eslint/naming-convention */
const settings: ElasticIndexSettings = {

};

const mapping: ElasticIndexMapping<IndexedEntry> = {
  properties: {
    id: {
      type: 'keyword',
      index: true
    },
    source: {
      type: 'keyword',
      index: false
    },
    tag: {
      type: 'keyword',
      index: false
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
      type: 'long',
      index: true
    },
    date: {
      type: 'integer',
      index: true
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
    }
  }
};
/* eslint-enable @typescript-eslint/naming-convention */

export class ElasticEntrySearchIndex extends ElasticSearchIndex<IndexedEntry> {
  constructor(client: Client, indexName: string, logger: Logger) {
    super(client, indexName, settings, mapping, new Set(), logger);
  }
}
