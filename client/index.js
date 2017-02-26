var socket = io();
var currentPage = 0;
var itemsPerPage = 15;
var mediathekTable;
var connectingModal;
var contactModal;
var indexingModal;
var uid;
var pv_id = randomString(6);
var playingInterval;
var lastQueryString = null;
var ignoreNextHashChange = false;
var impressum = null;
var datenschutz = null;
var donate = null;
var queryInputClearButtonState = 'hidden';
var video;

XMLHttpRequest.prototype.baseOpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
    if (url.startsWith('http://srfvodhd-vh.akamaihd.net')) {
        url = 'https' + url.slice(4);
    }

    this.baseOpen(method, url, async, user, password);
}

function isWDR(url) {
    let regex = /http:\/\/adaptiv\.wdr\.de\/i\/medp\/(ww|de)\/(\w+?)\/(\w+?)\/(\w+?)\/,([\d_,]*?),\.mp4.csmil/;

    return regex.test(url);
}

function WDRm3u8ToMP4s(url) {
    let regex = /http:\/\/adaptiv\.wdr\.de\/i\/medp\/(ww|de)\/(\w+?)\/(\w+?)\/(\w+?)\/,([\d_,]*?),\.mp4.csmil/;
    let match = regex.exec(url);

    if (match == null) {
        return url;
    }

    let qualities = match[5].split(',');
    let mp4s = [];

    for (var i = 0; i < qualities.length; i++) {
        mp4s.push(`http://ondemand-${match[1]}.wdr.de/medp/${match[2]}/${match[3]}/${match[4]}/${qualities[i]}.mp4`);
    }

    return mp4s;
}

/*polyfill for stupid internet explorer*/
if (!String.prototype.endsWith) {
    String.prototype.endsWith = function(searchString, position) {
        var subjectString = this.toString();
        if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
            position = subjectString.length;
        }
        position -= searchString.length;
        var lastIndex = subjectString.indexOf(searchString, position);
        return lastIndex !== -1 && lastIndex === position;
    };
}

var locale = window.navigator.userLanguage || window.navigator.language;
moment.locale(locale);

Number.prototype.pad = function(size) {
    var s = String(this);
    while (s.length < (size || 2)) {
        s = "0" + s;
    }
    return s;
}

function modalIsOpen(modalDOM) {
    return (modalDOM.data('bs.modal') || {}).isShown;
}

