import {ParseStream, LineStream, Parser} from '../src';
import QUnit from 'qunit';
import testDataExpected from './test-expected.js';
import testDataManifests from './test-manifests.js';

QUnit.module('LineStream', {
  beforeEach() {
    this.lineStream = new LineStream();
  }
});
QUnit.test('empty inputs produce no tokens', function() {
  let data = false;

  this.lineStream.on('data', function() {
    data = true;
  });
  this.lineStream.push('');
  QUnit.ok(!data, 'no tokens were produced');
});
QUnit.test('splits on newlines', function() {
  const lines = [];

  this.lineStream.on('data', function(line) {
    lines.push(line);
  });
  this.lineStream.push('#EXTM3U\nmovie.ts\n');

  QUnit.strictEqual(2, lines.length, 'two lines are ready');
  QUnit.strictEqual('#EXTM3U', lines.shift(), 'the first line is the first token');
  QUnit.strictEqual('movie.ts', lines.shift(), 'the second line is the second token');
});
QUnit.test('empty lines become empty strings', function() {
  const lines = [];

  this.lineStream.on('data', function(line) {
    lines.push(line);
  });
  this.lineStream.push('\n\n');

  QUnit.strictEqual(2, lines.length, 'two lines are ready');
  QUnit.strictEqual('', lines.shift(), 'the first line is empty');
  QUnit.strictEqual('', lines.shift(), 'the second line is empty');
});
QUnit.test('handles lines broken across appends', function() {
  const lines = [];

  this.lineStream.on('data', function(line) {
    lines.push(line);
  });
  this.lineStream.push('#EXTM');
  QUnit.strictEqual(0, lines.length, 'no lines are ready');

  this.lineStream.push('3U\nmovie.ts\n');
  QUnit.strictEqual(2, lines.length, 'two lines are ready');
  QUnit.strictEqual('#EXTM3U', lines.shift(), 'the first line is the first token');
  QUnit.strictEqual('movie.ts', lines.shift(), 'the second line is the second token');
});
QUnit.test('stops sending events after deregistering', function() {
  const temporaryLines = [];
  const temporary = function(line) {
    temporaryLines.push(line);
  };
  const permanentLines = [];
  const permanent = function(line) {
    permanentLines.push(line);
  };

  this.lineStream.on('data', temporary);
  this.lineStream.on('data', permanent);
  this.lineStream.push('line one\n');
  QUnit.strictEqual(temporaryLines.length,
                    permanentLines.length,
                    'both callbacks receive the event');

  QUnit.ok(this.lineStream.off('data', temporary), 'a listener was removed');
  this.lineStream.push('line two\n');
  QUnit.strictEqual(1, temporaryLines.length, 'no new events are received');
  QUnit.strictEqual(2, permanentLines.length, 'new events are still received');
});

QUnit.module('ParseStream', {
  beforeEach() {
    this.lineStream = new LineStream();
    this.parseStream = new ParseStream();
    this.lineStream.pipe(this.parseStream);
  }
});
QUnit.test('parses comment lines', function() {
  const manifest = '# a line that starts with a hash mark without "EXT" is a comment\n';
  let element;

  this.parseStream.on('data', function(elem) {
    element = elem;
  });
  this.lineStream.push(manifest);

  QUnit.ok(element, 'an event was triggered');
  QUnit.strictEqual(element.type, 'comment', 'the type is comment');
  QUnit.strictEqual(element.text,
                    manifest.slice(1, manifest.length - 1),
                    'the comment text is parsed');
});
QUnit.test('parses uri lines', function() {
  const manifest = 'any non-blank line that does not start with a hash-mark is a URI\n';
  let element;

  this.parseStream.on('data', function(elem) {
    element = elem;
  });
  this.lineStream.push(manifest);

  QUnit.ok(element, 'an event was triggered');
  QUnit.strictEqual(element.type, 'uri', 'the type is uri');
  QUnit.strictEqual(element.uri,
                    manifest.substring(0, manifest.length - 1),
                    'the uri text is parsed');
});
QUnit.test('parses unknown tag types', function() {
  const manifest = '#EXT-X-EXAMPLE-TAG:some,additional,stuff\n';
  let element;

  this.parseStream.on('data', function(elem) {
    element = elem;
  });
  this.lineStream.push(manifest);

  QUnit.ok(element, 'an event was triggered');
  QUnit.strictEqual(element.type, 'tag', 'the type is tag');
  QUnit.strictEqual(element.data,
                    manifest.slice(4, manifest.length - 1),
                    'unknown tag data is preserved');
});

