import document from 'global/document';
import window from 'global/window';
import QUnit from 'qunit';
import sinon from 'sinon';
import videojs from 'video.js';
import FlashMediaSource from '../src/flash-media-source';
import HtmlMediaSource from '../src/html-media-source';

// we disable this because browserify needs to include these files
// but the exports are not important
/* eslint-disable no-unused-vars */
import {MediaSource, URL} from '../src/videojs-contrib-media-sources.js';
/* eslint-disable no-unused-vars */

QUnit.test('the environment is sane', function(assert) {
  assert.strictEqual(typeof Array.isArray, 'function', 'es5 exists');
  assert.strictEqual(typeof sinon, 'object', 'sinon exists');
  assert.strictEqual(typeof videojs, 'function', 'videojs exists');
  assert.strictEqual(typeof videojs.MediaSource, 'function', 'plugin is a function');
});

QUnit.module('videojs-contrib-media-sources - General', {
  beforeEach() {
    this.fixture = document.getElementById('qunit-fixture');
    this.video = document.createElement('video');
    this.fixture.appendChild(this.video);
    this.player = videojs(this.video);

    // Mock the environment's timers because certain things - particularly
    // player readiness - are asynchronous in video.js 5.
    this.clock = sinon.useFakeTimers();
    this.oldMediaSource = window.MediaSource || window.WebKitMediaSource;
  },

  afterEach() {

    // The clock _must_ be restored before disposing the player; otherwise,
    // certain timeout listeners that happen inside video.js may throw errors.
    this.clock.restore();
    this.player.dispose();
    window.MediaSource = window.WebKitMediaSource = this.oldMediaSource;
  }
});

QUnit.test('Plugin is registered', function(assert) {
  assert.strictEqual(
    typeof videojs.MediaSource,
    'function',
    'MediaSource plugin is attached to videojs'
  );
  assert.strictEqual(
    typeof videojs.URL,
    'object',
    'URL plugin is attached to player'
  );
});

QUnit.test('implementation selection is overridable', function() {
  // mock native MediaSources
  window.MediaSource = videojs.extend(videojs.EventTarget, {
    addSourceBuffer() {
      throw new Error('Testing Mock');
    }
  });

  window.MediaSource.isTypeSupported = function(mime) {
    return true;
  };

  QUnit.ok(
    new videojs.MediaSource({ mode: 'flash' }) instanceof FlashMediaSource,
    'forced flash'
  );

  QUnit.ok(
      new videojs.MediaSource({ mode: 'html5' }) instanceof HtmlMediaSource,
    'forced html5'
  );

  // 'auto' should use native mediasources when they're available
  QUnit.ok(
    new videojs.MediaSource() instanceof HtmlMediaSource,
    'used html5'
  );

  window.MediaSource.isTypeSupported = function(mime) {
    return false;
  };

  // 'auto' should use flash when native mediasources are not available
  QUnit.ok(
    new videojs.MediaSource() instanceof FlashMediaSource,
      'used flash'
  );
});
