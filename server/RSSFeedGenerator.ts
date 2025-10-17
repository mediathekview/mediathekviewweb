import * as querystring from 'querystring';
import RSS from 'rss';
import * as URL from 'url';
import { SearchEngine } from './SearchEngine';

export class RSSFeedGenerator {
  searchEngine: SearchEngine;

  constructor(searchEngine) {
    this.searchEngine = searchEngine;
  }

  async createFeed(requestUrl): Promise<string> {
    const url = URL.parse(requestUrl);
    const urlQuery = querystring.parse(url.query);

    const parsedQuery = this.parseQuery(urlQuery.query as string || '');
    const queries = [];

    for (const channel of parsedQuery.channels) {
      queries.push({
        fields: ['channel'],
        query: channel.join(' ')
      });
    }

    for (const topic of parsedQuery.topics) {
      queries.push({
        fields: ['topic'],
        query: topic.join(' ')
      });
    }

    for (const title of parsedQuery.titles) {
      queries.push({
        fields: ['title'],
        query: title.join(' ')
      });
    }

    for (const description of parsedQuery.descriptions) {
      queries.push({
        fields: ['description'],
        query: description.join(' ')
      });
    }

    if (parsedQuery.generics.length > 0) {
      queries.push({
        fields: urlQuery.everywhere ? ['channel', 'topic', 'title', 'description'] : ((parsedQuery.topics.length == 0) ? ['topic', 'title'] : ['title']),
        query: parsedQuery.generics.join(' ')
      });
    }

    const future = urlQuery.future != 'false';

    const queryObj = {
      queries: queries,
      sortBy: urlQuery.sortBy ?? 'timestamp',
      sortOrder: urlQuery.sortOrder ?? 'desc',
      future,
      duration_min: parsedQuery.duration_min,
      duration_max: parsedQuery.duration_max,
      offset: (typeof urlQuery.offset == 'string') ? parseInt(urlQuery.offset) : 0,
      size: (typeof urlQuery.size == 'string') ? parseInt(urlQuery.size) : 50
    };

    const result = await this.searchEngine.search(queryObj);

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
      title: 'MVW - ' + (urlQuery.query || '') + (urlQuery.everywhere ? ' | Überall' : '') + (future ? ' | Zukünftige' : ''),
      ttl: 75,
      description: (urlQuery.query || '') + (urlQuery.everywhere ? ' | Überall' : '') + (future ? ' | Zukünftige' : ''),
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

    return rss.xml({
      indent: true
    });
  }

  parseQuery(query: string) {
    const channels: string[][] = [];
    const topics: string[][] = [];
    const titles: string[][] = [];
    const descriptions: string[][] = [];
    let generics: string[] = [];
    let duration_min: number | undefined = undefined;
    let duration_max: number | undefined = undefined;

    const splits = query.trim().toLowerCase().split(/\s+/).filter((s) => s.length > 0);

    for (const split of splits) {
      if (split.startsWith('!')) {
        const parts = split.slice(1).split(',').filter((p) => p.length > 0);
        if (parts.length > 0) {
          channels.push(parts);
        }
      }
      else if (split.startsWith('#')) {
        const parts = split.slice(1).split(',').filter((p) => p.length > 0);
        if (parts.length > 0) {
          topics.push(parts);
        }
      }
      else if (split.startsWith('+')) {
        const parts = split.slice(1).split(',').filter((p) => p.length > 0);
        if (parts.length > 0) {
          titles.push(parts);
        }
      }
      else if (split.startsWith('*')) {
        const parts = split.slice(1).split(',').filter((p) => p.length > 0);
        if (parts.length > 0) {
          descriptions.push(parts);
        }
      }
      else if (split.startsWith('>')) {
        const d_min = Number(split.slice(1));
        if (!isNaN(d_min)) {
          duration_min = d_min * 60;
        }
      }
      else if (split.startsWith('<')) {
        const d_max = Number(split.slice(1));
        if (!isNaN(d_max)) {
          duration_max = d_max * 60;
        }
      }
      else {
        generics.push(split);
      }
    }

    return {
      channels,
      topics,
      titles,
      descriptions,
      generics,
      duration_min,
      duration_max,
    };
  }
}
