/**
 * @file flash-media-source.js
 */
import document from 'global/document';
import videojs from 'video.js';
import FlashSourceBuffer from './flash-source-buffer';
import FlashConstants from './flash-constants';
import {parseContentType} from './codec-utils';
import {cleanupTextTracks} from './cleanup-text-tracks';

/**
 * A flash implmentation of HTML MediaSources and a polyfill
 * for browsers that don't support native or HTML MediaSources..
 *
 * @link https://developer.mozilla.org/en-US/docs/Web/API/MediaSource
 * @class FlashMediaSource
 * @extends videojs.EventTarget
 */
export default class FlashMediaSource extends videojs.EventTarget {
  constructor() {
    super();
    this.sourceBuffers = [];
    this.readyState = 'closed';

    this.on(['sourceopen', 'webkitsourceopen'], (event) => {
      // find the swf where we will push media data
      this.swfObj = document.getElementById(event.swfId);
      this.player_ = videojs(this.swfObj.parentNode);
      this.tech_ = this.swfObj.tech;
      this.readyState = 'open';

      this.tech_.on('seeking', () => {
        let i = this.sourceBuffers.length;

        while (i--) {
          this.sourceBuffers[i].abort();
        }
      });

      if (this.tech_.hls) {
        this.tech_.hls.on('dispose', () => {
          cleanupTextTracks(this.player_);
        });
      }

      // trigger load events
      if (this.swfObj) {
        this.swfObj.vjs_load();
      }
    });
  }

  /**
   * We have this function so that the html and flash interfaces
   * are the same.
   *
   * @private
   */
  addSeekableRange_() {
    // intentional no-op
  }

  /**
   * Create a new flash source buffer and add it to our flash media source.
   *
   * @link https://developer.mozilla.org/en-US/docs/Web/API/MediaSource/addSourceBuffer
   * @param {String} type the content-type of the source
   * @return {Object} the flash source buffer
   */
  addSourceBuffer(type) {
    let parsedType = parseContentType(type);
    let sourceBuffer;

    // if this is an FLV type, we'll push data to flash
    if (parsedType.type === 'video/mp2t') {
      // Flash source buffers
      sourceBuffer = new FlashSourceBuffer(this);
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
  endOfStream(error) {
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

}

/**
  * Set or return the presentation duration.
  *
  * @param {Double} value the duration of the media in seconds
  * @param {Double} the current presentation duration
  * @link http://www.w3.org/TR/media-source/#widl-MediaSource-duration
  */
try {
  Object.defineProperty(FlashMediaSource.prototype, 'duration', {
    /**
     * Return the presentation duration.
     *
     * @return {Double} the duration of the media in seconds
     * @link http://www.w3.org/TR/media-source/#widl-MediaSource-duration
     */
    get() {
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
    set(value) {
      let i;
      let oldDuration = this.swfObj.vjs_getProperty('duration');

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

for (let property in FlashConstants) {
  FlashMediaSource[property] = FlashConstants[property];
}

