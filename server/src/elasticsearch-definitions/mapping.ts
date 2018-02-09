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
      dynamic: 'strict',
      properties: {
        lastSeenTimestamp: {
          type: 'long',
          index: true
        },
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
    sourceIdentifier: {
      type: 'keyword',
      index: false,
    }
  }
}
