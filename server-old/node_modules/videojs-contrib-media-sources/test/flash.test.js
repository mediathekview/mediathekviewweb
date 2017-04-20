import document from 'global/document';
import window from 'global/window';
import QUnit from 'qunit';
import sinon from 'sinon';
import videojs from 'video.js';
import muxjs from 'mux.js';
import FlashSourceBuffer from '../src/flash-source-buffer';
import FlashConstants from '../src/flash-constants';

// we disable this because browserify needs to include these files
// but the exports are not important
/* eslint-disable no-unused-vars */
import {MediaSource, URL} from '../src/videojs-contrib-media-sources.js';
/* eslint-disable no-unused-vars */

// return the sequence of calls to append to the SWF
const appendCalls = function(calls) {
  return calls.filter(function(call) {
    return call.callee && call.callee === 'vjs_appendChunkReady';
  });
};

const getFlvHeader = function() {
  return new Uint8Array([1, 2, 3]);
};

const makeFlvTag = function(pts, data) {
  return {
    pts,
    dts: pts,
    bytes: data
  };
};

let timers;
let oldSTO;

const fakeSTO = function() {
  oldSTO = window.setTimeout;
  timers = [];

  timers.run = function(num) {
    let timer;

    while (num--) {
      timer = this.pop();
      if (timer) {
        timer();
      }
    }
  };

  timers.runAll = function() {
    while (this.length) {
      this.pop()();
    }
  };

  window.setTimeout = function(callback) {
    timers.push(callback);
  };
  window.setTimeout.fake = true;
};

const unfakeSTO = function() {
  timers = [];
  window.setTimeout = oldSTO;
};

// Create a WebWorker-style message that signals the transmuxer is done
const createDataMessage = function(data, audioData, metadata, captions) {
  return {
    data: {
      action: 'data',
      segment: {
        tags: {
          videoTags: data.map((tag) => {
            return makeFlvTag(tag.pts, tag.bytes);
          }),
          audioTags: audioData ? audioData.map((tag) => {
            return makeFlvTag(tag.pts, tag.bytes);
          }) : []
        },
        metadata,
        captions
      }
    }
  };
};
const doneMessage = {
  data: {
    action: 'done'
  }
};
const postMessage_ = function(msg) {
  if (msg.action === 'push') {
    window.setTimeout(()=> {
      this.onmessage(createDataMessage([{
        bytes: new Uint8Array(msg.data, msg.byteOffset, msg.byteLength),
        pts: 0
      }]));
    }, 1);
  } else if (msg.action === 'flush') {
    window.setTimeout(() => {
      this.onmessage(doneMessage);
    }, 1);
  }
};

QUnit.module('Flash MediaSource', {
  beforeEach(assert) {
    let swfObj;

    // Mock the environment's timers because certain things - particularly
    // player readiness - are asynchronous in video.js 5.
    this.clock = sinon.useFakeTimers();

    this.fixture = document.getElementById('qunit-fixture');
    this.video = document.createElement('video');
    this.fixture.appendChild(this.video);
    this.player = videojs(this.video);

    this.oldMediaSource = window.MediaSource || window.WebKitMediaSource;

    window.MediaSource = null;
    window.WebKitMediaSource = null;

    this.Flash = videojs.getTech('Flash');
    this.oldFlashSupport = this.Flash.isSupported;
    this.oldCanPlay = this.Flash.canPlaySource;
    this.Flash.canPlaySource = this.Flash.isSupported = function() {
      return true;
    };

    this.oldFlashTransmuxerPostMessage = muxjs.flv.Transmuxer.postMessage;
    this.oldGetFlvHeader = muxjs.flv.getFlvHeader;
    muxjs.flv.getFlvHeader = getFlvHeader;

    this.swfCalls = [];
    this.mediaSource = new videojs.MediaSource();
    this.player.src({
      src: videojs.URL.createObjectURL(this.mediaSource),
      type: 'video/mp2t'
    });
    // vjs6 takes 1 tick to set source async
    this.clock.tick(1);
    swfObj = document.createElement('fake-object');
    swfObj.id = 'fake-swf-' + assert.test.testId;
    this.player.el().replaceChild(swfObj, this.player.tech_.el());
    this.player.tech_.hls = new videojs.EventTarget();
    this.player.tech_.el_ = swfObj;
    swfObj.tech = this.player.tech_;

    /* eslint-disable camelcase */
    swfObj.vjs_abort = () => {
      this.swfCalls.push('abort');
    };
    swfObj.vjs_getProperty = (attr) => {
      if (attr === 'buffered') {
        return [];
      } else if (attr === 'currentTime') {
        return 0;
      // ignored for vjs6
      } else if (attr === 'videoWidth') {
        return 0;
      }
      this.swfCalls.push({ attr });
    };
    swfObj.vjs_load = () => {
      this.swfCalls.push('load');
    };
    swfObj.vjs_setProperty = (attr, value) => {
      this.swfCalls.push({ attr, value });
    };
    swfObj.vjs_discontinuity = (attr, value) => {
      this.swfCalls.push({ attr, value });
    };
    swfObj.vjs_appendChunkReady = (method) => {
      window.setTimeout(() => {
        let chunk = window[method]();

        // only care about the segment data, not the flv header
        if (method.substr(0, 21) === 'vjs_flashEncodedData_') {
          let call = {
            callee: 'vjs_appendChunkReady',
            arguments: [window.atob(chunk).split('').map((c) => c.charCodeAt(0))]
          };

          this.swfCalls.push(call);
        }
      }, 1);
    };
    swfObj.vjs_adjustCurrentTime = (value) => {
      this.swfCalls.push({ call: 'adjustCurrentTime', value });
    };
    /* eslint-enable camelcase */

    this.mediaSource.trigger({
      type: 'sourceopen',
      swfId: swfObj.id
    });
    fakeSTO();
  },
  afterEach() {
    window.MediaSource = this.oldMediaSource;
    window.WebKitMediaSource = window.MediaSource;
    this.Flash.isSupported = this.oldFlashSupport;
    this.Flash.canPlaySource = this.oldCanPlay;
    muxjs.flv.Transmuxer.postMessage = this.oldFlashTransmuxerPostMessage;
    muxjs.flv.getFlvHeader = this.oldGetFlvHeader;
    this.player.dispose();
    this.clock.restore();
    this.swfCalls = [];
    unfakeSTO();
  }
});

