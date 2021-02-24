/* eslint-disable @typescript-eslint/naming-convention */

import type { IndicesPutSettings } from '@elastic/elasticsearch/api/requestParams';

export const elasticsearchSettings: IndicesPutSettings['body'] = {
  settings: {
    refresh_interval: '3s',
    analysis: {
      analyzer: {
        mvw_index_analyzer: {
          type: 'custom',
          tokenizer: 'standard',
          filter: [
            'german_normalization',
            'german_stemmer',
            'lowercase',
            'edge_ngram'
          ]
        },
        mvw_search_analyzer: {
          type: 'custom',
          tokenizer: 'standard',
          filter: [
            'german_normalization',
            'german_stemmer',
            'lowercase'
          ]
        }
      },
      filter: {
        german_stemmer: {
          type: 'stemmer',
          language: 'light_german'
        },
        edge_ngram: {
          type: 'edge_ngram',
          min_gram: 1,
          max_gram: 25
        }
      }
    }
  }
};
