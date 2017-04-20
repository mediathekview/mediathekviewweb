/**
 * @file playback-watcher.js
 *
 * Playback starts, and now my watch begins. It shall not end until my death. I shall
 * take no wait, hold no uncleared timeouts, father no bad seeks. I shall wear no crowns
 * and win no glory. I shall live and die at my post. I am the corrector of the underflow.
 * I am the watcher of gaps. I am the shield that guards the realms of seekable. I pledge
 * my life and honor to the Playback Watch, for this Player and all the Players to come.
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _ranges = require('./ranges');

var _ranges2 = _interopRequireDefault(_ranges);

var _videoJs = require('video.js');

var _videoJs2 = _interopRequireDefault(_videoJs);

// Set of events that reset the playback-watcher time check logic and clear the timeout
var timerCancelEvents = ['seeking', 'seeked', 'pause', 'playing', 'error'];

/**
 * @class PlaybackWatcher
 */

var PlaybackWatcher = (function () {
  /**
   * Represents an PlaybackWatcher object.
   * @constructor
   * @param {object} options an object that includes the tech and settings
   */

  function PlaybackWatcher(options) {
    var _this = this;

    _classCallCheck(this, PlaybackWatcher);

    this.tech_ = options.tech;
    this.seekable = options.seekable;

    this.consecutiveUpdates = 0;
    this.lastRecordedTime = null;
    this.timer_ = null;
    this.checkCurrentTimeTimeout_ = null;

    if (options.debug) {
      this.logger_ = _videoJs2['default'].log.bind(_videoJs2['default'], 'playback-watcher ->');
    }
    this.logger_('initialize');

    var waitingHandler = function waitingHandler() {
      return _this.waiting_();
    };
    var cancelTimerHandler = function cancelTimerHandler() {
      return _this.cancelTimer_();
    };
    var fixesBadSeeksHandler = function fixesBadSeeksHandler() {
      return _this.fixesBadSeeks_();
    };

    this.tech_.on('seekablechanged', fixesBadSeeksHandler);
    this.tech_.on('waiting', waitingHandler);
    this.tech_.on(timerCancelEvents, cancelTimerHandler);
    this.monitorCurrentTime_();

    // Define the dispose function to clean up our events
    this.dispose = function () {
      _this.logger_('dispose');
      _this.tech_.off('seekablechanged', fixesBadSeeksHandler);
      _this.tech_.off('waiting', waitingHandler);
      _this.tech_.off(timerCancelEvents, cancelTimerHandler);
      if (_this.checkCurrentTimeTimeout_) {
        clearTimeout(_this.checkCurrentTimeTimeout_);
      }
      _this.cancelTimer_();
    };
  }

  /**
   * Periodically check current time to see if playback stopped
   *
   * @private
   */

  _createClass(PlaybackWatcher, [{
    key: 'monitorCurrentTime_',
    value: function monitorCurrentTime_() {
      this.checkCurrentTime_();

      if (this.checkCurrentTimeTimeout_) {
        clearTimeout(this.checkCurrentTimeTimeout_);
      }

      // 42 = 24 fps // 250 is what Webkit uses // FF uses 15
      this.checkCurrentTimeTimeout_ = setTimeout(this.monitorCurrentTime_.bind(this), 250);
    }

    /**
     * The purpose of this function is to emulate the "waiting" event on
     * browsers that do not emit it when they are waiting for more
     * data to continue playback
     *
     * @private
     */
  }, {
    key: 'checkCurrentTime_',
    value: function checkCurrentTime_() {
      if (this.tech_.seeking() && this.fixesBadSeeks_()) {
        this.consecutiveUpdates = 0;
        this.lastRecordedTime = this.tech_.currentTime();
        return;
      }

      if (this.tech_.paused() || this.tech_.seeking()) {
        return;
      }

      var currentTime = this.tech_.currentTime();

      if (this.consecutiveUpdates >= 5 && currentTime === this.lastRecordedTime) {
        this.consecutiveUpdates++;
        this.waiting_();
      } else if (currentTime === this.lastRecordedTime) {
        this.consecutiveUpdates++;
      } else {
        this.consecutiveUpdates = 0;
        this.lastRecordedTime = currentTime;
      }
    }

    /**
     * Cancels any pending timers and resets the 'timeupdate' mechanism
     * designed to detect that we are stalled
     *
     * @private
     */
  }, {
    key: 'cancelTimer_',
    value: function cancelTimer_() {
      this.consecutiveUpdates = 0;

      if (this.timer_) {
        this.logger_('cancelTimer_');
        clearTimeout(this.timer_);
      }

      this.timer_ = null;
    }

    /**
     * Fixes situations where there's a bad seek
     *
     * @return {Boolean} whether an action was taken to fix the seek
     * @private
     */
  }, {
    key: 'fixesBadSeeks_',
    value: function fixesBadSeeks_() {
      var seekable = this.seekable();
      var currentTime = this.tech_.currentTime();

      if (this.tech_.seeking() && this.outsideOfSeekableWindow_(seekable, currentTime)) {
        var seekableEnd = seekable.end(seekable.length - 1);

        // sync to live point (if VOD, our seekable was updated and we're simply adjusting)
        this.logger_('Trying to seek outside of seekable at time ' + currentTime + ' with ' + ('seekable range ' + _ranges2['default'].printableRange(seekable) + '. Seeking to ') + (seekableEnd + '.'));
        this.tech_.setCurrentTime(seekableEnd);
        return true;
      }

      return false;
    }

    /**
     * Handler for situations when we determine the player is waiting
     *
     * @private
     */
  }, {
    key: 'waiting_',
    value: function waiting_() {
      var seekable = this.seekable();
      var currentTime = this.tech_.currentTime();

      if (this.tech_.seeking() && this.fixesBadSeeks_()) {
        return;
      }

      if (this.tech_.seeking() || this.timer_ !== null) {
        return;
      }

      if (this.fellOutOfLiveWindow_(seekable, currentTime)) {
        var livePoint = seekable.end(seekable.length - 1);

        this.logger_('Fell out of live window at time ' + currentTime + '. Seeking to ' + ('live point (seekable end) ' + livePoint));
        this.cancelTimer_();
        this.tech_.setCurrentTime(livePoint);

        // live window resyncs may be useful for monitoring QoS
        this.tech_.trigger('liveresync');
        return;
      }

      var buffered = this.tech_.buffered();
      var nextRange = _ranges2['default'].findNextRange(buffered, currentTime);

      if (this.videoUnderflow_(nextRange, buffered, currentTime)) {
        // Even though the video underflowed and was stuck in a gap, the audio overplayed
        // the gap, leading currentTime into a buffered range. Seeking to currentTime
        // allows the video to catch up to the audio position without losing any audio
        // (only suffering ~3 seconds of frozen video and a pause in audio playback).
        this.cancelTimer_();
        this.tech_.setCurrentTime(currentTime);

        // video underflow may be useful for monitoring QoS
        this.tech_.trigger('videounderflow');
        return;
      }

      // check for gap
      if (nextRange.length > 0) {
        var difference = nextRange.start(0) - currentTime;

        this.logger_('Stopped at ' + currentTime + ', setting timer for ' + difference + ', seeking ' + ('to ' + nextRange.start(0)));

        this.timer_ = setTimeout(this.skipTheGap_.bind(this), difference * 1000, currentTime);
      }
    }
  }, {
    key: 'outsideOfSeekableWindow_',
    value: function outsideOfSeekableWindow_(seekable, currentTime) {
      if (!seekable.length) {
        // we can't make a solid case if there's no seekable, default to false
        return false;
      }

      // provide a buffer of .1 seconds to handle rounding/imprecise numbers
      if (currentTime < seekable.start(0) - 0.1 || currentTime > seekable.end(seekable.length - 1) + 0.1) {
        return true;
      }

      return false;
    }
  }, {
    key: 'fellOutOfLiveWindow_',
    value: function fellOutOfLiveWindow_(seekable, currentTime) {
      if (seekable.length &&
      // can't fall before 0 and 0 seekable start identifies VOD stream
      seekable.start(0) > 0 && currentTime < seekable.start(0)) {
        return true;
      }

      return false;
    }
  }, {
    key: 'videoUnderflow_',
    value: function videoUnderflow_(nextRange, buffered, currentTime) {
      if (nextRange.length === 0) {
        // Even if there is no available next range, there is still a possibility we are
        // stuck in a gap due to video underflow.
        var gap = this.gapFromVideoUnderflow_(buffered, currentTime);

        if (gap) {
          this.logger_('Encountered a gap in video from ' + gap.start + ' to ' + gap.end + '. ' + ('Seeking to current time ' + currentTime));

          return true;
        }
      }

      return false;
    }

    /**
     * Timer callback. If playback still has not proceeded, then we seek
     * to the start of the next buffered region.
     *
     * @private
     */
  }, {
    key: 'skipTheGap_',
    value: function skipTheGap_(scheduledCurrentTime) {
      var buffered = this.tech_.buffered();
      var currentTime = this.tech_.currentTime();
      var nextRange = _ranges2['default'].findNextRange(buffered, currentTime);

      this.cancelTimer_();

      if (nextRange.length === 0 || currentTime !== scheduledCurrentTime) {
        return;
      }

      this.logger_('skipTheGap_:', 'currentTime:', currentTime, 'scheduled currentTime:', scheduledCurrentTime, 'nextRange start:', nextRange.start(0));

      // only seek if we still have not played
      this.tech_.setCurrentTime(nextRange.start(0) + _ranges2['default'].TIME_FUDGE_FACTOR);
    }
  }, {
    key: 'gapFromVideoUnderflow_',
    value: function gapFromVideoUnderflow_(buffered, currentTime) {
      // At least in Chrome, if there is a gap in the video buffer, the audio will continue
      // playing for ~3 seconds after the video gap starts. This is done to account for
      // video buffer underflow/underrun (note that this is not done when there is audio
      // buffer underflow/underrun -- in that case the video will stop as soon as it
      // encounters the gap, as audio stalls are more noticeable/jarring to a user than
      // video stalls). The player's time will reflect the playthrough of audio, so the
      // time will appear as if we are in a buffered region, even if we are stuck in a
      // "gap."
      //
      // Example:
      // video buffer:   0 => 10.1, 10.2 => 20
      // audio buffer:   0 => 20
      // overall buffer: 0 => 10.1, 10.2 => 20
      // current time: 13
      //
      // Chrome's video froze at 10 seconds, where the video buffer encountered the gap,
      // however, the audio continued playing until it reached ~3 seconds past the gap
      // (13 seconds), at which point it stops as well. Since current time is past the
      // gap, findNextRange will return no ranges.
      //
      // To check for this issue, we see if there is a gap that starts somewhere within
      // a 3 second range (3 seconds +/- 1 second) back from our current time.
      var gaps = _ranges2['default'].findGaps(buffered);

      for (var i = 0; i < gaps.length; i++) {
        var start = gaps.start(i);
        var end = gaps.end(i);

        // gap is starts no more than 4 seconds back
        if (currentTime - start < 4 && currentTime - start > 2) {
          return {
            start: start,
            end: end
          };
        }
      }

      return null;
    }

    /**
     * A debugging logger noop that is set to console.log only if debugging
     * is enabled globally
     *
     * @private
     */
  }, {
    key: 'logger_',
    value: function logger_() {}
  }]);

  return PlaybackWatcher;
})();

exports['default'] = PlaybackWatcher;
module.exports = exports['default'];