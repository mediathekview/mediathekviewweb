/**
 * @file vtt-segment-loader.js
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _segmentLoader = require('./segment-loader');

var _segmentLoader2 = _interopRequireDefault(_segmentLoader);

var _videoJs = require('video.js');

var _videoJs2 = _interopRequireDefault(_videoJs);

var _globalWindow = require('global/window');

var _globalWindow2 = _interopRequireDefault(_globalWindow);

var _videojsContribMediaSourcesEs5RemoveCuesFromTrackJs = require('videojs-contrib-media-sources/es5/remove-cues-from-track.js');

var _videojsContribMediaSourcesEs5RemoveCuesFromTrackJs2 = _interopRequireDefault(_videojsContribMediaSourcesEs5RemoveCuesFromTrackJs);

var _binUtils = require('./bin-utils');

var VTT_LINE_TERMINATORS = new Uint8Array('\n\n'.split('').map(function (char) {
  return char.charCodeAt(0);
}));

var uintToString = function uintToString(uintArray) {
  return String.fromCharCode.apply(null, uintArray);
};

/**
 * An object that manages segment loading and appending.
 *
 * @class VTTSegmentLoader
 * @param {Object} options required and optional options
 * @extends videojs.EventTarget
 */

var VTTSegmentLoader = (function (_SegmentLoader) {
  _inherits(VTTSegmentLoader, _SegmentLoader);

  function VTTSegmentLoader(options) {
    _classCallCheck(this, VTTSegmentLoader);

    _get(Object.getPrototypeOf(VTTSegmentLoader.prototype), 'constructor', this).call(this, options);

    // SegmentLoader requires a MediaSource be specified or it will throw an error;
    // however, VTTSegmentLoader has no need of a media source, so delete the reference
    this.mediaSource_ = null;

    this.subtitlesTrack_ = null;
  }

  /**
   * Indicates which time ranges are buffered
   *
   * @return {TimeRange}
   *         TimeRange object representing the current buffered ranges
   */

  _createClass(VTTSegmentLoader, [{
    key: 'buffered_',
    value: function buffered_() {
      if (!this.subtitlesTrack_ || !this.subtitlesTrack_.cues.length) {
        return _videoJs2['default'].createTimeRanges();
      }

      var cues = this.subtitlesTrack_.cues;
      var start = cues[0].startTime;
      var end = cues[cues.length - 1].startTime;

      return _videoJs2['default'].createTimeRanges([[start, end]]);
    }

    /**
     * Gets and sets init segment for the provided map
     *
     * @param {Object} map
     *        The map object representing the init segment to get or set
     * @param {Boolean=} set
     *        If true, the init segment for the provided map should be saved
     * @return {Object}
     *         map object for desired init segment
     */
  }, {
    key: 'initSegment',
    value: function initSegment(map) {
      var set = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

      if (!map) {
        return null;
      }

      var id = (0, _binUtils.initSegmentId)(map);
      var storedMap = this.initSegments_[id];

      if (set && !storedMap && map.bytes) {
        // append WebVTT line terminators to the media initialization segment if it exists
        // to follow the WebVTT spec (https://w3c.github.io/webvtt/#file-structure) that
        // requires two or more WebVTT line terminators between the WebVTT header and the rest
        // of the file
        var combinedByteLength = VTT_LINE_TERMINATORS.byteLength + map.bytes.byteLength;
        var combinedSegment = new Uint8Array(combinedByteLength);

        combinedSegment.set(map.bytes);
        combinedSegment.set(VTT_LINE_TERMINATORS, map.bytes.byteLength);

        this.initSegments_[id] = storedMap = {
          resolvedUri: map.resolvedUri,
          byterange: map.byterange,
          bytes: combinedSegment
        };
      }

      return storedMap || map;
    }

    /**
     * Returns true if all configuration required for loading is present, otherwise false.
     *
     * @return {Boolean} True if the all configuration is ready for loading
     * @private
     */
  }, {
    key: 'couldBeginLoading_',
    value: function couldBeginLoading_() {
      return this.playlist_ && this.subtitlesTrack_ && !this.paused();
    }

    /**
     * Once all the starting parameters have been specified, begin
     * operation. This method should only be invoked from the INIT
     * state.
     *
     * @private
     */
  }, {
    key: 'init_',
    value: function init_() {
      this.state = 'READY';
      this.resetEverything();
      return this.monitorBuffer_();
    }

    /**
     * Set a subtitle track on the segment loader to add subtitles to
     *
     * @param {TextTrack} track
     *        The text track to add loaded subtitles to
     */
  }, {
    key: 'track',
    value: function track(_track) {
      this.subtitlesTrack_ = _track;

      // if we were unpaused but waiting for a sourceUpdater, start
      // buffering now
      if (this.state === 'INIT' && this.couldBeginLoading_()) {
        this.init_();
      }
    }

    /**
     * Remove any data in the source buffer between start and end times
     * @param {Number} start - the start time of the region to remove from the buffer
     * @param {Number} end - the end time of the region to remove from the buffer
     */
  }, {
    key: 'remove',
    value: function remove(start, end) {
      (0, _videojsContribMediaSourcesEs5RemoveCuesFromTrackJs2['default'])(start, end, this.subtitlesTrack_);
    }

    /**
     * fill the buffer with segements unless the sourceBuffers are
     * currently updating
     *
     * Note: this function should only ever be called by monitorBuffer_
     * and never directly
     *
     * @private
     */
  }, {
    key: 'fillBuffer_',
    value: function fillBuffer_() {
      var _this = this;

      if (!this.syncPoint_) {
        this.syncPoint_ = this.syncController_.getSyncPoint(this.playlist_, this.duration_(), this.currentTimeline_, this.currentTime_());
      }

      // see if we need to begin loading immediately
      var segmentInfo = this.checkBuffer_(this.buffered_(), this.playlist_, this.mediaIndex, this.hasPlayed_(), this.currentTime_(), this.syncPoint_);

      segmentInfo = this.skipEmptySegments_(segmentInfo);

      if (!segmentInfo) {
        return;
      }

      if (this.syncController_.timestampOffsetForTimeline(segmentInfo.timeline) === null) {
        // We don't have the timestamp offset that we need to sync subtitles.
        // Rerun on a timestamp offset or user interaction.
        var checkTimestampOffset = function checkTimestampOffset() {
          _this.state = 'READY';
          if (!_this.paused()) {
            // if not paused, queue a buffer check as soon as possible
            _this.monitorBuffer_();
          }
        };

        this.syncController_.one('timestampoffset', checkTimestampOffset);
        this.state = 'WAITING_ON_TIMELINE';
        return;
      }

      this.loadSegment_(segmentInfo);
    }

    /**
     * Prevents the segment loader from requesting segments we know contain no subtitles
     * by walking forward until we find the next segment that we don't know whether it is
     * empty or not.
     *
     * @param {Object} segmentInfo
     *        a segment info object that describes the current segment
     * @return {Object}
     *         a segment info object that describes the current segment
     */
  }, {
    key: 'skipEmptySegments_',
    value: function skipEmptySegments_(segmentInfo) {
      while (segmentInfo && segmentInfo.segment.empty) {
        segmentInfo = this.generateSegmentInfo_(segmentInfo.playlist, segmentInfo.mediaIndex + 1, segmentInfo.startOfSegment + segmentInfo.duration, segmentInfo.isSyncRequest);
      }
      return segmentInfo;
    }

    /**
     * append a decrypted segement to the SourceBuffer through a SourceUpdater
     *
     * @private
     */
  }, {
    key: 'handleSegment_',
    value: function handleSegment_() {
      var _this2 = this;

      if (!this.pendingSegment_) {
        this.state = 'READY';
        return;
      }

      this.state = 'APPENDING';

      var segmentInfo = this.pendingSegment_;
      var segment = segmentInfo.segment;

      // Make sure that vttjs has loaded, otherwise, wait till it finished loading
      if (typeof _globalWindow2['default'].WebVTT !== 'function' && this.subtitlesTrack_ && this.subtitlesTrack_.tech_) {
        var _ret = (function () {

          var loadHandler = function loadHandler() {
            _this2.handleSegment_();
          };

          _this2.state = 'WAITING_ON_VTTJS';
          _this2.subtitlesTrack_.tech_.one('vttjsloaded', loadHandler);
          _this2.subtitlesTrack_.tech_.one('vttjserror', function () {
            _this2.subtitlesTrack_.tech_.off('vttjsloaded', loadHandler);
            _this2.error({
              message: 'Error loading vtt.js'
            });
            _this2.state = 'READY';
            _this2.pause();
            _this2.trigger('error');
          });

          return {
            v: undefined
          };
        })();

        if (typeof _ret === 'object') return _ret.v;
      }

      segment.requested = true;

      try {
        this.parseVTTCues_(segmentInfo);
      } catch (e) {
        this.error({
          message: e.message
        });
        this.state = 'READY';
        this.pause();
        return this.trigger('error');
      }

      this.updateTimeMapping_(segmentInfo, this.syncController_.timelines[segmentInfo.timeline], this.playlist_);

      if (segmentInfo.isSyncRequest) {
        this.trigger('syncinfoupdate');
        this.pendingSegment_ = null;
        this.state = 'READY';
        return;
      }

      segmentInfo.byteLength = segmentInfo.bytes.byteLength;

      this.mediaSecondsLoaded += segment.duration;

      segmentInfo.cues.forEach(function (cue) {
        _this2.subtitlesTrack_.addCue(cue);
      });

      this.handleUpdateEnd_();
    }

    /**
     * Uses the WebVTT parser to parse the segment response
     *
     * @param {Object} segmentInfo
     *        a segment info object that describes the current segment
     * @private
     */
  }, {
    key: 'parseVTTCues_',
    value: function parseVTTCues_(segmentInfo) {
      var decoder = undefined;
      var decodeBytesToString = false;

      if (typeof _globalWindow2['default'].TextDecoder === 'function') {
        decoder = new _globalWindow2['default'].TextDecoder('utf8');
      } else {
        decoder = _globalWindow2['default'].WebVTT.StringDecoder();
        decodeBytesToString = true;
      }

      var parser = new _globalWindow2['default'].WebVTT.Parser(_globalWindow2['default'], _globalWindow2['default'].vttjs, decoder);

      segmentInfo.cues = [];
      segmentInfo.timestampmap = { MPEGTS: 0, LOCAL: 0 };

      parser.oncue = segmentInfo.cues.push.bind(segmentInfo.cues);
      parser.ontimestampmap = function (map) {
        return segmentInfo.timestampmap = map;
      };
      parser.onparsingerror = function (error) {
        _videoJs2['default'].log.warn('Error encountered when parsing cues: ' + error.message);
      };

      if (segmentInfo.segment.map) {
        var mapData = segmentInfo.segment.map.bytes;

        if (decodeBytesToString) {
          mapData = uintToString(mapData);
        }

        parser.parse(mapData);
      }

      var segmentData = segmentInfo.bytes;

      if (decodeBytesToString) {
        segmentData = uintToString(segmentData);
      }

      parser.parse(segmentData);
      parser.flush();
    }

    /**
     * Updates the start and end times of any cues parsed by the WebVTT parser using
     * the information parsed from the X-TIMESTAMP-MAP header and a TS to media time mapping
     * from the SyncController
     *
     * @param {Object} segmentInfo
     *        a segment info object that describes the current segment
     * @param {Object} mappingObj
     *        object containing a mapping from TS to media time
     * @param {Object} playlist
     *        the playlist object containing the segment
     * @private
     */
  }, {
    key: 'updateTimeMapping_',
    value: function updateTimeMapping_(segmentInfo, mappingObj, playlist) {
      var segment = segmentInfo.segment;

      if (!mappingObj) {
        // If the sync controller does not have a mapping of TS to Media Time for the
        // timeline, then we don't have enough information to update the cue
        // start/end times
        return;
      }

      if (!segmentInfo.cues.length) {
        // If there are no cues, we also do not have enough information to figure out
        // segment timing. Mark that the segment contains no cues so we don't re-request
        // an empty segment.
        segment.empty = true;
        return;
      }

      var timestampmap = segmentInfo.timestampmap;
      var diff = timestampmap.MPEGTS / 90000 - timestampmap.LOCAL + mappingObj.mapping;

      segmentInfo.cues.forEach(function (cue) {
        // First convert cue time to TS time using the timestamp-map provided within the vtt
        cue.startTime += diff;
        cue.endTime += diff;
      });

      if (!playlist.syncInfo) {
        var firstStart = segmentInfo.cues[0].startTime;
        var lastStart = segmentInfo.cues[segmentInfo.cues.length - 1].startTime;

        playlist.syncInfo = {
          mediaSequence: playlist.mediaSequence + segmentInfo.mediaIndex,
          time: Math.min(firstStart, lastStart - segment.duration)
        };
      }
    }
  }]);

  return VTTSegmentLoader;
})(_segmentLoader2['default']);

exports['default'] = VTTSegmentLoader;
module.exports = exports['default'];