// #EXTM3U
QUnit.test('parses #EXTM3U tags', function() {
  const manifest = '#EXTM3U\n';
  let element;

  this.parseStream.on('data', function(elem) {
    element = elem;
  });
  this.lineStream.push(manifest);

  QUnit.ok(element, 'an event was triggered');
  QUnit.strictEqual(element.type, 'tag', 'the line type is tag');
  QUnit.strictEqual(element.tagType, 'm3u', 'the tag type is m3u');
});

// #EXTINF
QUnit.test('parses minimal #EXTINF tags', function() {
  const manifest = '#EXTINF\n';
  let element;

  this.parseStream.on('data', function(elem) {
    element = elem;
  });
  this.lineStream.push(manifest);

  QUnit.ok(element, 'an event was triggered');
  QUnit.strictEqual(element.type, 'tag', 'the line type is tag');
  QUnit.strictEqual(element.tagType, 'inf', 'the tag type is inf');
});
QUnit.test('parses #EXTINF tags with durations', function() {
  let manifest = '#EXTINF:15\n';
  let element;

  this.parseStream.on('data', function(elem) {
    element = elem;
  });
  this.lineStream.push(manifest);

  QUnit.ok(element, 'an event was triggered');
  QUnit.strictEqual(element.type, 'tag', 'the line type is tag');
  QUnit.strictEqual(element.tagType, 'inf', 'the tag type is inf');
  QUnit.strictEqual(element.duration, 15, 'the duration is parsed');
  QUnit.ok(!('title' in element), 'no title is parsed');

  manifest = '#EXTINF:21,\n';
  this.lineStream.push(manifest);

  QUnit.ok(element, 'an event was triggered');
  QUnit.strictEqual(element.type, 'tag', 'the line type is tag');
  QUnit.strictEqual(element.tagType, 'inf', 'the tag type is inf');
  QUnit.strictEqual(element.duration, 21, 'the duration is parsed');
  QUnit.ok(!('title' in element), 'no title is parsed');
});
QUnit.test('parses #EXTINF tags with a duration and title', function() {
  const manifest = '#EXTINF:13,Does anyone really use the title attribute?\n';
  let element;

  this.parseStream.on('data', function(elem) {
    element = elem;
  });
  this.lineStream.push(manifest);

  QUnit.ok(element, 'an event was triggered');
  QUnit.strictEqual(element.type, 'tag', 'the line type is tag');
  QUnit.strictEqual(element.tagType, 'inf', 'the tag type is inf');
  QUnit.strictEqual(element.duration, 13, 'the duration is parsed');
  QUnit.strictEqual(element.title,
                    manifest.substring(manifest.indexOf(',') + 1, manifest.length - 1),
                    'the title is parsed');
});
QUnit.test('parses #EXTINF tags with carriage returns', function() {
  const manifest = '#EXTINF:13,Does anyone really use the title attribute?\r\n';
  let element;

  this.parseStream.on('data', function(elem) {
    element = elem;
  });
  this.lineStream.push(manifest);

  QUnit.ok(element, 'an event was triggered');
  QUnit.strictEqual(element.type, 'tag', 'the line type is tag');
  QUnit.strictEqual(element.tagType, 'inf', 'the tag type is inf');
  QUnit.strictEqual(element.duration, 13, 'the duration is parsed');
  QUnit.strictEqual(element.title,
                    manifest.substring(manifest.indexOf(',') + 1, manifest.length - 2),
                    'the title is parsed');
});

// #EXT-X-TARGETDURATION
QUnit.test('parses minimal #EXT-X-TARGETDURATION tags', function() {
  const manifest = '#EXT-X-TARGETDURATION\n';
  let element;

  this.parseStream.on('data', function(elem) {
    element = elem;
  });
  this.lineStream.push(manifest);

  QUnit.ok(element, 'an event was triggered');
  QUnit.strictEqual(element.type, 'tag', 'the line type is tag');
  QUnit.strictEqual(element.tagType, 'targetduration', 'the tag type is targetduration');
  QUnit.ok(!('duration' in element), 'no duration is parsed');
});
QUnit.test('parses #EXT-X-TARGETDURATION with duration', function() {
  const manifest = '#EXT-X-TARGETDURATION:47\n';
  let element;

  this.parseStream.on('data', function(elem) {
    element = elem;
  });
  this.lineStream.push(manifest);

  QUnit.ok(element, 'an event was triggered');
  QUnit.strictEqual(element.type, 'tag', 'the line type is tag');
  QUnit.strictEqual(element.tagType, 'targetduration', 'the tag type is targetduration');
  QUnit.strictEqual(element.duration, 47, 'the duration is parsed');
});