QUnit.test('raises an exception for unrecognized MIME types', function() {
  try {
    this.mediaSource.addSourceBuffer('video/garbage');
  } catch (e) {
    QUnit.ok(e, 'an error was thrown');
    return;
  }
  QUnit.ok(false, 'no error was thrown');
});

QUnit.test('creates FlashSourceBuffers for video/mp2t', function() {
  QUnit.ok(this.mediaSource.addSourceBuffer('video/mp2t') instanceof FlashSourceBuffer,
      'create source buffer');
});

QUnit.test('waits for the next tick to append', function() {
  let sourceBuffer = this.mediaSource.addSourceBuffer('video/mp2t');

  sourceBuffer.transmuxer_.postMessage = postMessage_;

  QUnit.equal(this.swfCalls.length, 1, 'made one call on init');
  QUnit.equal(this.swfCalls[0], 'load', 'called load');
  sourceBuffer.appendBuffer(new Uint8Array([0, 1]));
  this.swfCalls = appendCalls(this.swfCalls);
  QUnit.strictEqual(this.swfCalls.length, 0, 'no appends were made');
});

QUnit.test('passes bytes to Flash', function() {
  let sourceBuffer = this.mediaSource.addSourceBuffer('video/mp2t');

  sourceBuffer.transmuxer_.postMessage = postMessage_;

  this.swfCalls.length = 0;
  sourceBuffer.appendBuffer(new Uint8Array([0, 1]));
  timers.runAll();
  timers.runAll();

  QUnit.ok(this.swfCalls.length, 'the SWF was called');
  this.swfCalls = appendCalls(this.swfCalls);
  QUnit.strictEqual(this.swfCalls[0].callee, 'vjs_appendChunkReady', 'called vjs_appendChunkReady');
  QUnit.deepEqual(this.swfCalls[0].arguments[0],
            [0, 1],
            'passed the base64 encoded data');
});

QUnit.test('passes chunked bytes to Flash', function() {
  let sourceBuffer = this.mediaSource.addSourceBuffer('video/mp2t');
  let oldChunkSize = FlashConstants.BYTES_PER_CHUNK;

  sourceBuffer.transmuxer_.postMessage = postMessage_;

  FlashConstants.BYTES_PER_CHUNK = 2;

  this.swfCalls.length = 0;
  sourceBuffer.appendBuffer(new Uint8Array([0, 1, 2, 3, 4]));
  timers.runAll();

  QUnit.ok(this.swfCalls.length, 'the SWF was called');
  this.swfCalls = appendCalls(this.swfCalls);
  QUnit.equal(this.swfCalls.length, 3, 'the SWF received 3 chunks');
  QUnit.strictEqual(this.swfCalls[0].callee, 'vjs_appendChunkReady', 'called vjs_appendChunkReady');
  QUnit.deepEqual(this.swfCalls[0].arguments[0],
            [0, 1],
            'passed the base64 encoded data');
  QUnit.deepEqual(this.swfCalls[1].arguments[0],
            [2, 3],
            'passed the base64 encoded data');
  QUnit.deepEqual(this.swfCalls[2].arguments[0],
            [4],
            'passed the base64 encoded data');

  FlashConstants.BYTES_PER_CHUNK = oldChunkSize;
});

