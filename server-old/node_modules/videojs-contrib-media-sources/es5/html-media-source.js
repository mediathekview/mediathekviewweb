/**
 * @file html-media-source.js
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

var _globalWindow = require('global/window');

var _globalWindow2 = _interopRequireDefault(_globalWindow);

var _globalDocument = require('global/document');

var _globalDocument2 = _interopRequireDefault(_globalDocument);

var _videoJs = require('video.js');

var _videoJs2 = _interopRequireDefault(_videoJs);

var _virtualSourceBuffer = require('./virtual-source-buffer');

var _virtualSourceBuffer2 = _interopRequireDefault(_virtualSourceBuffer);

var _addTextTrackData = require('./add-text-track-data');

var _codecUtils = require('./codec-utils');

var _cleanupTextTracks = require('./cleanup-text-tracks');

/**
 * Our MediaSource implementation in HTML, mimics native
 * MediaSource where/if possible.
 *
 * @link https://developer.mozilla.org/en-US/docs/Web/API/MediaSource
 * @class HtmlMediaSource
 * @extends videojs.EventTarget
 */

var HtmlMediaSource = (function (_videojs$EventTarget) {
  _inherits(HtmlMediaSource, _videojs$EventTarget);

  function HtmlMediaSource() {
    var _this = this;

    _classCallCheck(this, HtmlMediaSource);

    _get(Object.getPrototypeOf(HtmlMediaSource.prototype), 'constructor', this).call(this);
    var property = undefined;

    this.nativeMediaSource_ = new _globalWindow2['default'].MediaSource();
    // delegate to the native MediaSource's methods by default
    for (property in this.nativeMediaSource_) {
      if (!(property in HtmlMediaSource.prototype) && typeof this.nativeMediaSource_[property] === 'function') {
        this[property] = this.nativeMediaSource_[property].bind(this.nativeMediaSource_);
      }
    }

    // emulate `duration` and `seekable` until seeking can be
    // handled uniformly for live streams
    // see https://github.com/w3c/media-source/issues/5
    this.duration_ = NaN;
    Object.defineProperty(this, 'duration', {
      get: function get() {
        if (this.duration_ === Infinity) {
          return this.duration_;
        }
        return this.nativeMediaSource_.duration;
      },
      set: function set(duration) {
        this.duration_ = duration;
        if (duration !== Infinity) {
          this.nativeMediaSource_.duration = duration;
          return;
        }
      }
    });
    Object.defineProperty(this, 'seekable', {
      get: function get() {
        if (this.duration_ === Infinity) {
          return _videoJs2['default'].createTimeRanges([[0, this.nativeMediaSource_.duration]]);
        }
        return this.nativeMediaSource_.seekable;
      }
    });

    Object.defineProperty(this, 'readyState', {
      get: function get() {
        return this.nativeMediaSource_.readyState;
      }
    });

    Object.defineProperty(this, 'activeSourceBuffers', {
      get: function get() {
        return this.activeSourceBuffers_;
      }
    });

    // the list of virtual and native SourceBuffers created by this
    // MediaSource
    this.sourceBuffers = [];

    this.activeSourceBuffers_ = [];

    /**
     * update the list of active source buffers based upon various
     * imformation from HLS and video.js
     *
     * @private
     */
    this.updateActiveSourceBuffers_ = function () {
      // Retain the reference but empty the array
      _this.activeSourceBuffers_.length = 0;

      // By default, the audio in the combined virtual source buffer is enabled
      // and the audio-only source buffer (if it exists) is disabled.
      var combined = false;
      var audioOnly = true;

      // TODO: maybe we can store the sourcebuffers on the track objects?
      // safari may do something like this
      for (var i = 0; i < _this.player_.audioTracks().length; i++) {
        var track = _this.player_.audioTracks()[i];

        if (track.enabled && track.kind !== 'main') {
          // The enabled track is an alternate audio track so disable the audio in
          // the combined source buffer and enable the audio-only source buffer.
          combined = true;
          audioOnly = false;
          break;
        }
      }

      // Since we currently support a max of two source buffers, add all of the source
      // buffers (in order).
      _this.sourceBuffers.forEach(function (sourceBuffer) {
        /* eslinst-disable */
        // TODO once codecs are required, we can switch to using the codecs to determine
        //      what stream is the video stream, rather than relying on videoTracks
        /* eslinst-enable */

        sourceBuffer.appendAudioInitSegment_ = true;

        if (sourceBuffer.videoCodec_ && sourceBuffer.audioCodec_) {
          // combined
          sourceBuffer.audioDisabled_ = combined;
        } else if (sourceBuffer.videoCodec_ && !sourceBuffer.audioCodec_) {
          // If the "combined" source buffer is video only, then we do not want
          // disable the audio-only source buffer (this is mostly for demuxed
          // audio and video hls)
          sourceBuffer.audioDisabled_ = true;
          audioOnly = false;
        } else if (!sourceBuffer.videoCodec_ && sourceBuffer.audioCodec_) {
          // audio only
          sourceBuffer.audioDisabled_ = audioOnly;
          if (audioOnly) {
            return;
          }
        }

        _this.activeSourceBuffers_.push(sourceBuffer);
      });
    };

    this.onPlayerMediachange_ = function () {
      _this.sourceBuffers.forEach(function (sourceBuffer) {
        sourceBuffer.appendAudioInitSegment_ = true;
      });
    };

    // Re-emit MediaSource events on the polyfill
    ['sourceopen', 'sourceclose', 'sourceended'].forEach(function (eventName) {
      this.nativeMediaSource_.addEventListener(eventName, this.trigger.bind(this));
    }, this);

    // capture the associated player when the MediaSource is
    // successfully attached
    this.on('sourceopen', function (event) {
      // Get the player this MediaSource is attached to
      var video = _globalDocument2['default'].querySelector('[src="' + _this.url_ + '"]');

      if (!video) {
        return;
      }

      _this.player_ = (0, _videoJs2['default'])(video.parentNode);

      if (_this.player_.audioTracks && _this.player_.audioTracks()) {
        _this.player_.audioTracks().on('change', _this.updateActiveSourceBuffers_);
        _this.player_.audioTracks().on('addtrack', _this.updateActiveSourceBuffers_);
        _this.player_.audioTracks().on('removetrack', _this.updateActiveSourceBuffers_);
      }

      _this.player_.on('mediachange', _this.onPlayerMediachange_);
    });

    this.on('sourceended', function (event) {
      var duration = (0, _addTextTrackData.durationOfVideo)(_this.duration);

      for (var i = 0; i < _this.sourceBuffers.length; i++) {
        var sourcebuffer = _this.sourceBuffers[i];
        var cues = sourcebuffer.metadataTrack_ && sourcebuffer.metadataTrack_.cues;

        if (cues && cues.length) {
          cues[cues.length - 1].endTime = duration;
        }
      }
    });

    // explicitly terminate any WebWorkers that were created
    // by SourceHandlers
    this.on('sourceclose', function (event) {
      this.sourceBuffers.forEach(function (sourceBuffer) {
        if (sourceBuffer.transmuxer_) {
          sourceBuffer.transmuxer_.terminate();
        }
      });

      this.sourceBuffers.length = 0;
      if (!this.player_) {
        return;
      }

      (0, _cleanupTextTracks.cleanupTextTracks)(this.player_);

      if (this.player_.audioTracks && this.player_.audioTracks()) {
        this.player_.audioTracks().off('change', this.updateActiveSourceBuffers_);
        this.player_.audioTracks().off('addtrack', this.updateActiveSourceBuffers_);
        this.player_.audioTracks().off('removetrack', this.updateActiveSourceBuffers_);
      }

      // We can only change this if the player hasn't been disposed of yet
      // because `off` eventually tries to use the el_ property. If it has
      // been disposed of, then don't worry about it because there are no
      // event handlers left to unbind anyway
      if (this.player_.el_) {
        this.player_.off('mediachange', this.onPlayerMediachange_);
      }
    });
  }

  /**
   * Add a range that that can now be seeked to.
   *
   * @param {Double} start where to start the addition
   * @param {Double} end where to end the addition
   * @private
   */

  _createClass(HtmlMediaSource, [{
    key: 'addSeekableRange_',
    value: function addSeekableRange_(start, end) {
      var error = undefined;

      if (this.duration !== Infinity) {
        error = new Error('MediaSource.addSeekableRange() can only be invoked ' + 'when the duration is Infinity');
        error.name = 'InvalidStateError';
        error.code = 11;
        throw error;
      }

      if (end > this.nativeMediaSource_.duration || isNaN(this.nativeMediaSource_.duration)) {
        this.nativeMediaSource_.duration = end;
      }
    }

    /**
     * Add a source buffer to the media source.
     *
     * @link https://developer.mozilla.org/en-US/docs/Web/API/MediaSource/addSourceBuffer
     * @param {String} type the content-type of the content
     * @return {Object} the created source buffer
     */
  }, {
    key: 'addSourceBuffer',
    value: function addSourceBuffer(type) {
      var buffer = undefined;
      var parsedType = (0, _codecUtils.parseContentType)(type);

      // Create a VirtualSourceBuffer to transmux MPEG-2 transport
      // stream segments into fragmented MP4s
      if (/^(video|audio)\/mp2t$/i.test(parsedType.type)) {
        var codecs = [];

        if (parsedType.parameters && parsedType.parameters.codecs) {
          codecs = parsedType.parameters.codecs.split(',');
          codecs = (0, _codecUtils.translateLegacyCodecs)(codecs);
          codecs = codecs.filter(function (codec) {
            return (0, _codecUtils.isAudioCodec)(codec) || (0, _codecUtils.isVideoCodec)(codec);
          });
        }

        if (codecs.length === 0) {
          codecs = ['avc1.4d400d', 'mp4a.40.2'];
        }

        buffer = new _virtualSourceBuffer2['default'](this, codecs);

        if (this.sourceBuffers.length !== 0) {
          // If another VirtualSourceBuffer already exists, then we are creating a
          // SourceBuffer for an alternate audio track and therefore we know that
          // the source has both an audio and video track.
          // That means we should trigger the manual creation of the real
          // SourceBuffers instead of waiting for the transmuxer to return data
          this.sourceBuffers[0].createRealSourceBuffers_();
          buffer.createRealSourceBuffers_();

          // Automatically disable the audio on the first source buffer if
          // a second source buffer is ever created
          this.sourceBuffers[0].audioDisabled_ = true;
        }
      } else {
        // delegate to the native implementation
        buffer = this.nativeMediaSource_.addSourceBuffer(type);
      }

      this.sourceBuffers.push(buffer);
      return buffer;
    }
  }]);

  return HtmlMediaSource;
})(_videoJs2['default'].EventTarget);

exports['default'] = HtmlMediaSource;
module.exports = exports['default'];