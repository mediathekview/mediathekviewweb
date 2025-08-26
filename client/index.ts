/// <reference types="socket.io-client" />
/// <reference types="video.js" />

declare const Cookies;
declare const io: any;

declare const umami: {
  track: (event_name: string, data?: object) => void;
  identify: (unique_id: string) => void;
};

interface XMLHttpRequest {
  baseOpen: (method: string, url: string, async?: boolean, user?: string, password?: string) => void;
}

function addAdSense() {
  const adsense = document.createElement('script');
  adsense.type = 'text/javascript';
  adsense.setAttribute('data-ad-client', 'ca-pub-2430783446079517');
  adsense.async = true;
  adsense.crossOrigin = 'anonymous';
  adsense.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
  document.head.appendChild(adsense);
}

function initializeAnalytics() {
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

function trackEvent(eventName: string, data?: object) {
  if (typeof umami != 'undefined' && typeof umami.track == 'function') {
    umami.track(eventName, data);
  }
}

function debounce<F extends (...args: any[]) => void>(func: F, waitFor: number) {
  let timeout: number | null = null;

  return (...args: Parameters<F>): void => {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = window.setTimeout(() => func(...args), waitFor);
  };
}

function throttle<F extends (...args: any[]) => void>(func: F, limit: number) {
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

const debugResponse = false;
const socket = io();
let itemsPerPage = 5;
let currentPage = 0;
let connectingDialog: HTMLDialogElement;
let contactDialog: HTMLDialogElement;
let cookieDialog: HTMLDialogElement;
let videoDialog: HTMLDialogElement;
let donateDialog: HTMLDialogElement;
let playStartTimestamp;
let lastQueryString = null;
let ignoreNextHashChange = false;
let impressum = null;
let datenschutz = null;
let queryInputClearButtonState = 'hidden';
let video;
let sortBy = 'timestamp';
let sortOrder = 'desc';
let lastResult = null;
let currentView: 'grid' | 'list' = 'grid';
let viewModeButton: HTMLButtonElement;


function updateSortButton(select: HTMLSelectElement) {
  const button = document.getElementById('sortDropdownButton') as HTMLButtonElement;
  const buttonText = document.getElementById('sortDropdownButtonText') as HTMLSpanElement;
  if (!button || !buttonText || !select) return;

  const selectedOption = select.options[select.selectedIndex];
  if (!selectedOption) return;

  const value = select.value;
  const [, newSortOrder] = value.split('_');

  const sortText = selectedOption.textContent.split('(')[0].trim();
  const iconName = newSortOrder === 'desc' ? 'arrow_downward' : 'arrow_upward';

  button.title = `Sortieren nach: ${selectedOption.textContent}`;
  buttonText.innerHTML = `${sortText} <i class="material-icons text-sm ml-1 align-middle">${iconName}</i>`;
}

function updateQueryInputClearButton() {
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

preferedThemeMediaQuery?.addEventListener?.('change', (event) => {
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

XMLHttpRequest.prototype.baseOpen = XMLHttpRequest.prototype.open;

XMLHttpRequest.prototype.open = function (this: XMLHttpRequest, method: string, url: string, async?: boolean, user?: string, password?: string) {
  if (url.startsWith('http://srfvodhd-vh.akamaihd.net') || url.startsWith('http://hdvodsrforigin-f.akamaihd.net')) {
    url = 'https' + url.slice(4);
  }

  this.baseOpen(method, url, async, user, password);
}

function pad(value: number, size: number) {
  let stringValue = value.toString();
  while (stringValue.length < (size || 2)) {
    stringValue = "0" + stringValue;
  }
  return stringValue;
}

function formatDate(epochSeconds: number) {
  return new Date(epochSeconds * 1000).toLocaleDateString('de', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

function formatTime(epochSeconds: number) {
  return new Date(epochSeconds * 1000).toLocaleTimeString('de', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatDuration(seconds: number) {
  return pad(Math.floor(seconds / 60), 2) + ':' + pad(seconds % 60, 2);
}

function formatBytes(bytes, decimals) {
  if (!(parseInt(bytes) >= 0)) return '?';
  else if (bytes == 0) return '0 Byte';

  const k = 1000;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

function parseQuery(query) {
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
    }
    else if (split[0] == '#') {
      const t = split.slice(1, split.length).split(',').filter((split) => {
        return (split.length > 0);
      });
      if (t.length > 0) {
        topics.push(t);
      }
    }
    else if (split[0] == '+') {
      const t = split.slice(1, split.length).split(',').filter((split) => {
        return (split.length > 0);
      });
      if (t.length > 0) {
        titles.push(t);
      }
    }
    else if (split[0] == '*') {
      const d = split.slice(1, split.length).split(',').filter((split) => {
        return (split.length > 0);
      });
      if (d.length > 0) {
        descriptions.push(d);
      }
    }
    else if (split[0] == '>') {
      const d = split.slice(1, split.length).split(',').filter((split) => {
        return (split.length > 0);
      });
      if (d.length > 0 && !isNaN(d[0])) {
        duration_min = d[0] * 60;
      }
    }
    else if (split[0] == '<') {
      const d = split.slice(1, split.length).split(',').filter((split) => {
        return (split.length > 0);
      });
      if (d.length > 0 && !isNaN(d[0])) {
        duration_max = d[0] * 60;
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

function getQueryString() {
  return (document.getElementById('queryInput') as HTMLInputElement).value.toString().trim();
}

function setQueryFromURIHash() {
  const props = parseURIHash(window.location.hash);
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

  if (props['sortBy'] && props['sortOrder']) {
    sortBy = props['sortBy'];
    sortOrder = props['sortOrder'];
  }
  else {
    sortBy = 'timestamp';
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

function parseURIHash(hash) {
  if (hash[0] == '#') {
    hash = hash.slice(1);
  }

  const props = hash.split('&');
  const elements = {};

  for (let i = 0; i < props.length; i++) {
    const element = props[i].split('=');
    elements[element[0]] = decodeURIComponent(element[1]);
  }

  return elements;
}

function createURIHash(elements) {
  const props = [];

  for (const prop in elements) {
    props.push(prop + '=' + encodeURIComponent(elements[prop].toString()));
  }

  return props.join('&');
}

const trackSearch = debounce((data: Record<string, any>) => {
  trackEvent('Search', data);
}, 2500);

const query = throttle(() => {
  const queryString = getQueryString();
  const future = !!(document.getElementById('futureCheckbox') as HTMLInputElement).checked;
  const everywhere = !!(document.getElementById('everywhereCheckbox') as HTMLInputElement).checked;
  currentPage = Math.min(currentPage, Math.floor(10000 / itemsPerPage - 1));

  const elements = {};

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

  socket.emit('queryEntries', queryObj, (message) => {
    if (debugResponse) {
      console.log(message);
    }

    handleQueryResult(message.result, message.err);
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

function renderResults() {
  const gridView = document.getElementById('mediathekGridView');
  const tableView = document.getElementById('mediathekTableView');
  const tableBody = document.getElementById('mediathekTableBody');
  const noResults = document.getElementById('noResults');
  const queryInfoLabel = document.getElementById('queryInfoLabel');
  const pagination = document.getElementById('pagination');

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
  } else {
    tableView.classList.remove('hidden');
  }
  noResults.classList.add('hidden');

  const container = currentView === 'grid' ? gridView : tableBody;
  for (let i = 0; i < lastResult.results.length; i++) {
    const data = lastResult.results[i];

    if (data.timestamp == 0) {
      data.dateString = data.timeString = '?';
    }
    else {
      data.dateString = formatDate(data.timestamp);
      data.timeString = formatTime(data.timestamp);
    }

    data.durationString = isNaN(data.duration) ? '?' : formatDuration(data.duration);

    const element = currentView === 'grid' ? createResultCard(data) : createResultTableRow(data);
    container.appendChild(element);
  }

  const actualPagesCount = Math.ceil(lastResult.queryInfo.totalResults / itemsPerPage);
  const shownPagesCount = Math.min(actualPagesCount, Math.floor(10000 / itemsPerPage));

  createPagination(shownPagesCount);

  queryInfoLabel.innerHTML = 'Die Suche dauerte ' + lastResult.queryInfo.searchEngineTime.toString().replace('.', ',') + ' ms. Zeige Treffer ' + Math.min(lastResult.queryInfo.totalResults, (currentPage * itemsPerPage + 1)) +
    ' bis ' + Math.min(lastResult.queryInfo.totalResults, ((currentPage + 1) * itemsPerPage)) + ' von insgesamt ' + lastResult.queryInfo.totalResults + '.</br>Filmliste zuletzt ' + filmlisteTime + ' aktualisiert.';
}

function handleQueryResult(result, err) {
  const queryInfoLabel = document.getElementById('queryInfoLabel');
  const pagination = document.getElementById('pagination');
  const gridView = document.getElementById('mediathekGridView');
  const tableView = document.getElementById('mediathekTableView');
  const tableBody = document.getElementById('mediathekTableBody');
  const noResults = document.getElementById('noResults');

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

function createVideoActions(entry) {
  const container = document.createElement('div');
  container.className = 'flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400';
  const filenamebase = entry.channel + ' - ' + entry.topic + ' - ' + entry.title + ' - ' + formatDate(entry.timestamp) + ' ' + formatTime(entry.timestamp);
  const actionTemplate = (document.getElementById('video-action-template') as HTMLTemplateElement).content;

  const createActionTag = (quality, playUrl) => {
    const tag = actionTemplate.cloneNode(true) as DocumentFragment;
    const qualityEl = tag.querySelector('[data-id="quality"]');
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

  if (entry.url_video_hd) {
    container.appendChild(createActionTag('HD', entry.url_video_hd));
  }
  if (entry.url_video) {
    container.appendChild(createActionTag('SD', entry.url_video));
  }
  if (entry.url_video_low) {
    container.appendChild(createActionTag('LQ', entry.url_video_low));
  }
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

function createResultTableRow(data) {
  const template = document.getElementById('result-row-template') as HTMLTemplateElement;
  const row = template.content.cloneNode(true) as DocumentFragment;
  const rowElement = row.firstElementChild as HTMLElement;
  rowElement.classList.add('table-row-grid');

  const titleEl = row.querySelector<HTMLParagraphElement>('[data-id="title"]');
  titleEl.textContent = data.title;
  titleEl.title = data.title;

  const channelEl = row.querySelector<HTMLAnchorElement>('[data-id="channel"]');
  channelEl.textContent = data.channel;
  channelEl.className += ' ' + getChannelColorClasses(data.channel);

  if (data.url_website) {
    channelEl.href = data.url_website;
    channelEl.target = '_blank';
    channelEl.rel = 'noopener noreferrer';
    channelEl.title = `Website von ${data.channel} besuchen`;
  }

  const topicEl = row.querySelector<HTMLSpanElement>('[data-id="topic"]');
  topicEl.textContent = data.topic;
  topicEl.title = data.topic;

  row.querySelector('[data-id="date"]').textContent = data.dateString;
  row.querySelector('[data-id="time"]').textContent = data.timeString;
  row.querySelector('[data-id="duration"]').textContent = data.durationString;

  const sizeElement = row.querySelector('[data-id="size"]');

  if (sizeElement) {
    sizeElement.textContent = ''; // Clear it first

    const urlForSize = data.url_video_hd ?? data.url_video ?? data.url_video_low;

    if (urlForSize != undefined) {
      socket.emit('getContentLength', urlForSize, (length) => {
        sizeElement.textContent = (length > 0) ? formatBytes(length, 2) : '';
      });
    }
  }

  row.querySelector('[data-id="actions"]').appendChild(createVideoActions(data));

  return rowElement;
}

function createResultCard(data) {
  const template = document.getElementById('result-card-template') as HTMLTemplateElement;
  const card = template.content.cloneNode(true) as DocumentFragment;
  const cardElement = card.firstElementChild as HTMLElement;

  const titleEl = card.querySelector<HTMLHeadingElement>('[data-id="title"]');
  titleEl.textContent = data.title;
  titleEl.title = data.title;

  const descriptionEl = card.querySelector<HTMLParagraphElement>('[data-id="description"]');
  descriptionEl.textContent = data.description || 'Keine Beschreibung verfügbar.';
  descriptionEl.title = data.description;

  const channelEl = card.querySelector<HTMLAnchorElement>('[data-id="channel"]');
  channelEl.textContent = data.channel;
  channelEl.className += ' ' + getChannelColorClasses(data.channel);

  if (data.url_website) {
    channelEl.href = data.url_website;
    channelEl.target = '_blank';
    channelEl.rel = 'noopener noreferrer';
    channelEl.title = `Website von ${data.channel} besuchen`;
  }

  const topicEl = card.querySelector<HTMLSpanElement>('[data-id="topic"]');
  topicEl.textContent = data.topic;
  topicEl.title = data.topic;

  card.querySelector('[data-id="datetime"]').textContent = `${data.dateString}, ${data.timeString} Uhr`;
  card.querySelector('[data-id="duration"]').textContent = `Dauer: ${data.durationString}`;

  const sizeElement = card.querySelector('[data-id="size"]');
  sizeElement.textContent = '';

  const urlForSize = data.url_video_hd ?? data.url_video ?? data.url_video_low;

  if (urlForSize != undefined) {
    socket.emit('getContentLength', urlForSize, (length) => {
      sizeElement.textContent = (length > 0) ? formatBytes(length, 2) : '';
    });
  }

  card.querySelector('[data-id="actions"]').appendChild(createVideoActions(data));

  return cardElement;
}


function createPaginationButton(html, active, enabled, callback) {
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

function createPagination(totalPages) {
  const pagination = document.getElementById('pagination');
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

function isFullscreen() {
  return (document as any).fullscreenElement
    || (document as any).webkitFullscreenElement
    || (document as any).mozFullScreenElement
    || (document as any).msFullscreenElement;
}

function requestFullscreen(element) {
  if (element.requestFullscreen) {
    element.requestFullscreen();
  }
  else if (element.webkitRequestFullScreen) {
    element.webkitRequestFullScreen();
  }
  else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  }
  else if (element.msRequestFullscreen) {
    element.msRequestFullscreen();
  }
}

function exitFullscreen() {
  if ((document as any).exitFullscreen) {
    (document as any).exitFullscreen();
  }
  else if ((document as any).webkitExitFullscreen) {
    (document as any).webkitExitFullscreen();
  }
  else if ((document as any).mozCancelFullScreen) {
    (document as any).mozCancelFullScreen();
  }
  else if ((document as any).msExitFullscreen) {
    (document as any).msExitFullscreen();
  }
}

function isVideoPlaying() {
  if (!video) {
    return false;
  }
  else {
    return !video.paused();
  }
}

function toggleVideoPause() {
  if (video) {
    video.paused() ? video.play() : video.pause();
  }
}

function playVideo(channel: string, topic: string, title: string, url: string, quality: string) {
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

  video = (videojs as any as (id: string, opts: any) => any)('video-player', {
    plugins: {
      hotkeys: true
    }
  });

  vid.addEventListener('dblclick', () => {
    if (isFullscreen()) {
      exitFullscreen();
    }
    else {
      requestFullscreen(video);
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

function openContactsModal() {
  contactDialog.showModal();
}

function returnEmptyString() {
  return '';
}

function copyToClipboard(text) {
  const dummy = document.createElement('textarea');
  document.body.appendChild(dummy);
  dummy.value = text;
  dummy.select();
  document.execCommand('copy');
  document.body.removeChild(dummy);
}

function setViewMode(mode: 'grid' | 'list', fromUser = false) {
  if (currentView === mode && !fromUser) return;

  currentView = mode;
  window.localStorage?.setItem?.(viewModeKey, mode);

  const gridView = document.getElementById('mediathekGridView');
  const tableView = document.getElementById('mediathekTableView');
  const viewModeIcon = document.getElementById('viewModeIcon') as HTMLElement;
  const mainElement = document.querySelector('main');

  if (!gridView || !tableView || !viewModeButton || !viewModeIcon || !mainElement) return;

  if (mode === 'list') {
    viewModeIcon.textContent = 'view_module';
    viewModeButton.title = 'Kartenansicht';
    gridView.classList.add('hidden');
    tableView.classList.remove('hidden');
    mainElement.classList.remove('max-w-7xl');
    mainElement.classList.add('max-w-screen-2xl');
  } else { // grid
    viewModeIcon.textContent = 'view_list';
    viewModeButton.title = 'Listenansicht';
    gridView.classList.remove('hidden');
    tableView.classList.add('hidden');
    mainElement.classList.add('max-w-7xl');
    mainElement.classList.remove('max-w-screen-2xl');
  }

  if (fromUser) {
    renderResults();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initializeAnalytics();

  document.getElementById('browserWarning')?.remove();

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
      const cookieAcceptButtonElement = document.getElementById('cookieAcceptButton');
      const cookieDenyButtonElement = document.getElementById('cookieDenyButton');

      cookieAcceptButtonElement.addEventListener('click', () => {
        trackEvent('Cookie Consent', { consent: 'accept' });
        window.localStorage?.setItem?.(allowCookiesKey, 'true');
        window.localStorage?.setItem?.(lastAllowCookiesAskedKey, Date.now().toString());
        cookieDialog.close();
        addAdSense();
      });

      cookieDenyButtonElement.addEventListener('click', () => {
        trackEvent('Cookie Consent', { consent: 'deny' });
        window.localStorage?.setItem?.(allowCookiesKey, 'false');
        window.localStorage?.setItem?.(lastAllowCookiesAskedKey, Date.now().toString());
        cookieDialog.close();
      });
    }
  } catch (error) {
    console.warn('Could not access localStorage. Ads will not be shown.', error);
  }

  let connectingDialogTimeout: number | null = null;
  if (socket.disconnected) {
    connectingDialogTimeout = window.setTimeout(() => {
      if (!connectingDialog.open) {
        connectingDialog.showModal();
      }
    }, 500);
  }

  socket.on('connect', () => {
    console.log('connected');
    if (connectingDialogTimeout) {
      clearTimeout(connectingDialogTimeout);
      connectingDialogTimeout = null;
    }
    connectingDialog.close();
  });

  socket.on('disconnect', () => {
    console.log('disconnected');
    if (!connectingDialog.open) {
      connectingDialog.showModal();
    }
    socket.connect();
  });

  socket.on('reconnect', (attemptNumber) => {
    console.log('reconnected', attemptNumber);
  });

  socket.on('reconnect_attempt', (attemptNumber) => {
    console.log('attempting reconnect', attemptNumber);
  });

  socket.on('reconnect_failed', () => {
    console.log('reconnect failed');
  });

  socket.on('reconnect_error', (error) => {
    console.error('reconnect_error', error);
  });

  socket.on('connect_error', (error) => {
    console.error('connect_error', error);
  });

  document.getElementById('rssFeedButton').addEventListener('click', () => {
    trackEvent('Click RSS Feed');
    const search = window.location.hash.replace('#', '');
    window.open(window.location.origin + window.location.pathname + 'feed' + (search.length > 0 ? '?' : '') + search, '_blank');
  });

  const newQuery = () => {
    currentPage = 0;
    query();
  };

  const pageSizeButton = document.getElementById('pageSizeDropdownButton') as HTMLButtonElement;
  const pageSizeSelect = document.getElementById('pageSizeSelect') as HTMLSelectElement;
  const storedPageSize = window.localStorage?.getItem?.('pageSize');

  if (storedPageSize && ['5', '10', '15', '20', '25'].includes(storedPageSize)) {
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
    const value = select.value;
    const [newSortBy, newSortOrder] = value.split('_');

    sortBy = newSortBy;
    sortOrder = newSortOrder;

    trackEvent('Change Sort', { by: sortBy, order: sortOrder });
    updateSortButton(select);
    newQuery();
  });


  document.getElementById('queryInput').addEventListener('input', () => {
    const currentQueryString = getQueryString();

    if (currentQueryString != lastQueryString) {
      newQuery();
      lastQueryString = currentQueryString;
    }

    updateQueryInputClearButton();
  });

  document.querySelectorAll('#queryParameters input[type=checkbox]').forEach(el => el.addEventListener('change', () => newQuery()));

  document.getElementById('videocloseButton').addEventListener('click', () => {
    if (videoDialog.open) {
      videoDialog.close();
    }
  });

  videoDialog.addEventListener('cancel', (e) => {
    if (isFullscreen()) {
      e.preventDefault();
      exitFullscreen();
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


  document.getElementById('queryInputClearButton').addEventListener('click', function () {
    const queryInput = document.getElementById('queryInput') as HTMLInputElement;
    queryInput.value = '';
    queryInput.dispatchEvent(new Event('input'));
    queryInput.focus();
  });

  document.getElementById('contactButton').addEventListener('click', (e) => {
    e.preventDefault();
    trackEvent('Open Contact Modal');
    openContactsModal();
  });

  document.getElementById('donateNavButton').addEventListener('click', (e) => {
    e.preventDefault();
    trackEvent('Open Donate Modal');
    donateDialog.showModal();
  });

  document.getElementById('logo').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('generic-html-view').classList.add('hidden');
    document.getElementById('main-view').classList.remove('hidden');

    return false;
  });

  document.getElementById('datenschutzButton').addEventListener('click', (e) => {
    e.preventDefault();
    trackEvent('View Datenschutz');

    document.getElementById('main-view').classList.add('hidden');
    document.getElementById('generic-html-view').classList.remove('hidden');

    if (datenschutz == null) {
      socket.emit('getDatenschutz', (response) => {
        datenschutz = response;
        document.getElementById('genericHtmlContent').innerHTML = response;
      });
    }
    else {
      document.getElementById('genericHtmlContent').innerHTML = datenschutz;
    }
  });

  document.getElementById('impressumButton').addEventListener('click', (e) => {
    e.preventDefault();
    trackEvent('View Impressum');

    document.getElementById('main-view').classList.add('hidden');
    document.getElementById('generic-html-view').classList.remove('hidden');

    if (impressum == null) {
      socket.emit('getImpressum', (response) => {
        impressum = response;
        document.getElementById('genericHtmlContent').innerHTML = response;
      });
    }
    else {
      document.getElementById('genericHtmlContent').innerHTML = impressum;
    }
  });

  document.getElementById('genericHtmlViewBackButton').addEventListener('click', () => {
    document.getElementById('generic-html-view').classList.add('hidden');
    document.getElementById('main-view').classList.remove('hidden');
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

  document.querySelectorAll('[title]').forEach(el => {
    // Basic tooltip functionality could be enhanced here if needed
  });

  const forumButton = document.getElementById('forumButton');
  if (forumButton) {
    forumButton.addEventListener('click', () => {
      trackEvent('Click Forum Link');
    });
  }

  const githubButton = document.getElementById('githubButton');
  if (githubButton) {
    githubButton.addEventListener('click', () => {
      trackEvent('Click GitHub Link');
    });
  }

  document.getElementById('helpButton').addEventListener('click', () => {
    trackEvent('Click Help Link');
    window.open('https://github.com/mediathekview/mediathekviewweb/blob/master/README.md', '_blank');
  });

  viewModeButton = document.getElementById('viewModeButton') as HTMLButtonElement;

  const storedViewMode = window.localStorage?.getItem?.(viewModeKey);
  if (storedViewMode === 'list') {
    setViewMode('list');
  } else {
    setViewMode('grid'); // Default
  }

  viewModeButton.addEventListener('click', () => {
    const newMode = currentView === 'grid' ? 'list' : 'grid';
    setViewMode(newMode, true);
  });

  setQueryFromURIHash();
  query();
});