QUnit.test('clears the SWF on seeking', function() {
  let aborts = 0;

  this.mediaSource.addSourceBuffer('video/mp2t');
  // track calls to abort()

  /* eslint-disable camelcase */
  this.mediaSource.swfObj.vjs_abort = function() {
    aborts++;
  };
  /* eslint-enable camelcase */

  this.mediaSource.tech_.trigger('seeking');
  QUnit.strictEqual(1, aborts, 'aborted pending buffer');
});

QUnit.test('drops tags before currentTime when seeking', function() {
  let sourceBuffer = this.mediaSource.addSourceBuffer('video/mp2t');
  let i = 10;
  let currentTime;
  let tags_ = [];

  sourceBuffer.transmuxer_.postMessage = postMessage_;

  this.mediaSource.tech_.currentTime = function() {
    return currentTime;
  };

  // push a tag into the buffer to establish the starting PTS value
  currentTime = 0;

  sourceBuffer.transmuxer_.onmessage(createDataMessage([{
    pts: 19 * 1000,
    bytes: new Uint8Array(1)
  }]));

  timers.runAll();

  sourceBuffer.appendBuffer(new Uint8Array(10));
  timers.runAll();

  // mock out a new segment of FLV tags, starting 10s after the
  // starting PTS value
  while (i--) {
    tags_.unshift(
      {
        pts: (i * 1000) + (29 * 1000),
        bytes: new Uint8Array([i])
      }
    );
  }

  let dataMessage = createDataMessage(tags_);

  // mock gop start at seek point
  dataMessage.data.segment.tags.videoTags[7].keyFrame = true;

  sourceBuffer.transmuxer_.onmessage(dataMessage);

  // seek to 7 seconds into the new swegment
  this.mediaSource.tech_.seeking = function() {
    return true;
  };
  currentTime = 10 + 7;
  this.mediaSource.tech_.trigger('seeking');
  sourceBuffer.appendBuffer(new Uint8Array(10));
  this.swfCalls.length = 0;
  timers.runAll();

  QUnit.deepEqual(this.swfCalls[0].arguments[0], [7, 8, 9],
            'three tags are appended');
});

QUnit.test('drops audio and video (complete gops) tags before the buffered end always', function() {
  let sourceBuffer = this.mediaSource.addSourceBuffer('video/mp2t');
  let endTime;
  let videoTags_ = [];
  let audioTags_ = [];

  sourceBuffer.transmuxer_.postMessage = postMessage_;

  this.mediaSource.tech_.buffered = function() {
    return videojs.createTimeRange([[0, endTime]]);
  };

  // push a tag into the buffer to establish the starting PTS value
  endTime = 0;

  // mock buffering 17 seconds of data so flash source buffer internal end of buffer
  // tracking is accurate
  let i = 17;

  while (i--) {
    videoTags_.unshift({
      pts: (i * 1000) + (19 * 1000),
      bytes: new Uint8Array(1)
    });
  }

  i = 17;

  while (i--) {
    audioTags_.unshift({
      pts: (i * 1000) + (19 * 1000),
      bytes: new Uint8Array(1)
    });
  }

  let dataMessage = createDataMessage(videoTags_, audioTags_);

  sourceBuffer.transmuxer_.onmessage(dataMessage);

  timers.runAll();

  sourceBuffer.appendBuffer(new Uint8Array(10));
  timers.runAll();

  i = 10;
  videoTags_ = [];
  audioTags_ = [];

  // mock out a new segment of FLV tags, starting 10s after the
  // starting PTS value
  while (i--) {
    videoTags_.unshift({
      pts: (i * 1000) + (29 * 1000),
      bytes: new Uint8Array([i])
    });
  }

  i = 10;

  while (i--) {
    audioTags_.unshift({
      pts: (i * 1000) + (29 * 1000),
      bytes: new Uint8Array([i + 100])
    });
  }

  dataMessage = createDataMessage(videoTags_, audioTags_);

  dataMessage.data.segment.tags.videoTags[0].keyFrame = true;
  dataMessage.data.segment.tags.videoTags[3].keyFrame = true;
  dataMessage.data.segment.tags.videoTags[6].keyFrame = true;
  dataMessage.data.segment.tags.videoTags[8].keyFrame = true;

  sourceBuffer.transmuxer_.onmessage(dataMessage);

  endTime = 10 + 7;
  sourceBuffer.appendBuffer(new Uint8Array(10));
  this.swfCalls.length = 0;
  timers.runAll();

  // end of buffer is 17 seconds
  // frames 0-6 for video have pts values less than 17 seconds
  // since frame 6 is a key frame, it should still be appended to preserve the entire gop
  // so we should have appeneded frames 6 - 9
  // frames 100-106 for audio have pts values less than 17 seconds
  // but since we appended an extra video frame, we should also append audio frames
  // to fill in the gap in audio. This means we should be appending audio frames
  // 106, 107, 108, 109
  // Append order is 6, 7, 107, 8, 108, 9, 109 since we order tags based on dts value
  QUnit.deepEqual(this.swfCalls[0].arguments[0], [6, 106, 7, 107, 8, 108, 9, 109],
            'audio and video tags properly dropped');
});

