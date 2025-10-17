import { isSortBy, isSortOrder, type QueryResult, type ResultEntry, type SortBy, type SortOrder } from './types';
import { createURIHash, debounce, parseURIHash, throttle, trackEvent } from './utils';

const MAX_RESULTS = 10000;

function createAppState() {
  let query = $state('');
  let everywhere = $state(false);
  let future = $state(true);
  let sortBy = $state<SortBy>('timestamp');
  let sortOrder = $state<SortOrder>('desc');
  let currentPage = $state(0);
  let itemsPerPage = $state(15);
  let viewMode = $state<'grid' | 'list'>('grid');

  let loading = $state(false);
  let error = $state<string | null>(null);
  let results = $state<ResultEntry[]>([]);
  let queryInfo = $state<QueryResult['queryInfo'] | null>(null);

  let ignoreNextHashChange = false;

  const _search = throttle(async () => {
    loading = true;
    error = null;

    const parsedQuery = parseQuery(query);
    const queries = [];

    for (const channel of parsedQuery.channels) {
      queries.push({ fields: ['channel'], query: channel.join(' ') });
    }

    for (const topic of parsedQuery.topics) {
      queries.push({ fields: ['topic'], query: topic.join(' ') });
    }

    for (const title of parsedQuery.titles) {
      queries.push({ fields: ['title'], query: title.join(' ') });
    }

    for (const description of parsedQuery.descriptions) {
      queries.push({ fields: ['description'], query: description.join(' ') });
    }

    if (parsedQuery.generics.length > 0) {
      queries.push({
        fields: everywhere ? ['channel', 'topic', 'title', 'description'] : parsedQuery.topics.length === 0 ? ['topic', 'title'] : ['title'],
        query: parsedQuery.generics.join(' ')
      });
    }

    const body = {
      queries,
      sortBy,
      sortOrder,
      future,
      duration_min: parsedQuery.duration_min,
      duration_max: parsedQuery.duration_max,
      offset: currentPage * itemsPerPage,
      size: itemsPerPage
    };

    try {
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();
      if (data.err) throw new Error(data.err.join(', '));

      results = data.result.results;
      queryInfo = data.result.queryInfo;
    } catch (e: any) {
      error = e.message;
      results = [];
      queryInfo = null;
    } finally {
      loading = false;
    }
  }, 50);

  const trackSearch = debounce((data: Record<string, any>) => trackEvent('Search', data), 2500);

  const updateUrlHash = debounce((elements: Record<string, any>) => {
    let oldHash = window.location.hash;
    if (oldHash.startsWith('#')) oldHash = oldHash.slice(1);

    const newHash = createURIHash(elements);

    if (oldHash !== newHash) {
      const url = new URL(window.location.toString());
      url.hash = newHash;
      history.replaceState(undefined, '', url.toString());
      ignoreNextHashChange = true;
    }
  }, 500);

  function parseStateFromUrl() {
    const params = parseURIHash(window.location.hash);

    query = params['query'] ?? '';
    everywhere = params['everywhere'] === 'true';
    future = params['future'] !== 'false';

    const sBy = params['sortBy'];
    if (sBy && isSortBy(sBy)) sortBy = sBy;
    else sortBy = 'timestamp';

    const sOrder = params['sortOrder'];
    if (sOrder && isSortOrder(sOrder)) sortOrder = sOrder;
    else sortOrder = 'desc';

    const page = parseInt(params['page'], 10);
    currentPage = !isNaN(page) ? page - 1 : 0;
  }

  function handleHashChange() {
    if (ignoreNextHashChange) {
      ignoreNextHashChange = false;
      return;
    }

    parseStateFromUrl();
  }

  function init() {
    try {
      const storedViewMode = localStorage.getItem('viewMode');
      if (storedViewMode === 'grid' || storedViewMode === 'list') {
        viewMode = storedViewMode;
      }
      else {
        viewMode = window.innerWidth >= 1024 ? 'list' : 'grid';
      }
      const storedPageSize = localStorage.getItem('pageSize');
      if (storedPageSize) {
        const size = parseInt(storedPageSize, 10);
        if ([5, 10, 15, 20, 25, 50].includes(size)) {
          itemsPerPage = size;
        }
      }
    } catch (e) {
      /* ignore */
    }

    parseStateFromUrl();
    window.addEventListener('hashchange', handleHashChange);

    const cleanup = $effect.root(() => {
      $effect(() => {
        _search();
        trackSearch({ query, everywhere, future, sortBy, sortOrder, itemsPerPage, page: currentPage + 1 });

        updateUrlHash({
          query: query || undefined,
          everywhere: everywhere || undefined,
          future: future ? undefined : 'false',
          sortBy: sortBy === 'timestamp' ? undefined : sortBy,
          sortOrder: sortOrder === 'desc' ? undefined : sortOrder,
          page: currentPage > 0 ? currentPage + 1 : undefined
        });
      });

      $effect(() => {
        if (queryInfo && ((currentPage * itemsPerPage) > queryInfo.totalResults)) {
          currentPage = Math.floor(queryInfo.totalResults / itemsPerPage);
        }

        const maxPage = Math.floor(MAX_RESULTS / itemsPerPage - 1);

        if (currentPage > maxPage) {
          currentPage = maxPage;
        }
      });

      // This effect saves settings to localStorage
      $effect(() => {
        try {
          localStorage.setItem('pageSize', itemsPerPage.toString());
        } catch (e) {
          /* ignore */
        }
      });
    });

    // Return a cleanup function
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      cleanup();
    };
  }

  return {
    get query() { return query; },
    set query(value) { query = value; currentPage = 0; },
    get everywhere() { return everywhere; },
    set everywhere(value) { everywhere = value; currentPage = 0; },
    get future() { return future; },
    set future(value) { future = value; currentPage = 0; },
    get sortBy() { return sortBy; },
    get sortOrder() { return sortOrder; },
    get currentPage() { return currentPage; },
    get itemsPerPage() { return itemsPerPage; },
    set itemsPerPage(value) { itemsPerPage = value; },
    get viewMode() { return viewMode; },

    get loading() { return loading; },
    get error() { return error; },
    get results() { return results; },
    get queryInfo() { return queryInfo; },

    setSort(by: string, order: string) {
      if (isSortBy(by) && isSortOrder(order)) {
        sortBy = by;
        sortOrder = order;
        currentPage = 0;
      }
    },

    setCurrentPage(page: number) {
      currentPage = page;
    },

    toggleViewMode() {
      viewMode = viewMode === 'grid' ? 'list' : 'grid';
      trackEvent('Toggle View Mode', { mode: viewMode });
      try {
        localStorage.setItem('viewMode', viewMode);
      } catch (e) {
        /* ignore */
      }
    },

    openRssFeed() {
      trackEvent('Open RSS Feed');
      const search = window.location.hash.replace('#', '');
      window.open(`${window.location.origin}/feed${search.length > 0 ? '?' : ''}${search}`, '_blank');
    },
    init
  };
}

function parseQuery(query: string) {
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
      if (!isNaN(d_min)) duration_min = d_min * 60;
    }
    else if (split.startsWith('<')) {
      const d_max = Number(split.slice(1));
      if (!isNaN(d_max)) duration_max = d_max * 60;
    }
    else {
      generics.push(split);
    }
  }

  return { channels, topics, titles, descriptions, generics, duration_min, duration_max };
}

export const appState = createAppState();
