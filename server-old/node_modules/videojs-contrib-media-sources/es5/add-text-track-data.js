/**
 * @file add-text-track-data.js
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _globalWindow = require('global/window');

var _globalWindow2 = _interopRequireDefault(_globalWindow);

var _videoJs = require('video.js');

var _videoJs2 = _interopRequireDefault(_videoJs);

/**
 * Define properties on a cue for backwards compatability,
 * but warn the user that the way that they are using it
 * is depricated and will be removed at a later date.
 *
 * @param {Cue} cue the cue to add the properties on
 * @private
 */
var deprecateOldCue = function deprecateOldCue(cue) {
  Object.defineProperties(cue.frame, {
    id: {
      get: function get() {
        _videoJs2['default'].log.warn('cue.frame.id is deprecated. Use cue.value.key instead.');
        return cue.value.key;
      }
    },
    value: {
      get: function get() {
        _videoJs2['default'].log.warn('cue.frame.value is deprecated. Use cue.value.data instead.');
        return cue.value.data;
      }
    },
    privateData: {
      get: function get() {
        _videoJs2['default'].log.warn('cue.frame.privateData is deprecated. Use cue.value.data instead.');
        return cue.value.data;
      }
    }
  });
};

var durationOfVideo = function durationOfVideo(duration) {
  var dur = undefined;

  if (isNaN(duration) || Math.abs(duration) === Infinity) {
    dur = Number.MAX_VALUE;
  } else {
    dur = duration;
  }
  return dur;
};
/**
 * Add text track data to a source handler given the captions and
 * metadata from the buffer.
 *
 * @param {Object} sourceHandler the flash or virtual source buffer
 * @param {Array} captionArray an array of caption data
 * @param {Array} cue an array of meta data
 * @private
 */
var addTextTrackData = function addTextTrackData(sourceHandler, captionArray, metadataArray) {
  var Cue = _globalWindow2['default'].WebKitDataCue || _globalWindow2['default'].VTTCue;

  if (captionArray) {
    captionArray.forEach(function (caption) {
      this.inbandTextTrack_.addCue(new Cue(caption.startTime + this.timestampOffset, caption.endTime + this.timestampOffset, caption.text));
    }, sourceHandler);
  }

  if (metadataArray) {
    (function () {
      var videoDuration = durationOfVideo(sourceHandler.mediaSource_.duration);

      metadataArray.forEach(function (metadata) {
        var time = metadata.cueTime + this.timestampOffset;

        metadata.frames.forEach(function (frame) {
          var cue = new Cue(time, time, frame.value || frame.url || frame.data || '');

          cue.frame = frame;
          cue.value = frame;
          deprecateOldCue(cue);

          this.metadataTrack_.addCue(cue);
        }, this);
      }, sourceHandler);

      // Updating the metadeta cues so that
      // the endTime of each cue is the startTime of the next cue
      // the endTime of last cue is the duration of the video
      if (sourceHandler.metadataTrack_ && sourceHandler.metadataTrack_.cues && sourceHandler.metadataTrack_.cues.length) {
        (function () {
          var cues = sourceHandler.metadataTrack_.cues;
          var cuesArray = [];

          // Create a copy of the TextTrackCueList...
          // ...disregarding cues with a falsey value
          for (var i = 0; i < cues.length; i++) {
            if (cues[i]) {
              cuesArray.push(cues[i]);
            }
          }

          // Group cues by their startTime value
          var cuesGroupedByStartTime = cuesArray.reduce(function (obj, cue) {
            var timeSlot = obj[cue.startTime] || [];

            timeSlot.push(cue);
            obj[cue.startTime] = timeSlot;

            return obj;
          }, {});

          // Sort startTimes by ascending order
          var sortedStartTimes = Object.keys(cuesGroupedByStartTime).sort(function (a, b) {
            return Number(a) - Number(b);
          });

          // Map each cue group's endTime to the next group's startTime
          sortedStartTimes.forEach(function (startTime, idx) {
            var cueGroup = cuesGroupedByStartTime[startTime];
            var nextTime = Number(sortedStartTimes[idx + 1]) || videoDuration;

            // Map each cue's endTime the next group's startTime
            cueGroup.forEach(function (cue) {
              cue.endTime = nextTime;
            });
          });
        })();
      }
    })();
  }
};

exports['default'] = {
  addTextTrackData: addTextTrackData,
  durationOfVideo: durationOfVideo
};
module.exports = exports['default'];