// #EXT-X-VERSION
QUnit.test('parses minimal #EXT-X-VERSION tags', function() {
  const manifest = '#EXT-X-VERSION:\n';
  let element;

  this.parseStream.on('data', function(elem) {
    element = elem;
  });
  this.lineStream.push(manifest);

  QUnit.ok(element, 'an event was triggered');
  QUnit.strictEqual(element.type, 'tag', 'the line type is tag');
  QUnit.strictEqual(element.tagType, 'version', 'the tag type is version');
  QUnit.ok(!('version' in element), 'no version is present');
});
QUnit.test('parses #EXT-X-VERSION with a version', function() {
  const manifest = '#EXT-X-VERSION:99\n';
  let element;

  this.parseStream.on('data', function(elem) {
    element = elem;
  });
  this.lineStream.push(manifest);

  QUnit.ok(element, 'an event was triggered');
  QUnit.strictEqual(element.type, 'tag', 'the line type is tag');
  QUnit.strictEqual(element.tagType, 'version', 'the tag type is version');
  QUnit.strictEqual(element.version, 99, 'the version is parsed');
});

// #EXT-X-MEDIA-SEQUENCE
QUnit.test('parses minimal #EXT-X-MEDIA-SEQUENCE tags', function() {
  const manifest = '#EXT-X-MEDIA-SEQUENCE\n';
  let element;

  this.parseStream.on('data', function(elem) {
    element = elem;
  });
  this.lineStream.push(manifest);

  QUnit.ok(element, 'an event was triggered');
  QUnit.strictEqual(element.type, 'tag', 'the line type is tag');
  QUnit.strictEqual(element.tagType, 'media-sequence', 'the tag type is media-sequence');
  QUnit.ok(!('number' in element), 'no number is present');
});
QUnit.test('parses #EXT-X-MEDIA-SEQUENCE with sequence numbers', function() {
  const manifest = '#EXT-X-MEDIA-SEQUENCE:109\n';
  let element;

  this.parseStream.on('data', function(elem) {
    element = elem;
  });
  this.lineStream.push(manifest);

  QUnit.ok(element, 'an event was triggered');
  QUnit.strictEqual(element.type, 'tag', 'the line type is tag');
  QUnit.strictEqual(element.tagType, 'media-sequence', 'the tag type is media-sequence');
  QUnit.ok(element.number, 109, 'the number is parsed');
});

// #EXT-X-PLAYLIST-TYPE
QUnit.test('parses minimal #EXT-X-PLAYLIST-TYPE tags', function() {
  const manifest = '#EXT-X-PLAYLIST-TYPE:\n';
  let element;

  this.parseStream.on('data', function(elem) {
    element = elem;
  });
  this.lineStream.push(manifest);

  QUnit.ok(element, 'an event was triggered');
  QUnit.strictEqual(element.type, 'tag', 'the line type is tag');
  QUnit.strictEqual(element.tagType, 'playlist-type', 'the tag type is playlist-type');
  QUnit.ok(!('playlistType' in element), 'no playlist type is present');
});
QUnit.test('parses #EXT-X-PLAYLIST-TYPE with mutability info', function() {
  let manifest = '#EXT-X-PLAYLIST-TYPE:EVENT\n';
  let element;

  this.parseStream.on('data', function(elem) {
    element = elem;
  });
  this.lineStream.push(manifest);

  QUnit.ok(element, 'an event was triggered');
  QUnit.strictEqual(element.type, 'tag', 'the line type is tag');
  QUnit.strictEqual(element.tagType, 'playlist-type', 'the tag type is playlist-type');
  QUnit.strictEqual(element.playlistType, 'EVENT', 'the playlist type is EVENT');

  manifest = '#EXT-X-PLAYLIST-TYPE:VOD\n';
  this.lineStream.push(manifest);
  QUnit.ok(element, 'an event was triggered');
  QUnit.strictEqual(element.type, 'tag', 'the line type is tag');
  QUnit.strictEqual(element.tagType, 'playlist-type', 'the tag type is playlist-type');
  QUnit.strictEqual(element.playlistType, 'VOD', 'the playlist type is VOD');

  manifest = '#EXT-X-PLAYLIST-TYPE:nonsense\n';
  this.lineStream.push(manifest);
  QUnit.ok(element, 'an event was triggered');
  QUnit.strictEqual(element.type, 'tag', 'the line type is tag');
  QUnit.strictEqual(element.tagType, 'playlist-type', 'the tag type is playlist-type');
  QUnit.strictEqual(element.playlistType, 'nonsense', 'the playlist type is parsed');
});

