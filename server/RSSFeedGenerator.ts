import * as querystring from 'querystring';
import RSS from 'rss';
import * as URL from 'url';
import SearchEngine from './SearchEngine';

export default class RSSFeedGenerator {
  searchEngine: SearchEngine;

  constructor(searchEngine) {
    this.searchEngine = searchEngine;
  }

  createFeed(requestUrl, callback) {
    const url = URL.parse(requestUrl);
    const urlQuery = querystring.parse(url.query);

    const parsedQuery = this.parseQuery(urlQuery.query || '');
    const queries = [];

    for (let i = 0; i < parsedQuery.channels.length; i++) {
      queries.push({
        fields: ['channel'],
        query: parsedQuery.channels[i].join(' ')
      });
    }

    for (let i = 0; i < parsedQuery.topics.length; i++) {
      queries.push({
        fields: ['topic'],
        query: parsedQuery.topics[i].join(' ')
      });
    }

    for (let i = 0; i < parsedQuery.titles.length; i++) {
      queries.push({
        fields: ['title'],
        query: parsedQuery.titles[i].join(' ')
      });
    }

    for (let i = 0; i < parsedQuery.descriptions.length; i++) {
      queries.push({
        fields: ['description'],
        query: parsedQuery.descriptions[i].join(' ')
      });
    }

    if (parsedQuery.generics.length > 0) {
      queries.push({
        fields: urlQuery.everywhere ? ['channel', 'topic', 'title', 'description'] : ((parsedQuery.topics.length == 0) ? ['topic', 'title'] : ['title']),
        query: parsedQuery.generics.join(' ')
      });
    }

    const queryObj = {
      queries: queries,
      sortBy: 'timestamp',
      sortOrder: 'desc',
      future: urlQuery.future || false,
      duration_min: parsedQuery.duration_min,
      duration_max: parsedQuery.duration_max,
      offset: (typeof urlQuery.offset == 'string') ? parseInt(urlQuery.offset) : 0,
      size: (typeof urlQuery.size == 'string') ? parseInt(urlQuery.size) : 50
    };

    this.searchEngine.search(queryObj, (result, err) => {
      if (err) {
        callback(err, null);
      } else {
        const siteUrl = URL.format({
          protocol: url.protocol,
          slashes: url.slashes,
          auth: url.auth,
          host: url.host,
          port: url.port,
          hostname: url.hostname,
          hash: url.query,
          pathname: '/'
        });

        const rss = new RSS({
          title: 'MVW - ' + urlQuery.query + (urlQuery.everywhere ? ' | Überall' : '') + (urlQuery.future ? ' | Zukünftige' : ''),
          ttl: 75,
          description: urlQuery.query + (urlQuery.everywhere ? ' | Überall' : '') + (urlQuery.future ? ' | Zukünftige' : ''),
          feed_url: requestUrl,
          site_url: siteUrl
        });

        for (let i = 0; i < result.result.length; i++) {
          const item = result.result[i];

          rss.item({
            author: item.channel,
            categories: [item.topic],
            title: item.title,
            description: item.description,
            url: item.url_video_hd || item.url_video,
            guid: item.id,
            date: new Date(item.timestamp * 1000),
            enclosure: {
              url: item.url_video_hd || item.url_video,
              size: item.size
            },
            custom_elements: [
              {
                duration: item.duration
              },
              {
                websiteUrl: item.url_website
              },
            ]
          });
        }

        const feed = rss.xml({
          indent: true
        });

        callback(null, feed);
      }
    });
  }

  parseQuery(query) {
    const channels = [];
    const topics = [];
    const titles = [];
    const descriptions = [];
    let generics = [];
    let duration_min = undefined;
    let duration_max = undefined;

    const splits = query.trim().toLowerCase().split(/\s+/).filter((split) => {
      return (split.length > 0);
    });

    for (let i = 0; i < splits.length; i++) {
      const split = splits[i];

      if (split[0] == '!') {
        const c = split.slice(1, split.length).split(',').filter((split) => {
          return (split.length > 0);
        });
        if (c.length > 0) {
          channels.push(c);
        }
      } else if (split[0] == '#') {
        const t = split.slice(1, split.length).split(',').filter((split) => {
          return (split.length > 0);
        });
        if (t.length > 0) {
          topics.push(t);
        }
      } else if (split[0] == '+') {
        const t = split.slice(1, split.length).split(',').filter((split) => {
          return (split.length > 0);
        });
        if (t.length > 0) {
          titles.push(t);
        }
      } else if (split[0] == '*') {
        const d = split.slice(1, split.length).split(',').filter((split) => {
          return (split.length > 0);
        });
        if (d.length > 0) {
          descriptions.push(d);
        }
      } else if (split[0] == '>') {
        const d = split.slice(1, split.length).split(',').filter((split) => {
          return (split.length > 0);
        });
        if (d.length > 0 && !isNaN(d[0])) {
          duration_min = d[0] * 60;
        }
      } else if (split[0] == '<') {
        const d = split.slice(1, split.length).split(',').filter((split) => {
          return (split.length > 0);
        });
        if (d.length > 0 && !isNaN(d[0])) {
          duration_max = d[0] * 60;
        }
      } else {
        generics = generics.concat(split.split(/\s+/));
      }
    }

    return {
      channels: channels,
      topics: topics,
      titles: titles,
      descriptions: descriptions,
      duration_min: duration_min,
      duration_max: duration_max,
      generics: generics
    }
  }
}