QUnit.test('seeking into the middle of a GOP adjusts currentTime to the start of the GOP', function() {
  let sourceBuffer = this.mediaSource.addSourceBuffer('video/mp2t');
  let i = 10;
  let currentTime;
  let tags_ = [];

  sourceBuffer.transmuxer_.postMessage = postMessage_;

  this.mediaSource.tech_.currentTime = function() {
    return currentTime;
  };

  // push a tag into the buffer to establish the starting PTS value
  currentTime = 0;

  let dataMessage = createDataMessage([{
    pts: 19 * 1000,
    bytes: new Uint8Array(1)
  }]);

  sourceBuffer.transmuxer_.onmessage(dataMessage);

  timers.runAll();

  sourceBuffer.appendBuffer(new Uint8Array(10));
  timers.runAll();

  // mock out a new segment of FLV tags, starting 10s after the
  // starting PTS value
  while (i--) {
    tags_.unshift(
      {
        pts: (i * 1000) + (29 * 1000),
        bytes: new Uint8Array([i])
      }
    );
  }

  dataMessage = createDataMessage(tags_);

  // mock the GOP structure
  dataMessage.data.segment.tags.videoTags[0].keyFrame = true;
  dataMessage.data.segment.tags.videoTags[3].keyFrame = true;
  dataMessage.data.segment.tags.videoTags[5].keyFrame = true;
  dataMessage.data.segment.tags.videoTags[8].keyFrame = true;

  sourceBuffer.transmuxer_.onmessage(dataMessage);

  // seek to 7 seconds into the new swegment
  this.mediaSource.tech_.seeking = function() {
    return true;
  };
  currentTime = 10 + 7;
  this.mediaSource.tech_.trigger('seeking');
  sourceBuffer.appendBuffer(new Uint8Array(10));
  this.swfCalls.length = 0;
  timers.runAll();

  QUnit.deepEqual(this.swfCalls[0], { call: 'adjustCurrentTime', value: 15 });
  QUnit.deepEqual(this.swfCalls[1].arguments[0], [5, 6, 7, 8, 9],
            '5 tags are appended');
});

