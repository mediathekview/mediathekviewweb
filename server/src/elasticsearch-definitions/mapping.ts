export const ElasticsearchMapping = {
  properties: {
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
      format: 'epoch_second',
    },
    date: {
      type: 'date',
      index: true,
      format: 'epoch_second',
    },
    time: {
      type: 'integer',
      index: true
    },
    duration: {
      type: 'integer',
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
      type: 'date',
      index: true,
      format: 'epoch_second',
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

const textTypeFields = Object.getOwnPropertyNames(ElasticsearchMapping.properties)
  .filter((property) => {
    const type = (ElasticsearchMapping.properties as StringMap)[property].type;
    const isTextType = type == 'text';
    return isTextType;
  });

export const TextTypeFields = textTypeFields;