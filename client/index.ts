/// <reference types="video.js" />

declare const umami: {
  track: (event_name: string, data?: object) => void;
  identify: (unique_id: string) => void;
};

interface ParsedQuery {
  channels: string[][];
  topics: string[][];
  titles: string[][];
  descriptions: string[][];
  generics: string[];
  duration_min: number | undefined;
  duration_max: number | undefined;
}

interface ResultEntry {
  id: string;
  channel: string;
  topic: string;
  title: string;
  description: string;
  timestamp: number;
  duration: number;
  size: number;
  url_website: string;
  url_subtitle: string;
  url_video: string;
  url_video_low: string;
  url_video_hd: string;
  // added by client
  dateString?: string;
  timeString?: string;
  durationString?: string;
}

interface QueryResult {
  results: ResultEntry[];
  queryInfo: {
    filmlisteTimestamp: number;
    searchEngineTime: string;
    totalResults: number;
    resultCount: number;
  };
}


function addAdSense(): void {
  const adsense = document.createElement('script');
  adsense.type = 'text/javascript';
  adsense.setAttribute('data-ad-client', 'ca-pub-2430783446079517');
  adsense.async = true;
  adsense.crossOrigin = 'anonymous';
  adsense.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
  document.head.appendChild(adsense);
}

function initializeAnalytics(): void {
  if (typeof umami == 'undefined' || typeof umami.identify != 'function') {
    return;
  }

  try {
    const umamiIdKey = 'mvw_uuid';
    let uniqueId = localStorage.getItem(umamiIdKey);

    if (!uniqueId) {
      uniqueId = crypto.randomUUID();
      localStorage.setItem(umamiIdKey, uniqueId);
    }

    umami.identify(uniqueId);
  } catch (e) {
    console.warn('Could not initialize analytics with unique ID.', e);
  }
}

function trackEvent(eventName: string, data?: object): void {
  if (typeof umami != 'undefined' && typeof umami.track == 'function') {
    umami.track(eventName, data);
  }
}

function debounce<F extends (...args: any[]) => void>(func: F, waitFor: number): (...args: Parameters<F>) => void {
  let timeout: number | null = null;

  return (...args: Parameters<F>): void => {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = window.setTimeout(() => func(...args), waitFor);
  };
}