QUnit.test('GOP trimming accounts for metadata tags prepended to key frames by mux.js', function() {
  let sourceBuffer = this.mediaSource.addSourceBuffer('video/mp2t');
  let i = 10;
  let currentTime;
  let tags_ = [];

  sourceBuffer.transmuxer_.postMessage = postMessage_;

  this.mediaSource.tech_.currentTime = function() {
    return currentTime;
  };

  // push a tag into the buffer to establish the starting PTS value
  currentTime = 0;

  let dataMessage = createDataMessage([{
    pts: 19 * 1000,
    bytes: new Uint8Array(1)
  }]);

  sourceBuffer.transmuxer_.onmessage(dataMessage);

  timers.runAll();

  sourceBuffer.appendBuffer(new Uint8Array(10));
  timers.runAll();

  // mock out a new segment of FLV tags, starting 10s after the
  // starting PTS value
  while (i--) {
    tags_.unshift(
      {
        pts: (i * 1000) + (29 * 1000),
        bytes: new Uint8Array([i])
      }
    );
  }

  // add in the metadata tags
  tags_.splice(8, 0, {
    pts: tags_[8].pts,
    bytes: new Uint8Array([8])
  }, {
    pts: tags_[8].pts,
    bytes: new Uint8Array([8])
  });

  tags_.splice(5, 0, {
    pts: tags_[5].pts,
    bytes: new Uint8Array([5])
  }, {
    pts: tags_[5].pts,
    bytes: new Uint8Array([5])
  });

  tags_.splice(0, 0, {
    pts: tags_[0].pts,
    bytes: new Uint8Array([0])
  }, {
    pts: tags_[0].pts,
    bytes: new Uint8Array([0])
  });

  dataMessage = createDataMessage(tags_);

  // mock the GOP structure + metadata tags
  // if we see a metadata tag, that means the next tag will also be a metadata tag with
  // keyFrame true and the tag after that will be the keyFrame
  // e.g.
  // { keyFrame: false, metaDataTag: true},
  // { keyFrame: true, metaDataTag: true},
  // { keyFrame: true, metaDataTag: false}
  dataMessage.data.segment.tags.videoTags[0].metaDataTag = true;
  dataMessage.data.segment.tags.videoTags[1].metaDataTag = true;
  dataMessage.data.segment.tags.videoTags[1].keyFrame = true;
  dataMessage.data.segment.tags.videoTags[2].keyFrame = true;

  // no metadata tags in front of this key to test the case where mux.js does not prepend
  // the metadata tags
  dataMessage.data.segment.tags.videoTags[5].keyFrame = true;

  dataMessage.data.segment.tags.videoTags[7].metaDataTag = true;
  dataMessage.data.segment.tags.videoTags[8].metaDataTag = true;
  dataMessage.data.segment.tags.videoTags[8].keyFrame = true;
  dataMessage.data.segment.tags.videoTags[9].keyFrame = true;

  dataMessage.data.segment.tags.videoTags[12].metaDataTag = true;
  dataMessage.data.segment.tags.videoTags[13].metaDataTag = true;
  dataMessage.data.segment.tags.videoTags[13].keyFrame = true;
  dataMessage.data.segment.tags.videoTags[14].keyFrame = true;

  sourceBuffer.transmuxer_.onmessage(dataMessage);

  // seek to 7 seconds into the new swegment
  this.mediaSource.tech_.seeking = function() {
    return true;
  };
  currentTime = 10 + 7;
  this.mediaSource.tech_.trigger('seeking');
  sourceBuffer.appendBuffer(new Uint8Array(10));
  this.swfCalls.length = 0;
  timers.runAll();

  QUnit.deepEqual(this.swfCalls[0], { call: 'adjustCurrentTime', value: 15 });
  QUnit.deepEqual(this.swfCalls[1].arguments[0], [5, 5, 5, 6, 7, 8, 8, 8, 9],
            '10 tags are appended, 4 of which are metadata tags');
});

QUnit.test('drops all tags if target pts append time does not fall within segment', function() {
  let sourceBuffer = this.mediaSource.addSourceBuffer('video/mp2t');
  let i = 10;
  let currentTime;
  let tags_ = [];

  this.mediaSource.tech_.currentTime = function() {
    return currentTime;
  };

  sourceBuffer.transmuxer_.postMessage = postMessage_;

  // push a tag into the buffer to establish the starting PTS value
  currentTime = 0;

  let dataMessage = createDataMessage([{
    pts: 19 * 1000,
    bytes: new Uint8Array(1)
  }]);

  sourceBuffer.transmuxer_.onmessage(dataMessage);

  timers.runAll();

  sourceBuffer.appendBuffer(new Uint8Array(10));
  timers.runAll();

  // mock out a new segment of FLV tags, starting 10s after the
  // starting PTS value
  while (i--) {
    tags_.unshift(
      {
        pts: (i * 1000) + (19 * 1000),
        bytes: new Uint8Array([i])
      }
    );
  }

  dataMessage = createDataMessage(tags_);

  // mock the GOP structure
  dataMessage.data.segment.tags.videoTags[0].keyFrame = true;
  dataMessage.data.segment.tags.videoTags[3].keyFrame = true;
  dataMessage.data.segment.tags.videoTags[5].keyFrame = true;
  dataMessage.data.segment.tags.videoTags[8].keyFrame = true;

  sourceBuffer.transmuxer_.onmessage(dataMessage);

  // seek to 7 seconds into the new swegment
  this.mediaSource.tech_.seeking = function() {
    return true;
  };
  currentTime = 10 + 7;
  this.mediaSource.tech_.trigger('seeking');
  sourceBuffer.appendBuffer(new Uint8Array(10));
  this.swfCalls.length = 0;
  timers.runAll();

  QUnit.equal(this.swfCalls.length, 0, 'dropped all tags and made no swf calls');
});

