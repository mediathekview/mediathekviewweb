import * as URL from 'url';
import * as querystring from 'querystring';
import * as RSS from 'rss';

export default class RSSFeedGenerator {
  searchEngine: any;

  constructor(searchEngine) {
    this.searchEngine = searchEngine;
  }

  createFeed(requestUrl, callback) {
    let url = URL.parse(requestUrl);
    let urlQuery = querystring.parse(url.query);

    let parsedQuery = this.parseQuery(urlQuery.query || '');
    let queries = [];

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

    let queryObj = {
      queries: queries,
      sortBy: 'timestamp',
      sortOrder: 'desc',
      future: urlQuery.future || false,
      offset: 0,
      size: 10
    };

    this.searchEngine.search(queryObj, (result, err) => {
      if (err) {
        callback(err, null);
      } else {
        let siteUrl = URL.format({
          protocol: url.protocol,
          slashes: url.slashes,
          auth: url.auth,
          host: url.host,
          port: url.port,
          hostname: url.hostname,
          hash: url.query,
          pathname: '/'
        });

        let rss = new RSS({
          title: 'MVW - ' + urlQuery.query + (urlQuery.everywhere ? ' | Überall' : '') + (urlQuery.future ? ' | Zukünftige' : ''),
          ttl: 75,
          description: urlQuery.query + (urlQuery.everywhere ? ' | Überall' : '') + (urlQuery.future ? ' | Zukünftige' : ''),
          feed_url: requestUrl,
          site_url: siteUrl
        });

        for (let i = 0; i < result.result.length; i++) {
          let item = result.result[i];

          rss.item({
            author: item.channel,
            categories: [item.topic],
            title: item.title,
            description: item.description,
            url: siteUrl,
            guid: item.id,
            date: new Date(item.timestamp * 1000)
          });
        }

        let feed = rss.xml({
          indent: true
        });

        callback(null, feed);
      }
    });
  }

  parseQuery(query) {
    let channels = [];
    let topics = [];
    let titles = [];
    let descriptions = [];
    let generics = [];

    let splits = query.trim().toLowerCase().split(/\s+/).filter((split) => {
      return (split.length > 0);
    });

    for (let i = 0; i < splits.length; i++) {
      let split = splits[i];

      if (split[0] == '!') {
        let c = split.slice(1, split.length).split(',').filter((split) => {
          return (split.length > 0);
        });
        if (c.length > 0) {
          channels.push(c);
        }
      } else if (split[0] == '#') {
        let t = split.slice(1, split.length).split(',').filter((split) => {
          return (split.length > 0);
        });
        if (t.length > 0) {
          topics.push(t);
        }
      } else if (split[0] == '+') {
        let t = split.slice(1, split.length).split(',').filter((split) => {
          return (split.length > 0);
        });
        if (t.length > 0) {
          titles.push(t);
        }
      } else if (split[0] == '*') {
        let d = split.slice(1, split.length).split(',').filter((split) => {
          return (split.length > 0);
        });
        if (d.length > 0) {
          descriptions.push(d);
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
      generics: generics
    }
  }
}