// #EXT-X-BYTERANGE
QUnit.test('parses minimal #EXT-X-BYTERANGE tags', function() {
  const manifest = '#EXT-X-BYTERANGE\n';
  let element;

  this.parseStream.on('data', function(elem) {
    element = elem;
  });
  this.lineStream.push(manifest);

  QUnit.ok(element, 'an event was triggered');
  QUnit.strictEqual(element.type, 'tag', 'the line type is tag');
  QUnit.strictEqual(element.tagType, 'byterange', 'the tag type is byterange');
  QUnit.ok(!('length' in element), 'no length is present');
  QUnit.ok(!('offset' in element), 'no offset is present');
});
QUnit.test('parses #EXT-X-BYTERANGE with length and offset', function() {
  let manifest = '#EXT-X-BYTERANGE:45\n';
  let element;

  this.parseStream.on('data', function(elem) {
    element = elem;
  });
  this.lineStream.push(manifest);

  QUnit.ok(element, 'an event was triggered');
  QUnit.strictEqual(element.type, 'tag', 'the line type is tag');
  QUnit.strictEqual(element.tagType, 'byterange', 'the tag type is byterange');
  QUnit.strictEqual(element.length, 45, 'length is parsed');
  QUnit.ok(!('offset' in element), 'no offset is present');

  manifest = '#EXT-X-BYTERANGE:108@16\n';
  this.lineStream.push(manifest);
  QUnit.ok(element, 'an event was triggered');
  QUnit.strictEqual(element.type, 'tag', 'the line type is tag');
  QUnit.strictEqual(element.tagType, 'byterange', 'the tag type is byterange');
  QUnit.strictEqual(element.length, 108, 'length is parsed');
  QUnit.strictEqual(element.offset, 16, 'offset is parsed');
});