QUnit.test('seek targeting accounts for changing timestampOffsets', function() {
  let sourceBuffer = this.mediaSource.addSourceBuffer('video/mp2t');
  let i = 10;
  let tags_ = [];
  let currentTime;

  this.mediaSource.tech_.currentTime = function() {
    return currentTime;
  };

  sourceBuffer.transmuxer_.postMessage = postMessage_;

  let dataMessage = createDataMessage([{
    pts: 19 * 1000,
    bytes: new Uint8Array(1)
  }]);

  // push a tag into the buffer to establish the starting PTS value
  currentTime = 0;
  sourceBuffer.transmuxer_.onmessage(dataMessage);

  timers.runAll();

  // to seek across a discontinuity:
  // 1. set the timestamp offset to the media timeline position for
  //    the start of the segment
  // 2. set currentTime to the desired media timeline position
  sourceBuffer.timestampOffset = 22;
  currentTime = sourceBuffer.timestampOffset + 3.5;
  this.mediaSource.tech_.seeking = function() {
    return true;
  };

  // the new segment FLV tags are at disjoint PTS positions
  while (i--) {
    tags_.unshift({
      // (101 * 1000) !== the old PTS offset
      pts: (i * 1000) + (101 * 1000),
      bytes: new Uint8Array([i + sourceBuffer.timestampOffset])
    });
  }

  dataMessage = createDataMessage(tags_);
  // mock gop start at seek point
  dataMessage.data.segment.tags.videoTags[3].keyFrame = true;

  sourceBuffer.transmuxer_.onmessage(dataMessage);

  this.mediaSource.tech_.trigger('seeking');
  this.swfCalls.length = 0;
  timers.runAll();

  QUnit.equal(this.swfCalls[0].value, 25, 'adjusted current time');
  QUnit.deepEqual(this.swfCalls[1].arguments[0],
            [25, 26, 27, 28, 29, 30, 31],
            'filtered the appended tags');
});

QUnit.test('calling endOfStream sets mediaSource readyState to ended', function() {
  let sourceBuffer = this.mediaSource.addSourceBuffer('video/mp2t');

  sourceBuffer.transmuxer_.postMessage = postMessage_;

  /* eslint-disable camelcase */
  this.mediaSource.swfObj.vjs_endOfStream = () => {
    this.swfCalls.push('endOfStream');
  };
  /* eslint-enable camelcase */
  sourceBuffer.addEventListener('updateend', () => {
    this.mediaSource.endOfStream();
  });

  this.swfCalls.length = 0;
  sourceBuffer.appendBuffer(new Uint8Array([0, 1]));

  timers.runAll();

  QUnit.strictEqual(sourceBuffer.mediaSource_.readyState,
    'ended',
    'readyState is \'ended\'');
  QUnit.strictEqual(this.swfCalls.length, 2, 'made two calls to swf');
  QUnit.deepEqual(this.swfCalls.shift().arguments[0],
            [0, 1],
            'contains the data');

  QUnit.ok(this.swfCalls.shift().indexOf('endOfStream') === 0,
      'the second call should be for the updateend');

  QUnit.strictEqual(timers.length, 0, 'no more appends are scheduled');
});

QUnit.test('opens the stream on sourceBuffer.appendBuffer after endOfStream', function() {
  let sourceBuffer = this.mediaSource.addSourceBuffer('video/mp2t');
  let foo = () => {
    this.mediaSource.endOfStream();
    sourceBuffer.removeEventListener('updateend', foo);
  };

  sourceBuffer.transmuxer_.postMessage = postMessage_;

  /* eslint-disable camelcase */
  this.mediaSource.swfObj.vjs_endOfStream = () => {
    this.swfCalls.push('endOfStream');
  };
  /* eslint-enable camelcase */
  sourceBuffer.addEventListener('updateend', foo);

  this.swfCalls.length = 0;
  sourceBuffer.appendBuffer(new Uint8Array([0, 1]));

  timers.runAll();

  QUnit.strictEqual(this.swfCalls.length, 2, 'made two calls to swf');
  QUnit.deepEqual(this.swfCalls.shift().arguments[0],
            [0, 1],
            'contains the data');

  QUnit.equal(this.swfCalls.shift(),
        'endOfStream',
        'the second call should be for the updateend');

  sourceBuffer.appendBuffer(new Uint8Array([2, 3]));
  // remove previous video pts save because mock appends don't have actual timing data
  sourceBuffer.videoBufferEnd_ = NaN;
  timers.runAll();

  QUnit.strictEqual(this.swfCalls.length, 1, 'made one more append');
  QUnit.deepEqual(this.swfCalls.shift().arguments[0],
            [2, 3],
            'contains the third and fourth bytes');
  QUnit.strictEqual(
    sourceBuffer.mediaSource_.readyState,
    'open',
    'The streams should be open if more bytes are appended to an "ended" stream'
  );
  QUnit.strictEqual(timers.length, 0, 'no more appends are scheduled');
});

