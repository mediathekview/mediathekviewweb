import type { Indices_Common } from '@opensearch-project/opensearch/api/_types/index.js';
import type { Indices_PutMapping_RequestBody } from '@opensearch-project/opensearch/api/index.js';

export const mapping = {
  properties: {
    channel: {
      type: 'text',
      index: true,
      analyzer: 'mvw_index_analyzer',
      search_analyzer: 'mvw_search_analyzer',
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
      search_analyzer: 'mvw_search_analyzer'
    },
    timestamp: {
      type: 'date',
      format: 'epoch_second',
      index: true,
    },
    duration: {
      type: 'long',
      index: true
    },
    size: {
      type: 'long',
      index: false
    },
    url_video: {
      type: 'keyword',
      index: false
    },
    url_website: {
      type: 'keyword',
      index: false
    },
    url_video_low: {
      type: 'keyword',
      index: false
    },
    url_video_hd: {
      type: 'keyword',
      index: false
    },
    filmlisteTimestamp: {
      type: 'date',
      format: 'epoch_second',
      index: true,
    },
  }
} satisfies Indices_PutMapping_RequestBody;

export const settings = {
  refresh_interval: '3s',
  analysis: {
    analyzer: {
      mvw_index_analyzer: {
        type: 'custom',
        tokenizer: 'mvw_index_tokenizer',
        char_filter: ['toLatin'],
        filter: [
          'lowercase',
          'asciifolding'
        ]
      },
      mvw_search_analyzer: {
        type: 'custom',
        tokenizer: 'mvw_search_tokenizer',
        char_filter: ['toLatin'],
        filter: [
          'lowercase',
          'asciifolding'
        ]
      }
    },
    tokenizer: {
      mvw_index_tokenizer: {
        type: 'edge_ngram',
        min_gram: 1,
        max_gram: 25,
        token_chars: [
          'letter',
          'digit'
        ]
      },
      mvw_search_tokenizer: {
        type: 'simple_pattern',
        pattern: '[a-zA-Z0-9]+'
      }
    },
    filter: {
      asciifoldingPreserveOriginal: {
        type: 'asciifolding',
        'preserve_original': true
      }
    },
    char_filter: {
      toLatin: {
        type: 'mapping',
        mappings: [
          'à => a',
          'À => a',
          'á => a',
          'Á => a',
          'â => a',
          'Â => a',
          'ä => ae',
          'Ä => ae',
          'ã => a',
          'Ã => a',
          'å => a',
          'Å => a',
          'æ => ae',
          'Æ => ae',
          'è => e',
          'È => e',
          'é => e',
          'É => e',
          'ê => e',
          'Ê => e',
          'ë => e',
          'Ë => e',
          'ì => i',
          'Ì => i',
          'í => i',
          'Í => i',
          'î => i',
          'Î => i',
          'ï => i',
          'Ï => i',
          'ò => o',
          'Ò => o',
          'Ó => o',
          'ó => o',
          'ô => o',
          'Ô => o',
          'ö => oe',
          'Ö => oe',
          'õ => o',
          'Õ => ö',
          'ø => o',
          'Ø => o',
          'ù => u',
          'Ù => u',
          'ú => u',
          'Ú => u',
          'û => u',
          'Û => u',
          'ü => ue',
          'Ü => ue',
          'ý => y',
          'Ý => y',
          'ÿ => y',
          'Ÿ => y',
          'ç => c',
          'Ç => c',
          'œ => oe',
          'Œ => oe',
          'ß => ss',
          '& => und'
        ]
      }
    }
  }
} satisfies Indices_Common.IndexSettings;