// #EXT-X-ALLOW-CACHE
QUnit.test('parses minimal #EXT-X-ALLOW-CACHE tags', function() {
  const manifest = '#EXT-X-ALLOW-CACHE:\n';
  let element;

  this.parseStream.on('data', function(elem) {
    element = elem;
  });
  this.lineStream.push(manifest);

  QUnit.ok(element, 'an event was triggered');
  QUnit.strictEqual(element.type, 'tag', 'the line type is tag');
  QUnit.strictEqual(element.tagType, 'allow-cache', 'the tag type is allow-cache');
  QUnit.ok(!('allowed' in element), 'no allowed is present');
});
QUnit.test('parses valid #EXT-X-ALLOW-CACHE tags', function() {
  let manifest = '#EXT-X-ALLOW-CACHE:YES\n';
  let element;

  this.parseStream.on('data', function(elem) {
    element = elem;
  });
  this.lineStream.push(manifest);

  QUnit.ok(element, 'an event was triggered');
  QUnit.strictEqual(element.type, 'tag', 'the line type is tag');
  QUnit.strictEqual(element.tagType, 'allow-cache', 'the tag type is allow-cache');
  QUnit.ok(element.allowed, 'allowed is parsed');

  manifest = '#EXT-X-ALLOW-CACHE:NO\n';
  this.lineStream.push(manifest);

  QUnit.ok(element, 'an event was triggered');
  QUnit.strictEqual(element.type, 'tag', 'the line type is tag');
  QUnit.strictEqual(element.tagType, 'allow-cache', 'the tag type is allow-cache');
  QUnit.ok(!element.allowed, 'allowed is parsed');
});
// #EXT-X-MAP
QUnit.test('parses minimal #EXT-X-MAP tags', function() {
  const manifest = '#EXT-X-MAP:URI="init.m4s"\n';
  let element;

  this.parseStream.on('data', function(elem) {
    element = elem;
  });

  this.lineStream.push(manifest);
  QUnit.ok(element, 'an event was triggered');
  QUnit.strictEqual(element.type, 'tag', 'the line type is tag');
  QUnit.strictEqual(element.tagType, 'map', 'the tag type is map');
  QUnit.strictEqual(element.uri, 'init.m4s', 'parsed the uri');
});
QUnit.test('parses #EXT-X-MAP tags with a byterange', function() {
  const manifest = '#EXT-X-MAP:URI="0.m4s", BYTERANGE="1000@23"\n';
  let element;

  this.parseStream.on('data', function(elem) {
    element = elem;
  });

  this.lineStream.push(manifest);
  QUnit.ok(element, 'an event was triggered');
  QUnit.strictEqual(element.uri, '0.m4s', 'parsed the uri');
  QUnit.strictEqual(element.byterange.length,
                    1000,
                    'parsed the byterange length');
  QUnit.strictEqual(element.byterange.offset,
                    23,
                    'parsed the byterange offset');
});
QUnit.test('parses #EXT-X-MAP tags with arbitrary attributes', function() {
  const manifest = '#EXT-X-MAP:URI="init.mp4", SOMETHING=YES,BYTERANGE="720@0"\n';
  let element;

  this.parseStream.on('data', function(elem) {
    element = elem;
  });

  this.lineStream.push(manifest);
  QUnit.ok(element, 'an event was triggered');
  QUnit.strictEqual(element.uri, 'init.mp4', 'parsed the uri');
  QUnit.strictEqual(element.byterange.length,
                    720,
                    'parsed the byterange length');
  QUnit.strictEqual(element.byterange.offset,
                    0,
                    'parsed the byterange offset');
});
// #EXT-X-STREAM-INF
QUnit.test('parses minimal #EXT-X-STREAM-INF tags', function() {
  const manifest = '#EXT-X-STREAM-INF\n';
  let element;

  this.parseStream.on('data', function(elem) {
    element = elem;
  });
  this.lineStream.push(manifest);

  QUnit.ok(element, 'an event was triggered');
  QUnit.strictEqual(element.type, 'tag', 'the line type is tag');
  QUnit.strictEqual(element.tagType, 'stream-inf', 'the tag type is stream-inf');
  QUnit.ok(!('attributes' in element), 'no attributes are present');
});
// #EXT-X-PROGRAM-DATE-TIME
QUnit.test('parses minimal EXT-X-PROGRAM-DATE-TIME tags', function() {
  const manifest = '#EXT-X-PROGRAM-DATE-TIME\n';
  let element;

  this.parseStream.on('data', function(elem) {
    element = elem;
  });
  this.lineStream.push(manifest);

  QUnit.ok(element, 'an event was triggered');
  QUnit.strictEqual(element.type, 'tag', 'the line type is tag');
  QUnit.strictEqual(element.tagType, 'program-date-time', 'the tag type is date-time');
  QUnit.ok(!('dateTimeString' in element), 'no dateTime is present');
});
QUnit.test('parses EXT-X-PROGRAM-DATE-TIME tags with valid date-time formats',
  function() {
    let manifest = '#EXT-X-PROGRAM-DATE-TIME:2016-06-22T09:20:16.166-04:00\n';
    let element;

    this.parseStream.on('data', function(elem) {
      element = elem;
    });
    this.lineStream.push(manifest);

    QUnit.ok(element, 'an event was triggered');
    QUnit.strictEqual(element.type, 'tag', 'the line type is tag');
    QUnit.strictEqual(element.tagType, 'program-date-time', 'the tag type is date-time');
    QUnit.strictEqual(element.dateTimeString, '2016-06-22T09:20:16.166-04:00',
      'dateTimeString is parsed');
    QUnit.deepEqual(element.dateTimeObject, new Date('2016-06-22T09:20:16.166-04:00'),
      'dateTimeObject is parsed');

    manifest = '#EXT-X-PROGRAM-DATE-TIME:2016-06-22T09:20:16.16389Z\n';
    this.lineStream.push(manifest);

    QUnit.ok(element, 'an event was triggered');
    QUnit.strictEqual(element.type, 'tag', 'the line type is tag');
    QUnit.strictEqual(element.tagType, 'program-date-time', 'the tag type is date-time');
    QUnit.strictEqual(element.dateTimeString, '2016-06-22T09:20:16.16389Z',
      'dateTimeString is parsed');
    QUnit.deepEqual(element.dateTimeObject, new Date('2016-06-22T09:20:16.16389Z'),
      'dateTimeObject is parsed');
  });
