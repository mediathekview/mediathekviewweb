/// <reference types="bootstrap" />
/// <reference types="datatables.net" />
/// <reference types="jquery" />
/// <reference types="lodash" />
/// <reference types="socket.io-client" />
/// <reference types="video.js" />

declare const Cookies;

interface XMLHttpRequest {
  baseOpen: (method: string, url: string, async?: boolean, user?: string, password?: string) => void;
}

const allowCookiesKey = 'allowCookies';
const lastAllowCookiesAskedKey = 'allowCookiesAsked';

const debugResponse = false;
const socket = io();
const pv_id = randomString(6);
const itemsPerPage = 15;
let currentPage = 0;
let mediathekTable;
let connectingModal;
let contactModal;
let cookieModal;
let indexingModal;
let uid;
let playingInterval;
let playStartTimestamp;
let lastQueryString = null;
let ignoreNextHashChange = false;
let impressum = null;
let datenschutz = null;
let donate = null;
let queryInputClearButtonState = 'hidden';
let video;
let sortBy = 'timestamp';
let sortOrder = 'desc';

const preferedThemeMediaQuery = window.matchMedia?.('(prefers-color-scheme: dark)');

preferedThemeMediaQuery?.addEventListener?.('change', (event) => {
  updateTheme(event.matches);
});

updateTheme(preferedThemeMediaQuery?.matches ?? false);

function updateTheme(dark: boolean): void {
  const theme = dark ? 'static/bootstrap-darkly.min.css' : 'static/bootstrap-lumen.min.css';
  (document.getElementById('bootstrap-theme') as HTMLLinkElement).href = theme;
}

socket.on('connect', () => {
  console.log('connected');
});