function randomString(len) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < len; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function formatBytes(bytes, decimals) {
    if (!(parseInt(bytes) >= 0)) return '?';
    else if (bytes == 0) return '0 Byte';

    var k = 1000;
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

function parseQuery(query) {
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

function track(action) {
    let date = new Date();
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

if (typeof(Storage) !== "undefined" && localStorage != null) {
    uid = localStorage.getItem('uid');
}
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
        if (typeof(Storage) !== "undefined" && localStorage != null) {
            localStorage.setItem('uid', _uid);
        }
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
    let parsingProgress = (state.parserProgress * 100).toFixed(0);
    let indexingProgress = (state.indexingProgress * 100).toFixed(0);
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

function trackQuery() {
    trackQuery = _.debounce(() => {
        track('query');
    }, 2000);
    trackQuery();
}

function getQueryString() {
    return $('#queryInput').val().trim();
}

function setQueryFromURIHash() {
    let props = parseURIHash(window.location.hash);

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

    if (props['future'] === 'true') {
        $('#futureCheckbox').prop('checked', true);
    } else {
        $('#futureCheckbox').prop('checked', false);
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

    let props = hash.split('&');
    let elements = {};

    for (let i = 0; i < props.length; i++) {
        let element = props[i].split('=');
        elements[element[0]] = decodeURIComponent(element[1]);
    }

    return elements;
}

function createURIHash(elements) {
    let props = [];

    for (let prop in elements) {
        props.push(prop + '=' + encodeURIComponent(elements[prop].toString()));
    }

    return props.join('&');
}

function query() {
    query = _.throttle(() => {
        let queryString = getQueryString();
        let future = !!$('#futureCheckbox').prop('checked');
        let everywhere = !!$('#everywhereCheckbox').prop('checked');
        currentPage = Math.min(currentPage, Math.floor(10000 / itemsPerPage - 1));

        let elements = {};

        if (queryString.length > 0) {
            elements['query'] = queryString;
        }
        if (everywhere === true) {
            elements['everywhere'] = true;
        }
        if (future === true) {
            elements['future'] = true;
        }
        if (currentPage > 0) {
            elements['page'] = currentPage + 1;
        }

        let oldHash = window.location.hash;
        if (oldHash[0] == '#') {
            oldHash = oldHash.slice(1);
        }

        let newHash = createURIHash(elements);

        if (oldHash !== newHash) {
            ignoreNextHashChange = true;
            window.location.hash = newHash;
        }

        let parsedQuery = parseQuery(queryString);
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
                fields: everywhere ? ['channel', 'topic', 'title', 'description'] : ((parsedQuery.topics.length == 0) ? ['topic', 'title'] : ['title']),
                query: parsedQuery.generics.join(' ')
            });
        }

        let queryObj = {
            queries: queries,
            sortBy: 'timestamp',
            sortOrder: 'desc',
            future: future,
            offset: currentPage * itemsPerPage,
            size: itemsPerPage
        };

        socket.emit('queryEntries', queryObj, (message) => {
            handleQueryResult(message.result, message.err);
        });

        trackQuery();
    }, 250);
    query();
}

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

    for (var i = 0; i < result.results.length; i++) {
        let data = result.results[i];

        if (isWDR(data.url_video)) {
            let mp4s = WDRm3u8ToMP4s(data.url_video);

            data.url_video_low = mp4s[0];
            data.url_video = mp4s[1];
            data.url_video_hd = mp4s[2];
        }

        if (data.timestamp == 0) {
            data.dateString = data.timeString = '?';
        } else {
            data.dateString = moment.unix(data.timestamp).format('DD.MM.YYYY');
            data.timeString = moment.unix(data.timestamp).format('HH:mm');
        }

        let durationMoment = moment.duration(data.duration, 'seconds');
        let minutes = (durationMoment.hours() * 60 + durationMoment.minutes()).pad(2);
        let seconds = durationMoment.seconds().pad(2);
        data.durationString = isNaN(data.duration) ? '?' : (minutes + ':' + seconds);

        mediathekTable.row.add(data);
    }

    mediathekTable.draw();

    let actualPagesCount = Math.ceil(result.queryInfo.totalResults / itemsPerPage);
    let shownPagesCount = Math.min(actualPagesCount, Math.floor(10000 / itemsPerPage));

    createPagination(shownPagesCount);

    let filmlisteMoment = moment.unix(result.queryInfo.filmlisteTimestamp);

    $('#queryInfoLabel').html('Die Suchmaschine brauchte ' + result.queryInfo.searchEngineTime.toString().replace('.', ',') + ' ms. Zeige Treffer ' + Math.min(result.queryInfo.totalResults, (currentPage * itemsPerPage + 1)) +
        ' bis ' + Math.min(result.queryInfo.totalResults, ((currentPage + 1) * itemsPerPage)) + ' von insgesamt ' + result.queryInfo.totalResults + ' Treffern.</br>Filmliste zuletzt um ' + filmlisteMoment.format('HH:mm') + ' Uhr aktualisiert.');
}