QUnit.test('parses #EXT-X-STREAM-INF with common attributes', function() {
  let manifest = '#EXT-X-STREAM-INF:BANDWIDTH=14400\n';
  let element;

  this.parseStream.on('data', function(elem) {
    element = elem;
  });
  this.lineStream.push(manifest);

  QUnit.ok(element, 'an event was triggered');
  QUnit.strictEqual(element.type, 'tag', 'the line type is tag');
  QUnit.strictEqual(element.tagType, 'stream-inf', 'the tag type is stream-inf');
  QUnit.strictEqual(element.attributes.BANDWIDTH, 14400, 'bandwidth is parsed');

  manifest = '#EXT-X-STREAM-INF:PROGRAM-ID=7\n';
  this.lineStream.push(manifest);

  QUnit.ok(element, 'an event was triggered');
  QUnit.strictEqual(element.type, 'tag', 'the line type is tag');
  QUnit.strictEqual(element.tagType, 'stream-inf', 'the tag type is stream-inf');
  QUnit.strictEqual(element.attributes['PROGRAM-ID'], 7, 'program-id is parsed');

  manifest = '#EXT-X-STREAM-INF:RESOLUTION=396x224\n';
  this.lineStream.push(manifest);

  QUnit.ok(element, 'an event was triggered');
  QUnit.strictEqual(element.type, 'tag', 'the line type is tag');
  QUnit.strictEqual(element.tagType, 'stream-inf', 'the tag type is stream-inf');
  QUnit.strictEqual(element.attributes.RESOLUTION.width, 396, 'width is parsed');
  QUnit.strictEqual(element.attributes.RESOLUTION.height, 224, 'heigth is parsed');

  manifest = '#EXT-X-STREAM-INF:CODECS="avc1.4d400d, mp4a.40.2"\n';
  this.lineStream.push(manifest);

  QUnit.ok(element, 'an event was triggered');
  QUnit.strictEqual(element.type, 'tag', 'the line type is tag');
  QUnit.strictEqual(element.tagType, 'stream-inf', 'the tag type is stream-inf');
  QUnit.strictEqual(element.attributes.CODECS,
                    'avc1.4d400d, mp4a.40.2',
                    'codecs are parsed');
});
QUnit.test('parses #EXT-X-STREAM-INF with arbitrary attributes', function() {
  const manifest = '#EXT-X-STREAM-INF:NUMERIC=24,ALPHA=Value,MIXED=123abc\n';
  let element;

  this.parseStream.on('data', function(elem) {
    element = elem;
  });
  this.lineStream.push(manifest);

  QUnit.ok(element, 'an event was triggered');
  QUnit.strictEqual(element.type, 'tag', 'the line type is tag');
  QUnit.strictEqual(element.tagType, 'stream-inf', 'the tag type is stream-inf');
  QUnit.strictEqual(element.attributes.NUMERIC, '24', 'numeric attributes are parsed');
  QUnit.strictEqual(element.attributes.ALPHA,
                    'Value',
                    'alphabetic attributes are parsed');
  QUnit.strictEqual(element.attributes.MIXED, '123abc', 'mixed attributes are parsed');
});
// #EXT-X-ENDLIST
QUnit.test('parses #EXT-X-ENDLIST tags', function() {
  const manifest = '#EXT-X-ENDLIST\n';
  let element;

  this.parseStream.on('data', function(elem) {
    element = elem;
  });
  this.lineStream.push(manifest);

  QUnit.ok(element, 'an event was triggered');
  QUnit.strictEqual(element.type, 'tag', 'the line type is tag');
  QUnit.strictEqual(element.tagType, 'endlist', 'the tag type is stream-inf');
});