function throttle<F extends (...args: any[]) => void>(func: F, limit: number): (this: any, ...args: Parameters<F>) => void {
  let inThrottle = false;

  return function (this: any, ...args: Parameters<F>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
}

const allowCookiesKey = 'allowCookies';
const lastAllowCookiesAskedKey = 'allowCookiesAsked';
const viewModeKey = 'viewMode';

const debugResponse: boolean = false;
let itemsPerPage: number = 15;
let currentPage: number = 0;
let connectingDialog: HTMLDialogElement;
let contactDialog: HTMLDialogElement;
let cookieDialog: HTMLDialogElement;
let videoDialog: HTMLDialogElement;
let donateDialog: HTMLDialogElement;
let playStartTimestamp: number;
let lastQueryString: string | null = null;
let ignoreNextHashChange: boolean = false;
let queryInputClearButtonState: 'hidden' | 'shown' = 'hidden';
let video: videojs.default.Player | null;
let sortBy: string = 'timestamp';
let sortOrder: 'desc' | 'asc' = 'desc';
let lastResult: QueryResult | null = null;
let currentView: 'grid' | 'list' = 'grid';
let viewModeButton: HTMLButtonElement;

const htmlContentCache: Record<string, string> = {};

let gridView: HTMLElement;
let tableView: HTMLElement;
let tableBody: HTMLElement;
let noResults: HTMLElement;
let queryInfoLabel: HTMLElement;
let pagination: HTMLElement;

function updateSortButton(select: HTMLSelectElement): void {
  const button = document.getElementById('sortDropdownButton') as HTMLButtonElement;
  const buttonText = document.getElementById('sortDropdownButtonText') as HTMLSpanElement;
  if (!button || !buttonText || !select) return;

  const selectedOption = select.options[select.selectedIndex];
  if (!selectedOption) return;

  const value = select.value;
  const [, newSortOrder] = value.split('_');

  const sortText = selectedOption.textContent?.split('(')[0].trim();
  const iconName = newSortOrder === 'desc' ? 'arrow_downward' : 'arrow_upward';

  button.title = `Sortieren nach: ${selectedOption.textContent}`;
  buttonText.innerHTML = `${sortText} <i class="material-icons text-sm ml-1 align-middle">${iconName}</i>`;
}

function updateQueryInputClearButton(): void {
  const currentQueryString = getQueryString();
  const clearButton = document.getElementById('queryInputClearButton');
  if (!clearButton) return;
  if (currentQueryString.length === 0 && queryInputClearButtonState === 'shown') {
    clearButton.classList.remove('opacity-100');
    queryInputClearButtonState = 'hidden';
  }
  else if (currentQueryString.length > 0 && queryInputClearButtonState === 'hidden') {
    clearButton.classList.add('opacity-100');
    queryInputClearButtonState = 'shown';
  }
}

const preferedThemeMediaQuery = window.matchMedia?.('(prefers-color-scheme: dark)');

preferedThemeMediaQuery?.addEventListener?.('change', (event: MediaQueryListEvent) => {
  updateTheme(event.matches);
});

updateTheme(preferedThemeMediaQuery?.matches ?? false);

function updateTheme(dark: boolean): void {
  if (dark) {
    document.documentElement.classList.add('dark');
  }
  else {
    document.documentElement.classList.remove('dark');
  }
}

const baseOpen = XMLHttpRequest.prototype.open;

XMLHttpRequest.prototype.open = function (this: XMLHttpRequest, method: string, url: string, async?: boolean, user?: string, password?: string): void {
  if (url.startsWith('http://srfvodhd-vh.akamaihd.net') || url.startsWith('http://hdvodsrforigin-f.akamaihd.net')) {
    url = 'https' + url.slice(4);
  }

  baseOpen.call(this, method, url, async, user, password);
}

function formatDate(epochSeconds: number): string {
  return new Date(epochSeconds * 1000).toLocaleDateString('de', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

function formatTime(epochSeconds: number): string {
  return new Date(epochSeconds * 1000).toLocaleTimeString('de', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatDuration(seconds: number): string {
  return Math.floor(seconds / 60).toString().padStart(2, '0') + ':' + String(seconds % 60).padStart(2, '0');
}

function formatBytes(bytes: number, decimals: number): string {
  if (bytes < 0) return '?';
  if (bytes === 0) return '0 Byte';

  const k = 1000;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

function parseQuery(query: string): ParsedQuery {
  const channels: string[][] = [];
  const topics: string[][] = [];
  const titles: string[][] = [];
  const descriptions: string[][] = [];
  let generics: string[] = [];
  let duration_min: number | undefined = undefined;
  let duration_max: number | undefined = undefined;

  const splits = query.trim().toLowerCase().split(/\s+/).filter((split) => split.length > 0);

  for (let i = 0; i < splits.length; i++) {
    const split = splits[i];

    if (split[0] == '!') {
      const c = split.slice(1, split.length).split(',').filter((split) => split.length > 0);
      if (c.length > 0) {
        channels.push(c);
      }
    }
    else if (split[0] == '#') {
      const t = split.slice(1, split.length).split(',').filter((split) => split.length > 0);
      if (t.length > 0) {
        topics.push(t);
      }
    }
    else if (split[0] == '+') {
      const t = split.slice(1, split.length).split(',').filter((split) => split.length > 0);
      if (t.length > 0) {
        titles.push(t);
      }
    }
    else if (split[0] == '*') {
      const d = split.slice(1, split.length).split(',').filter((split) => split.length > 0);
      if (d.length > 0) {
        descriptions.push(d);
      }
    }
    else if (split[0] == '>') {
      const d = split.slice(1, split.length).split(',').filter((split) => split.length > 0);
      const d_min = Number(d[0]);

      if (d.length > 0 && !isNaN(d_min)) {
        duration_min = d_min * 60;
      }
    }
    else if (split[0] == '<') {
      const d = split.slice(1, split.length).split(',').filter((split) => split.length > 0);
      const d_max = Number(d[0]);

      if (d.length > 0 && !isNaN(d_max)) {
        duration_max = d_max * 60;
      }
    }
    else {
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

function getQueryString(): string {
  return (document.getElementById('queryInput') as HTMLInputElement).value.toString().trim();
}

function setQueryFromURIHash(): void {
  const props: Record<string, any> = parseURIHash(window.location.hash);
  const queryInput = document.getElementById('queryInput') as HTMLInputElement;
  const everywhereCheckbox = document.getElementById('everywhereCheckbox') as HTMLInputElement;
  const futureCheckbox = document.getElementById('futureCheckbox') as HTMLInputElement;

  if (props['query']) {
    queryInput.value = props['query'];
  }
  else {
    queryInput.value = '';
  }

  lastQueryString = getQueryString();
  updateQueryInputClearButton();

  if (props['everywhere'] === 'true') {
    everywhereCheckbox.checked = true;
  }
  else {
    everywhereCheckbox.checked = false;
  }

  if (props['future'] === 'false') {
    futureCheckbox.checked = false;
  }
  else {
    futureCheckbox.checked = true;
  }

  if (props['sortBy']) {
    sortBy = props['sortBy'];
  }
  else {
    sortBy = 'timestamp';
  }

  if (props['sortOrder'] === 'asc' || props['sortOrder'] === 'desc') {
    sortOrder = props['sortOrder'];
  }
  else {
    sortOrder = 'desc';
  }

  const sortSelect = document.getElementById('sortSelect') as HTMLSelectElement;

  if (sortSelect) {
    sortSelect.value = `${sortBy}_${sortOrder}`;
    updateSortButton(sortSelect);
  }

  if (!isNaN(parseInt(props['page']))) {
    currentPage = parseInt(props['page']) - 1;
  }
  else {
    currentPage = 0;
  }
}

function parseURIHash(hash: string): Record<string, string> {
  if (hash[0] == '#') {
    hash = hash.slice(1);
  }

  const props = hash.split('&');
  const elements: Record<string, string> = {};

  for (let i = 0; i < props.length; i++) {
    const element = props[i].split('=');
    elements[element[0]] = decodeURIComponent(element[1]);
  }

  return elements;
}

function createURIHash(elements: Record<string, any>): string {
  const props = [];

  for (const prop in elements) {
    props.push(prop + '=' + encodeURIComponent(elements[prop].toString()));
  }

  return props.join('&');
}

const trackSearch = debounce((data: Record<string, any>) => {
  trackEvent('Search', data);
}, 2500);

const updateUrlHash = debounce((elements: Record<string, any>) => {
  let oldHash = window.location.hash;
  if (oldHash[0] == '#') {
    oldHash = oldHash.slice(1);
  }

  const newHash = createURIHash(elements);

  if (oldHash !== newHash) {
    const url = new URL(window.location.toString());
    url.hash = newHash;
    history.replaceState(undefined, '', url.toString());

    ignoreNextHashChange = true;
  }
}, 2500);

const query = throttle(() => {
  const queryString = getQueryString();
  const future = !!(document.getElementById('futureCheckbox') as HTMLInputElement).checked;
  const everywhere = !!(document.getElementById('everywhereCheckbox') as HTMLInputElement).checked;
  currentPage = Math.min(currentPage, Math.floor(10000 / itemsPerPage - 1));

  const elements: Record<string, any> = {};

  if (queryString.length > 0) {
    elements['query'] = queryString;
  }
  if (everywhere === true) {
    elements['everywhere'] = true;
  }
  if (future === false) {
    elements['future'] = false;
  }
  if (currentPage > 0) {
    elements['page'] = currentPage + 1;
  }

  if (sortBy !== 'timestamp' || sortOrder !== 'desc') {
    elements['sortBy'] = sortBy;
    elements['sortOrder'] = sortOrder;
  }

  updateUrlHash(elements);

  const parsedQuery = parseQuery(queryString);
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
      fields: everywhere ? ['channel', 'topic', 'title', 'description'] : ((parsedQuery.topics.length == 0) ? ['topic', 'title'] : ['title']),
      query: parsedQuery.generics.join(' ')
    });
  }

  const queryObj = {
    queries: queries,
    sortBy,
    sortOrder,
    future,
    duration_min: parsedQuery.duration_min,
    duration_max: parsedQuery.duration_max,
    offset: currentPage * itemsPerPage,
    size: itemsPerPage
  };

  fetch('/api/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(queryObj),
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      return res.json();
    })
    .then((message) => {
      if (debugResponse) {
        console.log(message);
      }
      handleQueryResult(message.result, message.err);
    })
    .catch((err) => {
      handleQueryResult(null, [err.message]);
    });

  trackSearch({
    query: queryString,
    everywhere,
    future,
    sortBy,
    itemsPerPage,
    page: currentPage + 1
  });
}, 20);

function renderResults(): void {
  if (!gridView || !tableView || !tableBody || !noResults || !queryInfoLabel || !pagination) return;

  gridView.innerHTML = '';
  tableBody.innerHTML = '';
  pagination.innerHTML = '';
  gridView.classList.add('hidden');
  tableView.classList.add('hidden');
  noResults.classList.remove('hidden');

  if (!lastResult) {
    queryInfoLabel.innerHTML = '';
    return;
  }

  const filmlisteTime = `am ${formatDate(lastResult.queryInfo.filmlisteTimestamp)} um ${formatTime(lastResult.queryInfo.filmlisteTimestamp)} Uhr`;

  if (lastResult.results.length === 0) {
    queryInfoLabel.innerHTML = `Die Suche dauerte ${lastResult.queryInfo.searchEngineTime.toString().replace('.', ',')} ms. Keine Treffer gefunden.<br/>Filmliste zuletzt ${filmlisteTime} aktualisiert.`;
    return;
  }

  if (currentView === 'grid') {
    gridView.classList.remove('hidden');
  }
  else {
    tableView.classList.remove('hidden');
  }
  noResults.classList.add('hidden');

  const container = currentView === 'grid' ? gridView : tableBody;
  for (let i = 0; i < lastResult.results.length; i++) {
    const data: ResultEntry = lastResult.results[i];

    if (data.timestamp == 0) {
      data.dateString = data.timeString = '?';
    }
    else {
      data.dateString = formatDate(data.timestamp);
      data.timeString = formatTime(data.timestamp);
    }

    data.durationString = isNaN(data.duration) ? '?' : formatDuration(data.duration);

    const element = currentView === 'grid' ? createResultCard(data) : createResultTableRow(data);
    if (element) {
      container.appendChild(element);
    }
  }

  const actualPagesCount = Math.ceil(lastResult.queryInfo.totalResults / itemsPerPage);
  const shownPagesCount = Math.min(actualPagesCount, Math.floor(10000 / itemsPerPage));

  createPagination(shownPagesCount);

  queryInfoLabel.innerHTML = 'Die Suche dauerte ' + lastResult.queryInfo.searchEngineTime.toString().replace('.', ',') + ' ms. Zeige Treffer ' + Math.min(lastResult.queryInfo.totalResults, (currentPage * itemsPerPage + 1)) +
    ' bis ' + Math.min(lastResult.queryInfo.totalResults, ((currentPage + 1) * itemsPerPage)) + ' von insgesamt ' + lastResult.queryInfo.totalResults + '.</br>Filmliste zuletzt ' + filmlisteTime + ' aktualisiert.';
}

function handleQueryResult(result: QueryResult | null, err: string[] | null): void {
  if (err) {
    lastResult = null;
    if (gridView) {
      gridView.innerHTML = '';
      gridView.classList.add('hidden');
    }
    if (tableView) {
      if (tableBody) tableBody.innerHTML = '';
      tableView.classList.add('hidden');
    }
    if (noResults) noResults.classList.remove('hidden');
    if (queryInfoLabel) queryInfoLabel.innerHTML = 'Fehler:<br/>' + err.join('<br/>');
    if (pagination) pagination.innerHTML = '';
    return;
  }

  lastResult = result;
  renderResults();
}

function createVideoActions(entry: ResultEntry): HTMLDivElement {
  const container = document.createElement('div');
  container.className = 'flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400';
  const filenamebase = `${entry.channel} - ${entry.topic} - ${entry.title} - ${formatDate(entry.timestamp)} ${formatTime(entry.timestamp)}`;
  const actionTemplate = (document.getElementById('video-action-template') as HTMLTemplateElement).content;

  const createActionTag = (quality: string, playUrl: string): DocumentFragment => {
    const tag = actionTemplate.cloneNode(true) as DocumentFragment;
    const qualityEl = tag.querySelector('[data-id="quality"]')!;
    const playLinkEl = tag.querySelector('[data-id="play-link"]') as HTMLAnchorElement;
    const helpIconEl = tag.querySelector('[data-id="help-icon"]') as HTMLElement;

    qualityEl.textContent = quality;

    if (playUrl) {
      playLinkEl.href = playUrl;
      playLinkEl.title = `${quality} abspielen`;
      playLinkEl.addEventListener('click', (e) => {
        e.preventDefault();
        playVideo(entry.channel, entry.topic, entry.title, playUrl, quality);
      });
      helpIconEl.remove();
    }
    else {
      playLinkEl.remove();
      helpIconEl.classList.remove('hidden');
    }
    return tag;
  };

  const qualities = [
    { key: 'url_video_hd', name: 'HD' },
    { key: 'url_video', name: 'SD' },
    { key: 'url_video_low', name: 'LQ' }
  ] as const;

  qualities.forEach((quality) => {
    if (entry[quality.key]) {
      container.appendChild(createActionTag(quality.name, entry[quality.key]));
    }
  });

  if (entry.url_subtitle) {
    const subtitleLink = document.createElement('a');
    const subtitleIcon = document.createElement('i');

    subtitleLink.href = entry.url_subtitle;
    subtitleLink.title = 'Untertitel herunterladen';
    subtitleLink.className = 'inline-flex items-center px-2 py-1 bg-gray-200 dark:bg-gray-700 text-xs font-bold rounded';
    subtitleLink.setAttribute('download', filenamebase + '.' + entry.url_subtitle.split('.').pop());

    subtitleIcon.className = 'material-icons text-base';
    subtitleIcon.textContent = 'subtitles';
    subtitleLink.appendChild(subtitleIcon);

    container.appendChild(subtitleLink);
  }

  return container;
}

function getChannelColorClasses(channel: string): string {
  const channelUpper = channel.toUpperCase();

  // Orange & White: ZDF family, KiKA, PHOENIX
  if (channelUpper.includes('ZDF') || channelUpper.includes('KIKA') || channelUpper.includes('PHOENIX')) {
    return 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300';
  }

  // Red & White: SRF, SWR, 3Sat, ORF, RBB, rbtv, Radio Bremen
  if (channelUpper.includes('SRF') || channelUpper.includes('SWR') || channelUpper.includes('3SAT') || channelUpper.includes('ORF') || channelUpper.includes('RBB') || channelUpper.includes('RBTV') || channelUpper.includes('RADIO BREMEN TV')) {
    return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200';
  }

  // Blue & White: ARD family
  if (channelUpper.includes('ARD') || channelUpper.includes('ERSTE') || channelUpper.includes('NDR') || channelUpper.includes('BR') || channelUpper === 'SR' || channelUpper.includes('WDR') || channelUpper.includes('DW') || channelUpper.includes('HR') || channelUpper.includes('TAGESSCHAU24') || channelUpper.includes('ONE')) {
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200';
  }

  // Green & White: MDR
  if (channelUpper.includes('MDR')) {
    return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
  }

  // Black & White / Dark theme: ARTE, Funk
  if (channelUpper.includes('ARTE') || channelUpper.includes('FUNK.NET')) {
    return 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  }

  return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
}

function populateResultData(element: DocumentFragment, data: ResultEntry): void {
  const titleEl = element.querySelector<HTMLElement>('[data-id="title"]');
  if (titleEl) {
    titleEl.textContent = data.title;
    titleEl.title = data.title;
  }

  const topicEl = element.querySelector<HTMLElement>('[data-id="topic"]');
  if (topicEl) {
    topicEl.textContent = data.topic;
    topicEl.title = data.topic;
  }

  const channelEl = element.querySelector<HTMLAnchorElement>('[data-id="channel"]');

  if (channelEl) {
    channelEl.textContent = data.channel;
    channelEl.className += ' ' + getChannelColorClasses(data.channel);

    if (data.url_website) {
      channelEl.href = data.url_website;
      channelEl.target = '_blank';
      channelEl.rel = 'noopener noreferrer';
      channelEl.title = `Website von ${data.channel} besuchen`;
    }
  }

  const actionsContainer = element.querySelector<HTMLElement>('[data-id="actions"]');
  if (actionsContainer) {
    actionsContainer.appendChild(createVideoActions(data));
  }

  const sizeElement = element.querySelector<HTMLElement>('[data-id="size"]');
  if (sizeElement) {
    sizeElement.textContent = '';
    const urlForSize = data.url_video_hd ?? data.url_video ?? data.url_video_low;

    if (urlForSize) {
      fetch(`/api/content-length?url=${encodeURIComponent(urlForSize)}`)
        .then((res) => res.text())
        .then((lengthStr) => {
          const length = parseInt(lengthStr, 10);
          if (!isNaN(length) && document.body.contains(sizeElement)) {
            sizeElement.textContent = (length > 0) ? formatBytes(length, 2) : '';
          }
        });
    }
  }
}

function createResultTableRow(data: ResultEntry): Element | null {
  const template = document.getElementById('result-row-template') as HTMLTemplateElement;
  const row = template.content.cloneNode(true) as DocumentFragment;

  populateResultData(row, data);

  // Table-row specific content
  row.querySelector('[data-id="date"]')!.textContent = data.dateString!;
  row.querySelector('[data-id="time"]')!.textContent = data.timeString!;
  row.querySelector('[data-id="duration"]')!.textContent = data.durationString!;

  return row.firstElementChild;
}

function createResultCard(data: ResultEntry): Element | null {
  const template = document.getElementById('result-card-template') as HTMLTemplateElement;
  const card = template.content.cloneNode(true) as DocumentFragment;

  populateResultData(card, data);

  const descriptionEl = card.querySelector<HTMLParagraphElement>('[data-id="description"]')!;
  descriptionEl.textContent = data.description || 'Keine Beschreibung verfügbar.';
  descriptionEl.title = data.description;

  card.querySelector('[data-id="datetime"]')!.textContent = `${data.dateString}, ${data.timeString} Uhr`;
  card.querySelector('[data-id="duration"]')!.textContent = `Dauer: ${data.durationString}`;

  return card.firstElementChild;
}

function createPaginationButton(html: string, active: boolean, enabled: boolean, callback: () => void): HTMLAnchorElement {
  const template = (document.getElementById('pagination-button-template') as HTMLTemplateElement).content;
  const pageItemFragment = template.cloneNode(true) as DocumentFragment;
  const pageLink = pageItemFragment.firstElementChild as HTMLAnchorElement;

  pageLink.innerHTML = html;

  let linkClasses = pageLink.className;

  if (active) {
    linkClasses += ' bg-blue-600 text-white font-bold cursor-default';
  }
  else {
    linkClasses += ' bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-400';

    if (enabled) {
      linkClasses += ' hover:bg-gray-300 dark:hover:bg-gray-700';
    }
    else {
      linkClasses += ' cursor-not-allowed opacity-50';
    }
  }
  pageLink.className = linkClasses;

  if (enabled && !active) {
    pageLink.addEventListener('click', (e) => {
      e.preventDefault();
      callback();
      query();
    });
  }
  else {
    pageLink.addEventListener('click', e => e.preventDefault());
  }

  return pageLink;
}

function createPagination(totalPages: number): void {
  if (!pagination) return;

  pagination.innerHTML = '';

  const backButton = createPaginationButton('<i class="material-icons text-base">keyboard_arrow_left</i>', false, currentPage > 0, () => {
    currentPage--;
  });
  backButton.classList.add('p-2');
  backButton.classList.remove('px-4');

  pagination.appendChild(backButton);

  const pagingBegin = Math.max(0, currentPage - 2 - (2 - Math.min(2, totalPages - (currentPage + 1))));
  const pagingEnd = Math.min(totalPages, pagingBegin + 5);

  for (let i = pagingBegin; i < pagingEnd; i++) {
    const button = createPaginationButton((i + 1).toString(), currentPage == i, true, () => {
      currentPage = i;
    });

    pagination.appendChild(button);
  }

  const nextButton = createPaginationButton('<i class="material-icons text-base">keyboard_arrow_right</i>', false, currentPage < (totalPages - 1), () => {
    currentPage++;
  });
  nextButton.classList.add('p-2');
  nextButton.classList.remove('px-4');

  pagination.appendChild(nextButton);
}


function isVideoPlaying(): boolean {
  if (!video) {
    return false;
  }
  else {
    return !video.paused();
  }
}

function toggleVideoPause(): void {
  if (video) {
    video.paused() ? video.play() : video.pause();
  }
}

function playVideo(channel: string, topic: string, title: string, url: string, quality: string): void {
  if (url.startsWith('http://')) {
    playVideoInNewWindow(url);
    return;
  }

  trackEvent('Play Video', {
    channel,
    topic,
    title,
    quality,
  });

  videoDialog.showModal();
  document.getElementById('blur')!.classList.add('blur');

  const vid = document.createElement('video');
  vid.className = 'video-js vjs-default-skin vjs-big-play-centered vjs-16-9 w-full';
  vid.id = 'video-player';
  vid.setAttribute('preload', 'auto');
  vid.setAttribute('controls', '');

  const source = document.createElement('source');
  source.src = url;

  if (url.endsWith('m3u8')) {
    source.setAttribute('type', 'application/x-mpegURL');
  }

  vid.appendChild(source);

  document.getElementById('videocontent')!.appendChild(vid);

  video = (videojs as unknown as typeof videojs.default)('video-player');

  vid.addEventListener('dblclick', () => {
    if (video) {
      if (video.isFullscreen()) {
        video.exitFullscreen();
      }
      else {
        video.requestFullscreen();
      }
    }
  });

  videoDialog.focus();
  playStartTimestamp = Date.now();
}

async function playVideoInNewWindow(url: string): Promise<void> {
  const playerWindow: Window | null = window.open(url);
  const start = Date.now();

  while (playerWindow?.closed === false) {
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  const playDuration = Date.now() - start;

  if (playDuration >= 1000 * 30) {
    location.reload();
  }
}

function openContactsModal(): void {
  contactDialog.showModal();
}

function returnEmptyString(): string {
  return '';
}

function copyToClipboard(text: string): void {
  const dummy = document.createElement('textarea');
  document.body.appendChild(dummy);
  dummy.value = text;
  dummy.select();
  document.execCommand('copy');
  document.body.removeChild(dummy);
}

const viewModes = {
  list: { icon: 'view_module', title: 'Kartenansicht', add: 'max-w-screen-2xl', remove: 'max-w-7xl', show: 'mediathekTableView', hide: 'mediathekGridView' },
  grid: { icon: 'view_list', title: 'Listenansicht', add: 'max-w-7xl', remove: 'max-w-screen-2xl', show: 'mediathekGridView', hide: 'mediathekTableView' }
};

function setViewMode(mode: 'grid' | 'list', fromUser: boolean = false): void {
  if (currentView === mode && !fromUser) return;

  currentView = mode;
  window.localStorage?.setItem?.(viewModeKey, mode);

  const settings = viewModes[mode];
  const viewModeIcon = document.getElementById('viewModeIcon') as HTMLElement;
  const mainElement = document.querySelector('main');
  const navContainer = document.getElementById('nav-container');
  const showView = document.getElementById(settings.show);
  const hideView = document.getElementById(settings.hide);

  if (!viewModeButton || !viewModeIcon || !mainElement || !navContainer || !showView || !hideView) return;

  viewModeIcon.textContent = settings.icon;
  viewModeButton.title = settings.title;
  showView.classList.remove('hidden');
  hideView.classList.add('hidden');
  mainElement.classList.add(settings.add);
  mainElement.classList.remove(settings.remove);
  navContainer.classList.add(settings.add);
  navContainer.classList.remove(settings.remove);

  if (fromUser) {
    renderResults();
  }
}

function showGenericHtmlView(url: string, cacheKey: string, eventName: string): void {
  trackEvent(eventName);

  document.getElementById('main-view')!.classList.add('hidden');
  const genericView = document.getElementById('generic-html-view')!;
  genericView.classList.remove('hidden');

  const contentElement = document.getElementById('genericHtmlContent')!;
  if (htmlContentCache[cacheKey]) {
    contentElement.innerHTML = htmlContentCache[cacheKey];
  }
  else {
    fetch(url)
      .then((res) => res.text())
      .then((html) => {
        htmlContentCache[cacheKey] = html;
        contentElement.innerHTML = html;
      });
  }
}

function setupTrackedButton(elementId: string, eventName: string, action?: (e: MouseEvent) => void): void {
  const element = document.getElementById(elementId);
  if (element) {
    element.addEventListener('click', (e) => {
      trackEvent(eventName);
      if (action) {
        action(e);
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initializeAnalytics();

  document.getElementById('browserWarning')?.remove();

  gridView = document.getElementById('mediathekGridView')!;
  tableView = document.getElementById('mediathekTableView')!;
  tableBody = document.getElementById('mediathekTableBody')!;
  noResults = document.getElementById('noResults')!;
  queryInfoLabel = document.getElementById('queryInfoLabel')!;
  pagination = document.getElementById('pagination')!;
  connectingDialog = document.getElementById('connectingDialog') as HTMLDialogElement;
  contactDialog = document.getElementById('contactDialog') as HTMLDialogElement;
  cookieDialog = document.getElementById('cookieDialog') as HTMLDialogElement;
  videoDialog = document.getElementById('videoDialog') as HTMLDialogElement;
  donateDialog = document.getElementById('donateDialog') as HTMLDialogElement;

  try {
    let allowCookies = window.localStorage?.getItem?.(allowCookiesKey);
    const lastAllowCookiesAskedString = window.localStorage?.getItem?.(lastAllowCookiesAskedKey) || '0';
    const lastAllowCookiesAsked = parseInt(lastAllowCookiesAskedString, 10);

    // Re-ask for consent after 7 days if it was denied previously.
    if (allowCookies == 'false' && (isNaN(lastAllowCookiesAsked) || (lastAllowCookiesAsked < (Date.now() - 7 * 24 * 60 * 60 * 1000)))) {
      window.localStorage?.removeItem(allowCookiesKey);
      allowCookies = null;
    }

    if (allowCookies == 'true') {
      addAdSense();
    }
    else if (allowCookies != 'false') {
      cookieDialog.showModal();
      document.getElementById('cookieAcceptButton')!.addEventListener('click', () => {
        trackEvent('Cookie Consent', { consent: 'accept' });
        window.localStorage?.setItem?.(allowCookiesKey, 'true');
        window.localStorage?.setItem?.(lastAllowCookiesAskedKey, Date.now().toString());
        cookieDialog.close();
        addAdSense();
      });

      document.getElementById('cookieDenyButton')!.addEventListener('click', () => {
        trackEvent('Cookie Consent', { consent: 'deny' });
        window.localStorage?.setItem?.(allowCookiesKey, 'false');
        window.localStorage?.setItem?.(lastAllowCookiesAskedKey, Date.now().toString());
        cookieDialog.close();
      });
    }
  } catch (error) {
    console.warn('Could not access localStorage. Ads will not be shown.', error);
  }

  const newQuery = () => {
    currentPage = 0;
    query();
  };

  const pageSizeButton = document.getElementById('pageSizeDropdownButton') as HTMLButtonElement;
  const pageSizeSelect = document.getElementById('pageSizeSelect') as HTMLSelectElement;
  const storedPageSize = window.localStorage?.getItem?.('pageSize');

  if (storedPageSize && ['5', '10', '15', '20', '25', '50'].includes(storedPageSize)) {
    itemsPerPage = parseInt(storedPageSize, 10);
  }

  pageSizeButton.innerHTML = `Pro Seite: ${itemsPerPage} <i class="material-icons text-base ml-1">arrow_drop_down</i>`;
  if (pageSizeSelect) {
    pageSizeSelect.value = itemsPerPage.toString();
  }

  pageSizeSelect?.addEventListener('change', () => {
    const newSize = parseInt(pageSizeSelect.value, 10);

    if (isNaN(newSize)) {
      return;
    }

    trackEvent('Change Page Size', { size: newSize });
    itemsPerPage = newSize;
    window.localStorage?.setItem?.('pageSize', newSize.toString());

    if (pageSizeButton) {
      pageSizeButton.innerHTML = `Pro Seite: ${newSize} <i class="material-icons text-base ml-1">arrow_drop_down</i>`;
    }

    newQuery();
  });

  document.getElementById('sortSelect')?.addEventListener('change', (e) => {
    const select = e.target as HTMLSelectElement;
    const [newSortBy, newSortOrder] = select.value.split('_');

    sortBy = newSortBy;
    sortOrder = newSortOrder as 'desc' | 'asc';

    trackEvent('Change Sort', { by: sortBy, order: sortOrder });
    updateSortButton(select);
    newQuery();
  });


  document.getElementById('queryInput')!.addEventListener('input', () => {
    const currentQueryString = getQueryString();

    if (currentQueryString != lastQueryString) {
      newQuery();
      lastQueryString = currentQueryString;
    }

    updateQueryInputClearButton();
  });

  document.querySelectorAll('#queryParameters input[type=checkbox]').forEach(el => el.addEventListener('change', () => newQuery()));

  document.getElementById('videocloseButton')!.addEventListener('click', () => {
    if (videoDialog.open) {
      videoDialog.close();
    }
  });

  videoDialog.addEventListener('cancel', (e: Event) => {
    if (video && video.isFullscreen()) {
      e.preventDefault();
      video.exitFullscreen();
    }
  });

  videoDialog.addEventListener('close', () => {
    const playDuration = Date.now() - playStartTimestamp;

    if (playDuration >= 1000 * 3) {
      trackEvent('Close Video', { playDuration: Math.floor(playDuration / 1000) });
    }

    if (playDuration >= 1000 * 30) {
      location.reload();
      return;
    }

    if (video && !video.isDisposed()) {
      video.dispose();
    }

    video = null;
    document.getElementById('videocontent')!.innerHTML = '';
    document.getElementById('blur')!.classList.remove('blur');
  });

  document.getElementById('queryInputClearButton')!.addEventListener('click', function () {
    const queryInput = document.getElementById('queryInput') as HTMLInputElement;
    queryInput.value = '';
    queryInput.dispatchEvent(new Event('input'));
    queryInput.focus();
  });

  document.getElementById('logo')!.addEventListener('click', (e: MouseEvent) => {
    e.preventDefault();
    document.getElementById('generic-html-view')!.classList.add('hidden');
    document.getElementById('main-view')!.classList.remove('hidden');
    return false;
  });

  setupTrackedButton('contactButton', 'Open Contact Modal', (e: MouseEvent) => {
    e.preventDefault();
    openContactsModal();
  });

  setupTrackedButton('donateNavButton', 'Open Donate Modal', (e: MouseEvent) => {
    e.preventDefault();
    donateDialog.showModal();
  });

  setupTrackedButton('datenschutzButton', 'View Datenschutz', (e: MouseEvent) => {
    e.preventDefault();
    showGenericHtmlView('/datenschutz', 'datenschutz', 'View Datenschutz');
  });

  setupTrackedButton('impressumButton', 'View Impressum', (e: MouseEvent) => {
    e.preventDefault();
    showGenericHtmlView('/impressum', 'impressum', 'View Impressum');
  });

  setupTrackedButton('rssFeedButton', 'Click RSS Feed', () => {
    const search = window.location.hash.replace('#', '');
    window.open(`${window.location.origin}${window.location.pathname}feed${search.length > 0 ? '?' : ''}${search}`, '_blank');
  });

  setupTrackedButton('forumButton', 'Click Forum Link');
  setupTrackedButton('githubButton', 'Click GitHub Link');
  setupTrackedButton('helpButton', 'Click Help Link');

  document.getElementById('genericHtmlViewBackButton')!.addEventListener('click', () => {
    document.getElementById('generic-html-view')!.classList.add('hidden');
    document.getElementById('main-view')!.classList.remove('hidden');
  });

  window.addEventListener("hashchange", () => {
    if (!ignoreNextHashChange) {
      setQueryFromURIHash();
      query();
    }
    else {
      ignoreNextHashChange = false;
    }
  }, false);

  viewModeButton = document.getElementById('viewModeButton') as HTMLButtonElement;
  const storedViewMode = window.localStorage?.getItem?.(viewModeKey) as 'grid' | 'list' | null;
  const defaultView = window.innerWidth >= 1024 ? 'list' : 'grid';
  setViewMode(storedViewMode ?? defaultView);

  viewModeButton.addEventListener('click', () => {
    const newMode = currentView === 'grid' ? 'list' : 'grid';
    setViewMode(newMode, true);
  });

  setQueryFromURIHash();
  query();

  document.addEventListener('keydown', (e: KeyboardEvent) => {
    // Only act when the video dialog is open and a video is present.
    if (!videoDialog.open || !video || video.isDisposed()) {
      return;
    }

    // Do not trigger hotkeys if Ctrl, Alt or Meta keys are pressed, to avoid conflicts with browser shortcuts.
    if (e.altKey || e.ctrlKey || e.metaKey) {
      return;
    }

    const target = e.target as HTMLElement;
    // Prevent seeking when a text input field is focused.
    if (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
      return;
    }

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        video.currentTime(video.currentTime() - 10);
        break;

      case 'ArrowRight':
        e.preventDefault();
        video.currentTime(video.currentTime() + 10);
        break;
    }
  });
});