QUnit.test('abort() clears any buffered input', function() {
  let sourceBuffer = this.mediaSource.addSourceBuffer('video/mp2t');

  sourceBuffer.transmuxer_.postMessage = postMessage_;

  this.swfCalls.length = 0;
  sourceBuffer.appendBuffer(new Uint8Array([0]));
  sourceBuffer.abort();

  timers.pop()();
  QUnit.strictEqual(this.swfCalls.length, 1, 'called the swf');
  QUnit.strictEqual(this.swfCalls[0], 'abort', 'invoked abort');
});
// requestAnimationFrame is heavily throttled or unscheduled when
// the browser tab running contrib-media-sources is in a background
// tab. If that happens, video data can continuously build up in
// memory and cause the tab or browser to crash.
QUnit.test('does not use requestAnimationFrame', function() {
  let oldRFA = window.requestAnimationFrame;
  let requests = 0;
  let sourceBuffer;

  window.requestAnimationFrame = function() {
    requests++;
  };

  sourceBuffer = this.mediaSource.addSourceBuffer('video/mp2t');
  sourceBuffer.transmuxer_.postMessage = postMessage_;
  sourceBuffer.appendBuffer(new Uint8Array([0, 1, 2, 3]));
  while (timers.length) {
    timers.pop()();
  }
  QUnit.equal(requests, 0, 'no calls to requestAnimationFrame were made');
  window.requestAnimationFrame = oldRFA;
});
QUnit.test('updating is true while an append is in progress', function() {
  let sourceBuffer = this.mediaSource.addSourceBuffer('video/mp2t');
  let ended = false;

  sourceBuffer.transmuxer_.postMessage = postMessage_;

  sourceBuffer.addEventListener('updateend', function() {
    ended = true;
  });

  sourceBuffer.appendBuffer(new Uint8Array([0, 1]));

  QUnit.equal(sourceBuffer.updating, true, 'updating is set');

  while (!ended) {
    timers.pop()();
  }
  QUnit.equal(sourceBuffer.updating, false, 'updating is unset');
});

QUnit.test('throws an error if append is called while updating', function() {
  let sourceBuffer = this.mediaSource.addSourceBuffer('video/mp2t');

  sourceBuffer.appendBuffer(new Uint8Array([0, 1]));
  sourceBuffer.transmuxer_.postMessage = postMessage_;

  QUnit.throws(function() {
    sourceBuffer.appendBuffer(new Uint8Array([0, 1]));
  }, function(e) {
    return e.name === 'InvalidStateError' &&
      e.code === window.DOMException.INVALID_STATE_ERR;
  }, 'threw an InvalidStateError');
});

QUnit.test('stops updating if abort is called', function() {
  let sourceBuffer = this.mediaSource.addSourceBuffer('video/mp2t');
  let updateEnds = 0;

  sourceBuffer.transmuxer_.postMessage = postMessage_;

  sourceBuffer.addEventListener('updateend', function() {
    updateEnds++;
  });
  sourceBuffer.appendBuffer(new Uint8Array([0, 1]));

  sourceBuffer.abort();
  QUnit.equal(sourceBuffer.updating, false, 'no longer updating');
  QUnit.equal(updateEnds, 1, 'triggered updateend');
});

QUnit.test('forwards duration overrides to the SWF', function() {
  /* eslint-disable no-unused-vars */
  let ignored = this.mediaSource.duration;
  /* eslint-enable no-unused-vars */

  QUnit.deepEqual(this.swfCalls[1], {
    attr: 'duration'
  }, 'requests duration from the SWF');

  this.mediaSource.duration = 101.3;
  // Setting a duration results in two calls to the swf
  // Ignore the first call (this.swfCalls[2]) as it was just to get the
  // current duration
  QUnit.deepEqual(this.swfCalls[3], {
    attr: 'duration', value: 101.3
  }, 'set the duration override');

});

QUnit.test('returns NaN for duration before the SWF is ready', function() {
  this.mediaSource.swfObj = null;

  QUnit.ok(isNaN(this.mediaSource.duration), 'duration is NaN');
});