// #EXT-X-KEY
QUnit.test('parses valid #EXT-X-KEY tags', function() {
  let manifest =
    '#EXT-X-KEY:METHOD=AES-128,URI="https://priv.example.com/key.php?r=52"\n';
  let element;

  this.parseStream.on('data', function(elem) {
    element = elem;
  });
  this.lineStream.push(manifest);

  QUnit.ok(element, 'an event was triggered');
  QUnit.deepEqual(element, {
    type: 'tag',
    tagType: 'key',
    attributes: {
      METHOD: 'AES-128',
      URI: 'https://priv.example.com/key.php?r=52'
    }
  }, 'parsed a valid key');

  manifest = '#EXT-X-KEY:URI="https://example.com/key#1",METHOD=FutureType-1024\n';
  this.lineStream.push(manifest);
  QUnit.ok(element, 'an event was triggered');
  QUnit.deepEqual(element, {
    type: 'tag',
    tagType: 'key',
    attributes: {
      METHOD: 'FutureType-1024',
      URI: 'https://example.com/key#1'
    }
  }, 'parsed the attribute list independent of order');

  manifest = '#EXT-X-KEY:IV=1234567890abcdef1234567890abcdef\n';
  this.lineStream.push(manifest);
  QUnit.ok(element.attributes.IV, 'detected an IV attribute');
  QUnit.deepEqual(element.attributes.IV, new Uint32Array([
    0x12345678,
    0x90abcdef,
    0x12345678,
    0x90abcdef
  ]), 'parsed an IV value');
});

QUnit.test('parses minimal #EXT-X-KEY tags', function() {
  const manifest = '#EXT-X-KEY:\n';
  let element;

  this.parseStream.on('data', function(elem) {
    element = elem;
  });
  this.lineStream.push(manifest);

  QUnit.ok(element, 'an event was triggered');
  QUnit.deepEqual(element, {
    type: 'tag',
    tagType: 'key'
  }, 'parsed a minimal key tag');
});

QUnit.test('parses lightly-broken #EXT-X-KEY tags', function() {
  let manifest = '#EXT-X-KEY:URI=\'https://example.com/single-quote\',METHOD=AES-128\n';
  let element;

  this.parseStream.on('data', function(elem) {
    element = elem;
  });
  this.lineStream.push(manifest);

  QUnit.strictEqual(element.attributes.URI,
                    'https://example.com/single-quote',
                    'parsed a single-quoted uri');

  element = null;
  manifest = '#EXT-X-KEYURI="https://example.com/key",METHOD=AES-128\n';
  this.lineStream.push(manifest);
  QUnit.strictEqual(element.tagType, 'key', 'parsed the tag type');
  QUnit.strictEqual(element.attributes.URI,
                    'https://example.com/key',
                    'inferred a colon after the tag type');

  element = null;
  manifest = '#EXT-X-KEY:  URI =  "https://example.com/key",METHOD=AES-128\n';
  this.lineStream.push(manifest);
  QUnit.strictEqual(element.attributes.URI,
                    'https://example.com/key',
                    'trims and removes quotes around the URI');
});

QUnit.test('parses prefixed with 0x or 0X #EXT-X-KEY:IV tags', function() {
  let manifest;
  let element;

  this.parseStream.on('data', function(elem) {
    element = elem;
  });

  manifest = '#EXT-X-KEY:IV=0x1234567890abcdef1234567890abcdef\n';
  this.lineStream.push(manifest);
  QUnit.ok(element.attributes.IV, 'detected an IV attribute');
  QUnit.deepEqual(element.attributes.IV, new Uint32Array([
    0x12345678,
    0x90abcdef,
    0x12345678,
    0x90abcdef
  ]), 'parsed an IV value with 0x');

  manifest = '#EXT-X-KEY:IV=0X1234567890abcdef1234567890abcdef\n';
  this.lineStream.push(manifest);
  QUnit.ok(element.attributes.IV, 'detected an IV attribute');
  QUnit.deepEqual(element.attributes.IV, new Uint32Array([
    0x12345678,
    0x90abcdef,
    0x12345678,
    0x90abcdef
  ]), 'parsed an IV value with 0X');
});

QUnit.test('ignores empty lines', function() {
  const manifest = '\n';
  let event = false;

  this.parseStream.on('data', function() {
    event = true;
  });
  this.lineStream.push(manifest);

  QUnit.ok(!event, 'no event is triggered');
});

QUnit.module('m3u8 parser');

QUnit.test('can be constructed', function() {
  QUnit.notStrictEqual(typeof new Parser(), 'undefined', 'parser is defined');
});

