export const ElasticsearchMapping = {
  properties: {
    channel: {
      type: 'text',
      index: true,
      analyzer: 'mvw_index_analyzer',
      search_analyzer: 'mvw_search_analyzer',
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
      analyzer: 'mvw_index_analyzer',
      search_analyzer: 'mvw_search_analyzer',
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
      analyzer: 'mvw_index_analyzer',
      search_analyzer: 'mvw_search_analyzer'
    },
    description: {
      type: 'text',
      index: true,
      analyzer: 'mvw_index_analyzer',
      search_analyzer: 'mvw_search_analyzer'
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
    lastSeen: {
      type: 'long',
      index: true
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
}