QUnit.test('calculates the base PTS for the media', function() {
  let sourceBuffer = this.mediaSource.addSourceBuffer('video/mp2t');
  let tags_ = [];

  sourceBuffer.transmuxer_.postMessage = postMessage_;

  // seek to 15 seconds
  this.player.tech_.seeking = function() {
    return true;
  };
  this.player.tech_.currentTime = function() {
    return 15;
  };
  // FLV tags for this segment start at 10 seconds in the media
  // timeline
  tags_.push(
    // zero in the media timeline is PTS 3
    { pts: (10 + 3) * 1000, bytes: new Uint8Array([10]) },
    { pts: (15 + 3) * 1000, bytes: new Uint8Array([15]) }
  );

  let dataMessage = createDataMessage(tags_);

  // mock gop start at seek point
  dataMessage.data.segment.tags.videoTags[1].keyFrame = true;
  sourceBuffer.transmuxer_.onmessage(dataMessage);

  // let the source buffer know the segment start time
  sourceBuffer.timestampOffset = 10;

  this.swfCalls.length = 0;
  timers.runAll();

  QUnit.equal(this.swfCalls.length, 1, 'made a SWF call');
  QUnit.deepEqual(this.swfCalls[0].arguments[0], [15], 'dropped the early tag');
});

QUnit.test('remove fires update events', function() {
  let sourceBuffer = this.mediaSource.addSourceBuffer('video/mp2t');
  let events = [];

  sourceBuffer.transmuxer_.postMessage = postMessage_;
  sourceBuffer.on(['update', 'updateend'], function(event) {
    events.push(event.type);
  });

  sourceBuffer.remove(0, 1);
  QUnit.deepEqual(events, ['update', 'updateend'], 'fired update events');
  QUnit.equal(sourceBuffer.updating, false, 'finished updating');
});

QUnit.test('passes endOfStream network errors to the tech', function() {
  this.mediaSource.readyState = 'ended';
  this.mediaSource.endOfStream('network');
  QUnit.equal(this.player.tech_.error().code, 2, 'set a network error');
});

QUnit.test('passes endOfStream decode errors to the tech', function() {
  this.mediaSource.readyState = 'ended';
  this.mediaSource.endOfStream('decode');

  QUnit.equal(this.player.tech_.error().code, 3, 'set a decode error');
});

QUnit.test('has addSeekableRange()', function() {
  QUnit.ok(this.mediaSource.addSeekableRange_, 'has addSeekableRange_');
});

QUnit.test('fires loadedmetadata after first segment append', function() {
  let loadedmetadataCount = 0;

  this.mediaSource.tech_.on('loadedmetadata', () => loadedmetadataCount++);

  let sourceBuffer = this.mediaSource.addSourceBuffer('video/mp2t');

  sourceBuffer.transmuxer_.postMessage = postMessage_;

  QUnit.equal(loadedmetadataCount, 0, 'loadedmetadata not called on buffer creation');
  sourceBuffer.appendBuffer(new Uint8Array([0, 1]));
  QUnit.equal(loadedmetadataCount, 0, 'loadedmetadata not called on segment append');
  timers.runAll();
  QUnit.equal(loadedmetadataCount, 1, 'loadedmetadata fires after first append');
  sourceBuffer.appendBuffer(new Uint8Array([0, 1]));
  timers.runAll();
  QUnit.equal(loadedmetadataCount, 1, 'loadedmetadata does not fire after second append');
});

QUnit.test('cleans up WebVTT cues on hls dispose', function() {
  let sourceBuffer = this.mediaSource.addSourceBuffer('video/mp2t');

  sourceBuffer.transmuxer_.postMessage = postMessage_;

  let addedTracks = [];
  let removedTracks = [];
  let metadata = [{
    cueTime: 2,
    frames: [{
      url: 'This is a url tag'
    }, {
      value: 'This is a text tag'
    }]
  }, {
    cueTime: 12,
    frames: [{
      data: 'This is a priv tag'
    }]
  }];
  let captions = [{
    startTime: 1,
    endTime: 3,
    text: 'This is an in-band caption'
  }];

  metadata.dispatchType = 0x10;
  this.mediaSource.player_ = {
    addRemoteTextTrack(options) {
      let trackEl = {
        track: {
          kind: options.kind,
          label: options.label,
          addCue(cue) {}
        }
      };

      addedTracks.push(trackEl.track);
      return trackEl;
    },
    remoteTextTracks() {
      return addedTracks;
    },
    removeRemoteTextTrack(track) {
      removedTracks.push(track);
    }
  };

  sourceBuffer.transmuxer_.onmessage(createDataMessage([], [], metadata, captions));

  QUnit.equal(addedTracks.length, 2, 'created two text tracks');
  QUnit.equal(addedTracks.filter(t => ['captions', 'metadata'].indexOf(t.kind) === -1).length,
              0,
              'created only the expected two remote TextTracks');

  this.player.tech_.hls.trigger('dispose');

  QUnit.equal(removedTracks.length, 2, 'removed two text tracks');
  QUnit.equal(removedTracks.filter(t => ['captions', 'metadata'].indexOf(t.kind) === -1).length,
              0,
              'removed only the expected two remote TextTracks');
});