function createPaginationButton(html, active, enabled, callback) {
    let button = $('<li>').addClass(active ? 'active' : '').addClass(enabled ? '' : 'disabled').append($('<a>', {
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
    let pagination = $('#pagination');
    pagination.empty();

    let backButton = createPaginationButton('<i class="material-icons" style="margin: -6px;">arrow_left</i>', false, currentPage > 0, () => {
        currentPage--;
    });
    pagination.append(backButton);

    let pagingBegin = Math.max(0, currentPage - 2 - (2 - Math.min(2, totalPages - (currentPage + 1))));
    let pagingEnd = Math.min(totalPages, pagingBegin + 5);

    for (let i = pagingBegin; i < pagingEnd; i++) {
        let button = createPaginationButton(i + 1, currentPage == i, true, () => {
            currentPage = i;
        });
        pagination.append(button);
    }

    let nextButton = createPaginationButton('<i class="material-icons" style="margin: -6px">arrow_right</i>', false, currentPage < (totalPages - 1), () => {
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

function createSubtitleRow(text, url, filename, filesize) {
    let tableRow = $('<tr>');

    let downloadButton = $('<a>', {
        target: '_blank',
        href: url,
        download: filename
    });

    downloadButton.click(() => track('download-subtitle'));

    let downloadIcon = $('<i>').addClass('material-icons floatRight').text('save');
    downloadButton.append(downloadIcon);

    let filesizeCell = $('<td>').text((isNaN(filesize) || !filesize) ? '?' : formatBytes(filesize, 2));

    tableRow.append($('<td>').text(text));
    tableRow.append(filesizeCell);
    tableRow.append($('<td>').append(downloadButton));

    return tableRow;
}

function createVideoRow(text, url, videoTitle, filename, filesize) {
    let tableRow = $('<tr>');

    let watchButton = $('<a>', {
        target: '_blank',
        href: url,
        click: () => {
            playVideo(videoTitle, url);
            return false;
        }
    });

    let watchIcon = $('<i>').addClass('material-icons floatLeft').text('ondemand_video');
    watchButton.append(watchIcon);

    let downloadButton = $('<a>', {
        target: '_blank',
        href: url,
        download: filename
    });

    downloadButton.click(() => track('download-video'));

    let downloadIcon = $('<i>').addClass('material-icons floatRight').text('save');
    downloadButton.append(downloadIcon);

    let filesizeCell = $('<td>').text((isNaN(filesize) || !filesize) ? '?' : formatBytes(filesize, 2)).addClass('filesizeCell');

    tableRow.append($('<td>').text(text));
    tableRow.append(filesizeCell);
    tableRow.append($('<td>').append($('<div>').append(watchButton).append(downloadButton).addClass('watchDownloadField')));

    return tableRow;
}

function hidePopoverIfNotHovered(button, callback) {
    setTimeout(() => {
        let popoverID = button.attr('aria-describedby');
        let popover = $('#' + popoverID);
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
    let description = null;

    let icon = $('<i>').addClass('material-icons').text('expand_more');
    let popoverContent = $('<div>').html('<i class="material-icons spin-right" style="display: inline-flex; vertical-align: middle; font-size: 2.5em;">autorenew</i> <span style="font-size:1.2em; vertical-align: middle;">Laden...</span>');

    let button = $('<a>', {
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
        toggle: 'popover',
        placement: 'auto right',
        container: '#blur',
        template: '<div class="popover" role="tooltip"><h3 class="popover-title"></h3><div class="popover-content"></div></div>',
        content: popoverContent,
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
    let highestQualityUrl = entry.url_video_hd ? entry.url_video_hd : (entry.url_video ? entry.url_video : entry.url_video_low);

    let button = $('<a>', {
        target: '_blank',
        href: entry.url_video,
        click: () => {
            if (!button.clicked) {
                button.clicked = true;
                button.addClass('text-warning');
                button.children().first().addClass('icon-big');
            } else {
                playVideo(entry.title, highestQualityUrl);
            }

            return false;
        }
    });

    let icon = $('<i>').addClass('material-icons movie-icon').text('movie');
    button.append(icon);

    let table = $('<table>').addClass('table-condensed');
    table.append(`<thead>
          <tr>
            <th>Qualität</th>
            <th>Größe</th>
            <th>Aktion</th>
          </tr>
        </thead>`);


    let tableHead = $('<thead>');
    let tableBody = $('<tbody>');

    let filenamebase = entry.channel + ' - ' + entry.topic + ' - ' + entry.title + ' - ' + moment.unix(entry.timestamp).format('DD.MM.YYYY HH:mm');

    let lowRow, midRow, highRow, subtitleRow;

    if (entry.url_video_hd) {
        highRow = createVideoRow('Hoch', entry.url_video_hd, entry.title, filenamebase + entry.url_video_hd.split('.').pop());
        tableBody.append(highRow);
    }
    if (entry.url_video) {
        midRow = createVideoRow('Mittel', entry.url_video, entry.title, filenamebase + entry.url_video.split('.').pop(), entry.size);
        tableBody.append(midRow);
    }
    if (entry.url_video_low) {
        lowRow = createVideoRow('Niedrig', entry.url_video_low, entry.title, filenamebase + entry.url_video_low.split('.').pop());
        tableBody.append(lowRow);
    }
    if (entry.url_subtitle) {
        subtitleRow = createSubtitleRow('UT', entry.url_subtitle, filenamebase + entry.url_subtitle.split('.').pop());
        tableBody.append(subtitleRow);
    }

    table.append(tableBody);

    button.popover({
        trigger: 'manual',
        toggle: 'popover',
        placement: 'auto right',
        container: '#blur',
        content: table,
        html: true,
        animation: true
    });

    let requestedFilesize = false;

    button.on('mouseenter', () => {
        button.popover('show');
        let popoverID = button.attr('aria-describedby');
        let popover = $('#' + popoverID);
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
    if (document.fullscreenElement) {
        return true;
    } else if (document.webkitFullscreenElement) {
        return true;
    } else if (document.mozFullScreenElement) {
        return true;
    } else if (document.msFullscreenElement) {
        return true;
    } else {
        return false;
    };
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
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
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

function playVideo(title, url) {
    $('#videooverlay').show(200, () => {
        $('#blur').addClass('blur');

        let vid = $('<video>', {
            class: 'video-js vjs-default-skin vjs-big-play-centered vjs-16-9',
            id: 'video-player',
            preload: 'auto',
            controls: '',
            width: '100%'
        });
        let source = $('<source>', {
            src: url
        });
        if (url.endsWith('m3u8')) {
            source.attr('type', 'application/x-mpegURL');
        }
        vid.append(source);

        $('#videocontent').append(vid);

        video = videojs('video-player', {});

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
}

function closeVideo() {
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

$(() => {
    $('#browserWarning').remove();

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

    socket.on('connect', () => {
        connectingModal.modal('hide');
    });

    socket.on('disconnect', () => {
        indexingModal.modal('hide');
        if (!modalIsOpen(connectingModal)) {
            connectingModal.modal('show');
        }
    });

    if (socket.disconnected) {
        if (!modalIsOpen(connectingModal)) {
            connectingModal.modal('show');
        }
    }

    mediathekTable = $('#mediathek').DataTable({
        columns: [{ /*Sender*/
            width: '1%',
            data: null,
            render: returnEmptyString,
            createdCell: (td, cellData, rowData, row, col) => {
                let link = $('<a>', {
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
            url: '/static/dataTables.german.lang'
        },
        searching: false,
        ordering: false,
        info: false,
        paging: false,
        scrollX: true
    });

    $('#rssFeedButton').click(() => {
        let search = window.location.hash.replace('#', '');
        window.open(window.location.origin + window.location.pathname + 'feed' + (search.length > 0 ? '?' : '') + search, '_blank');
        track('feed-create');
    });

    let newQuery = () => {
        currentPage = 0;
        query();
    };

    $('#queryInput').on('input', () => {
        let currentQueryString = getQueryString();

        if (currentQueryString != lastQueryString) {
            newQuery();
            lastQueryString = currentQueryString;
        }

        let clearButton = $('#queryInputClearButton');
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
        } else if (e.key === ' ' || e.keyCode == 32) { /*32 = Space*/
            toggleVideoPause();
            e.preventDefault();
        }
    });

    $('#queryInputClearButton').click(function() {
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

    setQueryFromURIHash();
    query();
});
