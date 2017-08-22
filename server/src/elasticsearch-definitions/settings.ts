export const ElasticsearchSettings = {
  settings: {
      analysis: {
        filter: {
          german_stop: {
            type:       'stop',
            stopwords:  '_german_'
          },
          german_stemmer: {
            type:       'stemmer',
            language:   'light_german'
          }
        },
        analyzer: {
          german: {
            tokenizer:  'standard',
            filter: [
              'lowercase',
              'german_stop',
              'german_normalization',
              'german_stemmer'
            ]
          }
        }
      }
    }
}