socket.on('disconnect', () => {
  console.log('disconnected');
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

XMLHttpRequest.prototype.baseOpen = XMLHttpRequest.prototype.open;

XMLHttpRequest.prototype.open = function (this: XMLHttpRequest, method: string, url: string, async?: boolean, user?: string, password?: string) {
  if (url.startsWith('http://srfvodhd-vh.akamaihd.net') || url.startsWith('http://hdvodsrforigin-f.akamaihd.net')) {
    url = 'https' + url.slice(4);
  }

  this.baseOpen(method, url, async, user, password);
}

/*polyfills for stupid internet explorer*/
if (!String.prototype.endsWith) {
  String.prototype.endsWith = function (searchString, position) {
    const subjectString = this.toString();
    if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
      position = subjectString.length;
    }
    position -= searchString.length;
    const lastIndex = subjectString.indexOf(searchString, position);
    return lastIndex !== -1 && lastIndex === position;
  };
}
if (!String.prototype.startsWith) {
  String.prototype.startsWith = function (searchString, position) {
    position = position || 0;
    return this.indexOf(searchString, position) === position;
  };
}

function pad(value: number, size: number) {
  let stringValue = value.toString();
  while (stringValue.length < (size || 2)) {
    stringValue = "0" + stringValue;
  }
  return stringValue;
}

function modalIsOpen(modalDOM) {
  return (modalDOM.data('bs.modal') || {}).isShown;
}

function randomString(len) {
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < len; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
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

function track(action) {
  const date = new Date();
  socket.emit('track', {
    uid: uid,
    pv_id: pv_id,
    ua: navigator.userAgent,
    lang: navigator.language,
    res: window.screen.width + "x" + window.screen.height,
    urlref: document.referrer,
    action_name: action,
    h: date.getHours(),
    m: date.getMinutes(),
    s: date.getSeconds(),
    rand: randomString(10),
    href: window.location.href
  });
}

uid = window.localStorage?.getItem?.('uid');

if (!!uid) {
  uid = uid.trim();
} else {
  uid = Cookies.get('uid');
  if (!!uid) {
    uid = uid.trim();
  }
}
if (!!uid && uid.length == 32) {
  track('index');
} else {
  socket.on('uid', (_uid) => {
    window.localStorage?.setItem?.('uid', _uid);

    Cookies.set('uid', _uid, {
      expires: 99999
    });
    uid = _uid;

    track('index');
  });
  socket.emit('requestUid');
}

setInterval(() => {
  if (socket.connected && !isVideoPlaying()) {
    track('heartbeat');
  }
}, 20 * 60 * 1000); /*every 20 minutes*/

socket.on('indexState', (state) => {
  const parsingProgress = (state.parserProgress * 100).toFixed(0);
  const indexingProgress = (state.indexingProgress * 100).toFixed(0);
  $('#parsingProgressbar').css('width', (parsingProgress + '%')).text(parsingProgress + '%');
  $('#indexingProgressbar').css('width', (indexingProgress + '%')).text(indexingProgress + '%');
  $('#indexingMessage').text(state.entries);
  $('#indexingTimeLabel').text((state.time / 1000).toFixed(0) + ' Sekunden');

  if (!state.done && !state.error) {
    if (!modalIsOpen(indexingModal)) {
      indexingModal.modal('show');
    }
  } else if (state.error) {
    $('#indexingMessage').text(state.error);
    setTimeout(() => indexingModal.modal('hide'), 3000);
  } else {
    indexingModal.modal('hide');
    currentPage = 0;
    query();
  }
});

const trackQuery = _.debounce(() => track('query'), 2000);

function getQueryString() {
  return $('#queryInput').val().toString().trim();
}

function setQueryFromURIHash() {
  const props = parseURIHash(window.location.hash);

  if (props['query']) {
    $('#queryInput').val(props['query']).trigger('input');
  } else {
    $('#queryInput').val('').trigger('input');
  }

  if (props['everywhere'] === 'true') {
    $('#everywhereCheckbox').prop('checked', true);
  } else {
    $('#everywhereCheckbox').prop('checked', false);
  }

  if (props['future'] === 'false') {
    $('#futureCheckbox').prop('checked', false);
  } else {
    $('#futureCheckbox').prop('checked', true);
  }

  if (!isNaN(parseInt(props['page']))) {
    currentPage = parseInt(props['page']) - 1;
  } else {
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

const query = _.throttle(() => {
  const queryString = getQueryString();
  const future = !!$('#futureCheckbox').prop('checked');
  const everywhere = !!$('#everywhereCheckbox').prop('checked');
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

  trackQuery();
}, 20);

function handleQueryResult(result, err) {
  mediathekTable.clear();
  mediathekTable.draw();

  if (err) {
    $('#queryInfoLabel').html('Fehler:<br/>' + err.join('<br/>'));
    $('#pagination').empty();

    return;
  }

  if (!result) {
    return;
  }

  for (let i = 0; i < result.results.length; i++) {
    const data = result.results[i];

    if (data.timestamp == 0) {
      data.dateString = data.timeString = '?';
    }
    else {
      data.dateString = formatDate(data.timestamp);
      data.timeString = formatTime(data.timestamp);
    }

    data.durationString = isNaN(data.duration) ? '?' : formatDuration(data.duration);

    mediathekTable.row.add(data);
  }

  mediathekTable.draw();

  const actualPagesCount = Math.ceil(result.queryInfo.totalResults / itemsPerPage);
  const shownPagesCount = Math.min(actualPagesCount, Math.floor(10000 / itemsPerPage));

  createPagination(shownPagesCount);

  const filmlisteTime = `am ${formatDate(result.queryInfo.filmlisteTimestamp)} um ${formatTime(result.queryInfo.filmlisteTimestamp)} Uhr`;

  $('#queryInfoLabel').html('Die Suche dauerte ' + result.queryInfo.searchEngineTime.toString().replace('.', ',') + ' ms. Zeige Treffer ' + Math.min(result.queryInfo.totalResults, (currentPage * itemsPerPage + 1)) +
    ' bis ' + Math.min(result.queryInfo.totalResults, ((currentPage + 1) * itemsPerPage)) + ' von insgesamt ' + result.queryInfo.totalResults + '.</br>Filmliste zuletzt ' + filmlisteTime + ' aktualisiert.');
}

function createPaginationButton(html, active, enabled, callback) {
  const button = $('<li>').addClass(active ? 'active' : '').addClass(enabled ? '' : 'disabled').append($('<a>', {
    href: '#',
    html: html,
    click: () => {
      if (enabled && !active) {
        callback();
        query();
      }

      return false;
    }
  }));

  return button;
}

function createPagination(totalPages) {
  const pagination = $('#pagination');
  pagination.empty();

  const backButton = createPaginationButton('<i class="material-icons" style="margin: -6px;">keyboard_arrow_left</i>', false, currentPage > 0, () => {
    currentPage--;
  });
  pagination.append(backButton);

  const pagingBegin = Math.max(0, currentPage - 2 - (2 - Math.min(2, totalPages - (currentPage + 1))));
  const pagingEnd = Math.min(totalPages, pagingBegin + 5);

  for (let i = pagingBegin; i < pagingEnd; i++) {
    const button = createPaginationButton(i + 1, currentPage == i, true, () => {
      currentPage = i;
    });
    pagination.append(button);
  }

  const nextButton = createPaginationButton('<i class="material-icons" style="margin: -6px">keyboard_arrow_right</i>', false, currentPage < (totalPages - 1), () => {
    currentPage++;
  });
  pagination.append(nextButton);
}


function getContentLength(url, callback) {
  socket.emit('getContentLength', url, (contentLength) => {
    callback(contentLength);
  });
}

function getDescription(id, callback) {
  socket.emit('getDescription', id, (description) => {
    callback(description);
  });
}

function createSubtitleRow(text, url, filename, filesize?) {
  const tableRow = $('<tr>');

  const downloadButton = $('<a>', {
    target: '_blank',
    href: url,
    download: filename
  });

  downloadButton.click(() => track('download-subtitle'));

  const downloadIcon = $('<i>').addClass('material-icons floatRight').text('save');
  downloadButton.append(downloadIcon);

  const filesizeCell = $('<td>').text((isNaN(filesize) || !filesize) ? '?' : formatBytes(filesize, 2));

  tableRow.append($('<td>').text(text));
  tableRow.append(filesizeCell);
  tableRow.append($('<td>').append(downloadButton));

  return tableRow;
}

function createVideoRow(text, url, videoTitle, description, filename, filesize?) {
  const tableRow = $('<tr>');

  const watchButton = $('<a>', {
    target: '_blank',
    href: url,
    click: () => {
      playVideo(videoTitle, description, url);
      return false;
    }
  });

  const watchIcon = $('<i>').addClass('material-icons floatLeft').text('ondemand_video');
  watchButton.click(() => { watchIcon.addClass('pulse'); setTimeout(() => watchIcon.removeClass('pulse'), 500); });
  watchButton.append(watchIcon);

  const downloadButton = $('<a>', {
    target: '_blank',
    href: url,
    download: filename
  });

  const downloadIcon = $('<i>').addClass('material-icons floatRight').text('save');

  downloadButton.click(() => { downloadIcon.addClass('pulse'); setTimeout(() => downloadIcon.removeClass('pulse'), 500); track('download-video'); });
  downloadButton.append(downloadIcon);

  const clipboardButton = $('<a>', {
    target: '_blank',
    href: url,
    download: filename
  });

  const clipboardIcon = $('<i>').addClass('material-icons floatRight').text('assignment');

  clipboardButton.click(() => { copyToClipboard(url); clipboardIcon.addClass('pulse'); setTimeout(() => clipboardIcon.removeClass('pulse'), 500); return false; });
  clipboardButton.append(clipboardIcon);

  const filesizeCell = $('<td>').text((isNaN(filesize) || !filesize) ? '?' : formatBytes(filesize, 2)).addClass('filesizeCell');

  tableRow.append($('<td>').text(text));
  tableRow.append(filesizeCell);
  tableRow.append($('<td>').append($('<div>').append(watchButton).append(clipboardButton).append(downloadButton).addClass('watchDownloadField')));

  return tableRow;
}

function hidePopoverIfNotHovered(button, callback) {
  setTimeout(() => {
    const popoverID = button.attr('aria-describedby');
    const popover = $('#' + popoverID);
    if (popover.length) {
      if (!popover.is(':hover') && !button.is(':hover')) {
        button.popover('hide');

        if (typeof callback == 'function') {
          callback();
        }
      }
    }
  }, 150);
}

function createDescriptionButton(entry) {
  let state = false;
  const description = null;

  const icon = $('<i>').addClass('material-icons').text('expand_more');
  const popoverContent = $('<div>').html('<i class="material-icons spin-right" style="display: inline-flex; vertical-align: middle; font-size: 2.5em;">autorenew</i> <span style="font-size:1.2em; vertical-align: middle;">Laden...</span>');

  const button = $('<a>', {
    target: '_blank',
    href: '#',
    click: () => {
      if (!state) {
        if (description == null) {
          getDescription(entry.id, (dscrp) => {
            popoverContent.text(dscrp);
            if (state) {
              button.popover('show');
            }
          });
        }

        button.popover('show');
        icon.addClass('rotateLeft');
        state = true;
      } else {
        button.popover('hide');
        icon.removeClass('rotateLeft');
        state = false;
      }

      return false;
    }
  });

  button.popover({
    trigger: 'manual',
    //toggle: 'popover',
    placement: 'auto right' as any,
    container: '#blur',
    template: '<div class="popover" role="tooltip"><h3 class="popover-title"></h3><div class="popover-content"></div></div>',
    content: popoverContent as any,
    html: true,
    animation: true
  });

  button.on('mouseleave', () => {
    hidePopoverIfNotHovered(button, () => {
      state = false;
      icon.removeClass('rotateLeft');
    });
  });

  button.append(icon);

  return button;
}

function resetVideoActionButton(button) {
  button.removeClass('text-warning');
  button.children().first().removeClass('icon-big');
  button.clicked = false;
}

function createVideoActionButton(entry) {
  const highestQualityUrl = entry.url_video_hd ? entry.url_video_hd : (entry.url_video ? entry.url_video : entry.url_video_low);

  const button = $('<a>', {
    target: '_blank',
    href: highestQualityUrl,
    click: () => {
      if (!(button as any).clicked) {
        (button as any).clicked = true;
        button.addClass('text-warning');
        button.children().first().addClass('icon-big');
      } else {
        playVideo(entry.title, entry.description, highestQualityUrl);
      }

      return false;
    }
  });

  const icon = $('<i>').addClass('material-icons movie-icon').text('movie');
  button.append(icon);

  const table = $('<table>').addClass('table-condensed');
  table.append(`<thead>
          <tr>
            <th>Qualität</th>
            <th>Größe</th>
            <th>Aktion</th>
          </tr>
        </thead>`);


  const tableBody = $('<tbody>');

  const filenamebase = entry.channel + ' - ' + entry.topic + ' - ' + entry.title + ' - ' + formatDate(entry.timestamp) + ' ' + formatTime(entry.timestamp);

  let lowRow, midRow, highRow, subtitleRow;

  if (entry.url_video_hd) {
    highRow = createVideoRow('Hoch', entry.url_video_hd, entry.title, entry.description, filenamebase + '.' + entry.url_video_hd.split('.').pop());
    tableBody.append(highRow);
  }
  if (entry.url_video) {
    midRow = createVideoRow('Mittel', entry.url_video, entry.title, entry.description, filenamebase + '.' + entry.url_video.split('.').pop(), entry.size);
    tableBody.append(midRow);
  }
  if (entry.url_video_low) {
    lowRow = createVideoRow('Niedrig', entry.url_video_low, entry.title, entry.description, filenamebase + '.' + entry.url_video_low.split('.').pop());
    tableBody.append(lowRow);
  }
  if (entry.url_subtitle) {
    subtitleRow = createSubtitleRow('UT', entry.url_subtitle, filenamebase + '.' + entry.url_subtitle.split('.').pop());
    tableBody.append(subtitleRow);
  }

  table.append(tableBody);

  button.popover({
    trigger: 'manual',
    // toggle: 'popover',
    placement: 'auto right' as any,
    container: '#blur',
    content: table as any,
    html: true,
    animation: true
  });

  let requestedFilesize = false;

  button.on('mouseenter', () => {
    button.popover('show');
    const popoverID = button.attr('aria-describedby');
    const popover = $('#' + popoverID);
    if (popover.length) {
      popover.on('mouseleave', () => {
        hidePopoverIfNotHovered(button, () => resetVideoActionButton(button));
      });
    }

    if (!requestedFilesize) {
      requestedFilesize = true;
      if (highRow) {
        getContentLength(entry.url_video_hd, (bytes) => {
          highRow.find('td:eq(1)').text(formatBytes(bytes, 2));
        });
      }
      if (midRow) {
        getContentLength(entry.url_video, (bytes) => {
          midRow.find('td:eq(1)').text(formatBytes(bytes, 2));
        });
      }
      if (lowRow) {
        getContentLength(entry.url_video_low, (bytes) => {
          lowRow.find('td:eq(1)').text(formatBytes(bytes, 2));
        });
      }
      if (subtitleRow) {
        getContentLength(entry.url_subtitle, (bytes) => {
          subtitleRow.find('td:eq(1)').text(formatBytes(bytes, 2));
        });
      }
    }
  });

  button.on('mouseleave', () => {
    hidePopoverIfNotHovered(button, () => resetVideoActionButton(button));
  });

  return button;
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
  } else if (element.webkitRequestFullScreen) {
    element.webkitRequestFullScreen();
  } else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if (element.msRequestFullscreen) {
    element.msRequestFullscreen();
  }
}

function exitFullscreen() {
  if ((document as any).exitFullscreen) {
    (document as any).exitFullscreen();
  } else if ((document as any).webkitExitFullscreen) {
    (document as any).webkitExitFullscreen();
  } else if ((document as any).mozCancelFullScreen) {
    (document as any).mozCancelFullScreen();
  } else if ((document as any).msExitFullscreen) {
    (document as any).msExitFullscreen();
  }
}

function isVideoPlaying() {
  if (!video) {
    return false;
  } else {
    return !video.paused();
  }
}

function toggleVideoPause() {
  if (video) {
    video.paused() ? video.play() : video.pause();
  }
}

function playVideo(title: string, description: string, url: string) {
  if (url.startsWith('http://')) {
    playVideoInNewWindow(url);
    return;
  }

  $('#videooverlay').show(200, () => {
    $('#blur').addClass('blur');
    const vid = $('<video>', {
      class: 'video-js vjs-default-skin vjs-big-play-centered vjs-16-9',
      id: 'video-player',
      preload: 'auto',
      controls: '',
      width: '100%'
    });
    const source = $('<source>', {
      src: url
    });
    if (url.endsWith('m3u8')) {
      source.attr('type', 'application/x-mpegURL');
    }
    vid.append(source);

    $('#videocontent').append(vid);

    video = (videojs as any as (id: string, opts: any) => any)('video-player', {
      plugins: {
        hotkeys: true
      }
    });

    video.titleBar.update({
      title,
      description
    });

    vid.dblclick(() => {
      if (isFullscreen()) {
        exitFullscreen();
      } else {
        requestFullscreen(video);
      }
    });
  }).focus();

  clearInterval(playingInterval); /*in case it wasn't stopped for any reason*/
  playingInterval = setInterval(() => {
    if (socket.connected) {
      if (isVideoPlaying()) {
        track('playing');
      } else {
        track('paused');
      }
    }
  }, 1 * 60 * 1000); /*every minute*/

  track('play');
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

function closeVideo() {
  const playDuration = Date.now() - playStartTimestamp;

  if (playDuration >= 1000 * 30) {
    location.reload();
  }

  video.dispose();
  $('#videocontent').empty();
  $('#videooverlay').hide(200);
  $('#blur').removeClass('blur');

  clearInterval(playingInterval);
}

function openContactsModal() {
  contactModal.modal('show');
  track('contact');
}

function returnEmptyString() {
  return '';
}

function copyToClipboard(text) {
  var dummy = document.createElement('textarea');
  document.body.appendChild(dummy);
  dummy.value = text;
  dummy.select();
  document.execCommand('copy');
  document.body.removeChild(dummy);
}

$(() => {
  $.fn.dataTable.ext.errMode = 'none';

  $('#browserWarning').remove();

  cookieModal = $('#cookieModal');
  cookieModal.modal({
    backdrop: 'static',
    keyboard: false,
    show: false
  });

  connectingModal = $('#connectingModal');
  connectingModal.modal({
    backdrop: 'static',
    keyboard: false,
    show: false
  });

  indexingModal = $('#indexingModal');
  indexingModal.modal({
    backdrop: 'static',
    keyboard: false,
    show: false
  });

  contactModal = $('#contactModal');
  contactModal.modal({
    backdrop: true,
    keyboard: true,
    show: false
  });

  const allowCookies = window.localStorage?.getItem?.(allowCookiesKey);

  if ((allowCookies != 'true') && (allowCookies != 'false')) {
    cookieModal = $('#cookieModal');
    cookieModal.modal('show');

    const cookieAcceptButtonElement = document.getElementById('cookieAcceptButton');
    const cookieDenyButtonElement = document.getElementById('cookieDenyButton');

    cookieAcceptButtonElement.addEventListener('click', () => {
      window.localStorage?.setItem?.(allowCookiesKey, 'true');
      window.localStorage?.setItem?.(lastAllowCookiesAskedKey, Date.now().toString());
      cookieModal.modal('hide');
      location.reload();
    });

    cookieDenyButtonElement.addEventListener('click', () => {
      window.localStorage?.setItem?.(allowCookiesKey, 'false');
      window.localStorage?.setItem?.(lastAllowCookiesAskedKey, Date.now().toString());
      cookieModal.modal('hide');
    });
  }

  socket.on('connect', () => {
    connectingModal.modal('hide');
  });

  socket.on('disconnect', () => {
    indexingModal.modal('hide');
    if (!modalIsOpen(connectingModal)) {
      connectingModal.modal('show');
    }
  });

  setInterval(() => {
    if (socket.disconnected) {
      if (!modalIsOpen(connectingModal)) {
        connectingModal.modal('show');
      }
    }
  }, 1500);

  mediathekTable = $('#mediathek').DataTable({
    columns: [{ /*Sender*/
      width: '1%',
      data: null,
      render: returnEmptyString,
      createdCell: (td, cellData, rowData, row, col) => {
        const link = $('<a>', {
          target: '_blank',
          text: rowData.channel,
          href: rowData.url_website
        });
        $(td).append(link);
      }
    }, { /*Thema*/
      width: '30%',
      data: 'topic'
    }, { /*Title*/
      width: '70%',
      data: 'title'
    }, { /*Description*/
      width: '1%',
      data: null,
      render: returnEmptyString,
      createdCell: (td, cellData, rowData, row, col) => {
        $(td).append(createDescriptionButton(rowData));
      }
    }, { /*Date*/
      width: '1%',
      data: 'dateString'
    }, { /*Time*/
      width: '1%',
      data: 'timeString'
    }, { /*Duration*/
      width: '1%',
      data: 'durationString'
    }, { /*Video*/
      width: '1%',
      data: null,
      render: returnEmptyString,
      createdCell: (td, cellData, rowData, row, col) => {
        $(td).append(createVideoActionButton(rowData));
      }
    }],
    language: {
      emptyTable: 'Keine Einträge vorhanden'
    },
    searching: false,
    ordering: false,
    info: false,
    paging: false,
    scrollX: true
  });

  $('#rssFeedButton').click(() => {
    const search = window.location.hash.replace('#', '');
    window.open(window.location.origin + window.location.pathname + 'feed' + (search.length > 0 ? '?' : '') + search, '_blank');
    track('feed-create');
  });

  const newQuery = () => {
    currentPage = 0;
    query();
  };

  $('th[data-onclick-sort]').on('click', (e) => {
    const sort = $(e.target).attr("data-onclick-sort");
    if (sort === sortBy && sortOrder) {
      sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      sortBy = sort;
      sortOrder = sort === 'timestamp' ? 'desc' : 'asc';
    }
    $(e.target).parent().attr("data-sort", sortBy + '-' + sortOrder);
    newQuery();
  });

  $('#queryInput').on('input', () => {
    const currentQueryString = getQueryString();

    if (currentQueryString != lastQueryString) {
      newQuery();
      lastQueryString = currentQueryString;
    }

    const clearButton = $('#queryInputClearButton');
    if (currentQueryString.length == 0 && queryInputClearButtonState == 'shown') {
      clearButton.animate({
        opacity: 0
      }, {
        easing: 'swing',
        duration: 20
      });
      queryInputClearButtonState = 'hidden';
    } else if (currentQueryString.length > 0 && queryInputClearButtonState == 'hidden') {
      clearButton.animate({
        opacity: 1
      }, {
        easing: 'swing',
        duration: 20
      });
      queryInputClearButtonState = 'shown';
    }
  });
  $('#queryParameters input:radio').change(() => newQuery());
  $('#queryParameters input:checkbox').change(() => newQuery());

  $('#videocloseButton').click(() => {
    closeVideo();
  });

  $('#videooverlay').keydown((e) => {
    if (e.key == 'Escape' || e.keyCode == 27) {
      if (isFullscreen()) {
        exitFullscreen();
      } else {
        closeVideo();
      }
      e.preventDefault();
    }
  });

  $('#queryInputClearButton').click(function () {
    $('#queryInput').val('').trigger('input').focus();
  });

  $('#contactButton').click(() => openContactsModal());
  $('#githubButton').click(() => track('github'));
  $('#forumButton').click(() => track('forum'));

  $('#logo').click(() => {
    $('#generic-html-view').hide(250);
    $('#main-view').show(250);

    return false;
  });

  $('#donateButton').click(() => {
    track('donate');

    $('#main-view').hide(250);
    $('#generic-html-view').show(250);

    if (donate == null) {
      socket.emit('getDonate', (response) => {
        donate = response;
        $('#genericHtmlContent').html(response);
      });
    } else {
      $('#genericHtmlContent').html(donate);
    }

    return false;
  });

  $('#datenschutzButton').click(() => {
    track('datenschutz');

    $('#main-view').hide(250);
    $('#generic-html-view').show(250);

    if (datenschutz == null) {
      socket.emit('getDatenschutz', (response) => {
        datenschutz = response;
        $('#genericHtmlContent').html(response);
      });
    } else {
      $('#genericHtmlContent').html(datenschutz);
    }

    return false;
  });

  $('#impressumButton').click(() => {
    track('impressum');

    $('#main-view').hide(250);
    $('#generic-html-view').show(250);

    if (impressum == null) {
      socket.emit('getImpressum', (response) => {
        impressum = response;
        $('#genericHtmlContent').html(response);
      });
    } else {
      $('#genericHtmlContent').html(impressum);
    }

    return false;
  });

  $('#genericHtmlViewBackButton').click(() => {
    $('#generic-html-view').hide(250);
    $('#main-view').show(250);
  });

  window.addEventListener("hashchange", () => {
    if (!ignoreNextHashChange) {
      setQueryFromURIHash();
      query();
    } else {
      ignoreNextHashChange = false;
    }
  }, false);

  $('#searchSpan').popover();

  $('[data-onclick-return-false]').click(() => {
    return false;
  });

  $('#helpButton').click(() => {
    window.open('https://github.com/mediathekview/mediathekviewweb/blob/master/README.md', '_blank');
  });

  setQueryFromURIHash();
  query();
});
