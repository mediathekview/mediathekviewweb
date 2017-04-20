/**
 * @file flash-media-source.js
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _globalDocument = require('global/document');

var _globalDocument2 = _interopRequireDefault(_globalDocument);

var _videoJs = require('video.js');

var _videoJs2 = _interopRequireDefault(_videoJs);

var _flashSourceBuffer = require('./flash-source-buffer');

var _flashSourceBuffer2 = _interopRequireDefault(_flashSourceBuffer);

var _flashConstants = require('./flash-constants');

var _flashConstants2 = _interopRequireDefault(_flashConstants);

var _codecUtils = require('./codec-utils');

var _cleanupTextTracks = require('./cleanup-text-tracks');

/**
 * A flash implmentation of HTML MediaSources and a polyfill
 * for browsers that don't support native or HTML MediaSources..
 *
 * @link https://developer.mozilla.org/en-US/docs/Web/API/MediaSource
 * @class FlashMediaSource
 * @extends videojs.EventTarget
 */

var FlashMediaSource = (function (_videojs$EventTarget) {
  _inherits(FlashMediaSource, _videojs$EventTarget);

  function FlashMediaSource() {
    var _this = this;

    _classCallCheck(this, FlashMediaSource);

    _get(Object.getPrototypeOf(FlashMediaSource.prototype), 'constructor', this).call(this);
    this.sourceBuffers = [];
    this.readyState = 'closed';

    this.on(['sourceopen', 'webkitsourceopen'], function (event) {
      // find the swf where we will push media data
      _this.swfObj = _globalDocument2['default'].getElementById(event.swfId);
      _this.player_ = (0, _videoJs2['default'])(_this.swfObj.parentNode);
      _this.tech_ = _this.swfObj.tech;
      _this.readyState = 'open';

      _this.tech_.on('seeking', function () {
        var i = _this.sourceBuffers.length;

        while (i--) {
          _this.sourceBuffers[i].abort();
        }
      });

      if (_this.tech_.hls) {
        _this.tech_.hls.on('dispose', function () {
          (0, _cleanupTextTracks.cleanupTextTracks)(_this.player_);
        });
      }

      // trigger load events
      if (_this.swfObj) {
        _this.swfObj.vjs_load();
      }
    });
  }

  /**
    * Set or return the presentation duration.
    *
    * @param {Double} value the duration of the media in seconds
    * @param {Double} the current presentation duration
    * @link http://www.w3.org/TR/media-source/#widl-MediaSource-duration
    */

  /**
   * We have this function so that the html and flash interfaces
   * are the same.
   *
   * @private
   */

  _createClass(FlashMediaSource, [{
    key: 'addSeekableRange_',
    value: function addSeekableRange_() {}
    // intentional no-op

    /**
     * Create a new flash source buffer and add it to our flash media source.
     *
     * @link https://developer.mozilla.org/en-US/docs/Web/API/MediaSource/addSourceBuffer
     * @param {String} type the content-type of the source
     * @return {Object} the flash source buffer
     */

  }, {
    key: 'addSourceBuffer',
    value: function addSourceBuffer(type) {
      var parsedType = (0, _codecUtils.parseContentType)(type);
      var sourceBuffer = undefined;

      // if this is an FLV type, we'll push data to flash
      if (parsedType.type === 'video/mp2t') {
        // Flash source buffers
        sourceBuffer = new _flashSourceBuffer2['default'](this);
      } else {
        throw new Error('NotSupportedError (Video.js)');
      }

      this.sourceBuffers.push(sourceBuffer);
      return sourceBuffer;
    }

    /**
     * Signals the end of the stream.
     *
     * @link https://w3c.github.io/media-source/#widl-MediaSource-endOfStream-void-EndOfStreamError-error
     * @param {String=} error Signals that a playback error
     * has occurred. If specified, it must be either "network" or
     * "decode".
     */
  }, {
    key: 'endOfStream',
    value: function endOfStream(error) {
      if (error === 'network') {
        // MEDIA_ERR_NETWORK
        this.tech_.error(2);
      } else if (error === 'decode') {
        // MEDIA_ERR_DECODE
        this.tech_.error(3);
      }
      if (this.readyState !== 'ended') {
        this.readyState = 'ended';
        this.swfObj.vjs_endOfStream();
      }
    }
  }]);

  return FlashMediaSource;
})(_videoJs2['default'].EventTarget);

exports['default'] = FlashMediaSource;
try {
  Object.defineProperty(FlashMediaSource.prototype, 'duration', {
    /**
     * Return the presentation duration.
     *
     * @return {Double} the duration of the media in seconds
     * @link http://www.w3.org/TR/media-source/#widl-MediaSource-duration
     */
    get: function get() {
      if (!this.swfObj) {
        return NaN;
      }
      // get the current duration from the SWF
      return this.swfObj.vjs_getProperty('duration');
    },
    /**
     * Set the presentation duration.
     *
     * @param {Double} value the duration of the media in seconds
     * @return {Double} the duration of the media in seconds
     * @link http://www.w3.org/TR/media-source/#widl-MediaSource-duration
     */
    set: function set(value) {
      var i = undefined;
      var oldDuration = this.swfObj.vjs_getProperty('duration');

      this.swfObj.vjs_setProperty('duration', value);

      if (value < oldDuration) {
        // In MSE, this triggers the range removal algorithm which causes
        // an update to occur
        for (i = 0; i < this.sourceBuffers.length; i++) {
          this.sourceBuffers[i].remove(value, oldDuration);
        }
      }

      return value;
    }
  });
} catch (e) {
  // IE8 throws if defineProperty is called on a non-DOM node. We
  // don't support IE8 but we shouldn't throw an error if loaded
  // there.
  FlashMediaSource.prototype.duration = NaN;
}

for (var property in _flashConstants2['default']) {
  FlashMediaSource[property] = _flashConstants2['default'][property];
}
module.exports = exports['default'];