QUnit.test('attaches cue-out data to segment', function() {
  const parser = new Parser();

  const manifest = [
    '#EXTM3U',
    '#EXTINF:5,',
    '#COMMENT',
    'ex1.ts',
    '#EXT-X-CUE-OUT:10',
    '#EXTINF:5,',
    'ex2.ts',
    '#EXT-X-CUE-OUT15',
    '#EXT-UKNOWN-TAG',
    '#EXTINF:5,',
    'ex3.ts',
    '#EXT-X-CUE-OUT',
    '#EXTINF:5,',
    'ex3.ts',
    '#EXT-X-ENDLIST'
  ].join('\n');

  parser.push(manifest);

  QUnit.equal(parser.manifest.segments[1].cueOut, '10', 'parser attached cue out tag');
  QUnit.equal(parser.manifest.segments[2].cueOut, '15', 'cue out without : seperator');
  QUnit.equal(parser.manifest.segments[3].cueOut, '', 'cue out without data');
});

QUnit.test('attaches cue-out-cont data to segment', function() {
  const parser = new Parser();

  const manifest = [
    '#EXTM3U',
    '#EXTINF:5,',
    '#COMMENT',
    'ex1.ts',
    '#EXT-X-CUE-OUT-CONT:10/60',
    '#EXTINF:5,',
    'ex2.ts',
    '#EXT-X-CUE-OUT-CONT15/30',
    '#EXT-UKNOWN-TAG',
    '#EXTINF:5,',
    'ex3.ts',
    '#EXT-X-CUE-OUT-CONT',
    '#EXTINF:5,',
    'ex3.ts',
    '#EXT-X-ENDLIST'
  ].join('\n');

  parser.push(manifest);

  QUnit.equal(parser.manifest.segments[1].cueOutCont, '10/60',
    'parser attached cue out cont tag');
  QUnit.equal(parser.manifest.segments[2].cueOutCont, '15/30',
    'cue out cont without : seperator');
  QUnit.equal(parser.manifest.segments[3].cueOutCont, '', 'cue out cont without data');
});

QUnit.test('attaches cue-in data to segment', function() {
  const parser = new Parser();

  const manifest = [
    '#EXTM3U',
    '#EXTINF:5,',
    '#COMMENT',
    'ex1.ts',
    '#EXT-X-CUE-IN',
    '#EXTINF:5,',
    'ex2.ts',
    '#EXT-X-CUE-IN:15',
    '#EXT-UKNOWN-TAG',
    '#EXTINF:5,',
    'ex3.ts',
    '#EXT-X-CUE-IN=abc',
    '#EXTINF:5,',
    'ex3.ts',
    '#EXT-X-ENDLIST'
  ].join('\n');

  parser.push(manifest);

  QUnit.equal(parser.manifest.segments[1].cueIn, '', 'parser attached cue in tag');
  QUnit.equal(parser.manifest.segments[2].cueIn, '15', 'cue in with data');
  QUnit.equal(parser.manifest.segments[3].cueIn, '=abc',
    'cue in without colon seperator');
});

QUnit.test('parses characteristics attribute', function() {
  const parser = new Parser();

  const manifest = [
    '#EXTM3U',
    '#EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="subs",CHARACTERISTICS="char",NAME="test"',
    '#EXT-X-STREAM-INF:BANDWIDTH=1,CODECS="mp4a.40.2, avc1.4d400d",SUBTITLES="subs"',
    'index.m3u8'
  ].join('\n');

  parser.push(manifest);

  QUnit.equal(parser.manifest.mediaGroups.SUBTITLES.subs.test.characteristics,
              'char',
              'parsed CHARACTERISTICS attribute');
});

QUnit.test('parses FORCED attribute', function() {
  const parser = new Parser();

  const manifest = [
    '#EXTM3U',
    '#EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="subs",CHARACTERISTICS="char",NAME="test",FORCED=YES',
    '#EXT-X-STREAM-INF:BANDWIDTH=1,CODECS="mp4a.40.2, avc1.4d400d",SUBTITLES="subs"',
    'index.m3u8'
  ].join('\n');

  parser.push(manifest);

  QUnit.ok(parser.manifest.mediaGroups.SUBTITLES.subs.test.forced,
           'parsed FORCED attribute');
});

QUnit.module('m3u8s');

QUnit.test('parses static manifests as expected', function() {
  let key;

  for (key in testDataManifests) {
    if (testDataExpected[key]) {
      const parser = new Parser();

      parser.push(testDataManifests[key]);
      QUnit.deepEqual(parser.manifest,
                      testDataExpected[key],
                      key + '.m3u8 was parsed correctly'
      );
    }
  }
});
