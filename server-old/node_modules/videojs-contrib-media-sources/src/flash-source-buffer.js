/**
 * @file flash-source-buffer.js
 */
import window from 'global/window';
import videojs from 'video.js';
import flv from 'mux.js/lib/flv';
import removeCuesFromTrack from './remove-cues-from-track';
import createTextTracksIfNecessary from './create-text-tracks-if-necessary';
import {addTextTrackData} from './add-text-track-data';
import transmuxWorker from './flash-transmuxer-worker';
import work from 'webworkify';
import FlashConstants from './flash-constants';

/**
 * A wrapper around the setTimeout function that uses
 * the flash constant time between ticks value.
 *
 * @param {Function} func the function callback to run
 * @private
 */
const scheduleTick = function(func) {
  // Chrome doesn't invoke requestAnimationFrame callbacks
  // in background tabs, so use setTimeout.
  window.setTimeout(func, FlashConstants.TIME_BETWEEN_CHUNKS);
};

/**
 * Generates a random string of max length 6
 *
 * @return {String} the randomly generated string
 * @function generateRandomString
 * @private
 */
const generateRandomString = function() {
  return (Math.random().toString(36)).slice(2, 8);
};

/**
 * Round a number to a specified number of places much like
 * toFixed but return a number instead of a string representation.
 *
 * @param {Number} num A number
 * @param {Number} places The number of decimal places which to
 * round
 * @private
 */
const toDecimalPlaces = function(num, places) {
  if (typeof places !== 'number' || places < 0) {
    places = 0;
  }

  let scale = Math.pow(10, places);

  return Math.round(num * scale) / scale;
};

/**
 * A SourceBuffer implementation for Flash rather than HTML.
 *
 * @link https://developer.mozilla.org/en-US/docs/Web/API/MediaSource
 * @param {Object} mediaSource the flash media source
 * @class FlashSourceBuffer
 * @extends videojs.EventTarget
 */
export default class FlashSourceBuffer extends videojs.EventTarget {
  constructor(mediaSource) {
    super();
    let encodedHeader;

    // Start off using the globally defined value but refine
    // as we append data into flash
    this.chunkSize_ = FlashConstants.BYTES_PER_CHUNK;

    // byte arrays queued to be appended
    this.buffer_ = [];

    // the total number of queued bytes
    this.bufferSize_ = 0;

    // to be able to determine the correct position to seek to, we
    // need to retain information about the mapping between the
    // media timeline and PTS values
    this.basePtsOffset_ = NaN;

    this.mediaSource_ = mediaSource;

    this.audioBufferEnd_ = NaN;
    this.videoBufferEnd_ = NaN;

    // indicates whether the asynchronous continuation of an operation
    // is still being processed
    // see https://w3c.github.io/media-source/#widl-SourceBuffer-updating
    this.updating = false;
    this.timestampOffset_ = 0;

    encodedHeader = window.btoa(
      String.fromCharCode.apply(
        null,
        Array.prototype.slice.call(
          flv.getFlvHeader()
        )
      )
    );

    // create function names with added randomness for the global callbacks flash will use
    // to get data from javascript into the swf. Random strings are added as a safety
    // measure for pages with multiple players since these functions will be global
    // instead of per instance. When making a call to the swf, the browser generates a
    // try catch code snippet, but just takes the function name and writes out an unquoted
    // call to that function. If the player id has any special characters, this will result
    // in an error, so safePlayerId replaces all special characters to '_'
    const safePlayerId = this.mediaSource_.player_.id().replace(/[^a-zA-Z0-9]/g, '_');

    this.flashEncodedHeaderName_ = 'vjs_flashEncodedHeader_' +
                                   safePlayerId +
                                   generateRandomString();
    this.flashEncodedDataName_ = 'vjs_flashEncodedData_' +
                                   safePlayerId +
                                   generateRandomString();

    window[this.flashEncodedHeaderName_] = () => {
      delete window[this.flashEncodedHeaderName_];
      return encodedHeader;
    };

    this.mediaSource_.swfObj.vjs_appendChunkReady(this.flashEncodedHeaderName_);

    this.transmuxer_ = work(transmuxWorker);
    this.transmuxer_.postMessage({ action: 'init', options: {} });
    this.transmuxer_.onmessage = (event) => {
      if (event.data.action === 'data') {
        this.receiveBuffer_(event.data.segment);
      }
    };

    this.one('updateend', () => {
      this.mediaSource_.tech_.trigger('loadedmetadata');
    });

    Object.defineProperty(this, 'timestampOffset', {
      get() {
        return this.timestampOffset_;
      },
      set(val) {
        if (typeof val === 'number' && val >= 0) {
          this.timestampOffset_ = val;
          // We have to tell flash to expect a discontinuity
          this.mediaSource_.swfObj.vjs_discontinuity();
          // the media <-> PTS mapping must be re-established after
          // the discontinuity
          this.basePtsOffset_ = NaN;
          this.audioBufferEnd_ = NaN;
          this.videoBufferEnd_ = NaN;

          this.transmuxer_.postMessage({ action: 'reset' });
        }
      }
    });

    Object.defineProperty(this, 'buffered', {
      get() {
        if (!this.mediaSource_ ||
            !this.mediaSource_.swfObj ||
            !('vjs_getProperty' in this.mediaSource_.swfObj)) {
          return videojs.createTimeRange();
        }

        let buffered = this.mediaSource_.swfObj.vjs_getProperty('buffered');

        if (buffered && buffered.length) {
          buffered[0][0] = toDecimalPlaces(buffered[0][0], 3);
          buffered[0][1] = toDecimalPlaces(buffered[0][1], 3);
        }
        return videojs.createTimeRanges(buffered);
      }
    });

    // On a seek we remove all text track data since flash has no concept
    // of a buffered-range and everything else is reset on seek
    this.mediaSource_.player_.on('seeked', () => {
      removeCuesFromTrack(0, Infinity, this.metadataTrack_);
      removeCuesFromTrack(0, Infinity, this.inbandTextTrack_);
    });

    this.mediaSource_.player_.tech_.hls.on('dispose', () => {
      this.transmuxer_.terminate();
    });
  }

  /**
   * Append bytes to the sourcebuffers buffer, in this case we
   * have to append it to swf object.
   *
   * @link https://developer.mozilla.org/en-US/docs/Web/API/SourceBuffer/appendBuffer
   * @param {Array} bytes
   */
  appendBuffer(bytes) {
    let error;

    if (this.updating) {
      error = new Error('SourceBuffer.append() cannot be called ' +
                        'while an update is in progress');
      error.name = 'InvalidStateError';
      error.code = 11;
      throw error;
    }
    this.updating = true;
    this.mediaSource_.readyState = 'open';
    this.trigger({ type: 'update' });

    this.transmuxer_.postMessage({
      action: 'push',
      data: bytes.buffer,
      byteOffset: bytes.byteOffset,
      byteLength: bytes.byteLength
    }, [bytes.buffer]);
    this.transmuxer_.postMessage({action: 'flush'});
  }

  /**
   * Reset the parser and remove any data queued to be sent to the SWF.
   *
   * @link https://developer.mozilla.org/en-US/docs/Web/API/SourceBuffer/abort
   */
  abort() {
    this.buffer_ = [];
    this.bufferSize_ = 0;
    this.mediaSource_.swfObj.vjs_abort();

    // report any outstanding updates have ended
    if (this.updating) {
      this.updating = false;
      this.trigger({ type: 'updateend' });
    }
  }

  /**
   * Flash cannot remove ranges already buffered in the NetStream
   * but seeking clears the buffer entirely. For most purposes,
   * having this operation act as a no-op is acceptable.
   *
   * @link https://developer.mozilla.org/en-US/docs/Web/API/SourceBuffer/remove
   * @param {Double} start start of the section to remove
   * @param {Double} end end of the section to remove
   */
  remove(start, end) {
    removeCuesFromTrack(start, end, this.metadataTrack_);
    removeCuesFromTrack(start, end, this.inbandTextTrack_);
    this.trigger({ type: 'update' });
    this.trigger({ type: 'updateend' });
  }

  /**
   * Receive a buffer from the flv.
   *
   * @param {Object} segment
   * @private
   */
  receiveBuffer_(segment) {
    // create an in-band caption track if one is present in the segment
    createTextTracksIfNecessary(this, this.mediaSource_, segment);
    addTextTrackData(this, segment.captions, segment.metadata);

    // Do this asynchronously since convertTagsToData_ can be time consuming
    scheduleTick(() => {
      let flvBytes = this.convertTagsToData_(segment);

      if (this.buffer_.length === 0) {
        scheduleTick(this.processBuffer_.bind(this));
      }

      if (flvBytes) {
        this.buffer_.push(flvBytes);
        this.bufferSize_ += flvBytes.byteLength;
      }
    });
  }

  /**
   * Append a portion of the current buffer to the SWF.
   *
   * @private
   */
  processBuffer_() {
    let chunkSize = FlashConstants.BYTES_PER_CHUNK;

    if (!this.buffer_.length) {
      if (this.updating !== false) {
        this.updating = false;
        this.trigger({ type: 'updateend' });
      }
      // do nothing if the buffer is empty
      return;
    }

    // concatenate appends up to the max append size
    let chunk = this.buffer_[0].subarray(0, chunkSize);

    // requeue any bytes that won't make it this round
    if (chunk.byteLength < chunkSize ||
        this.buffer_[0].byteLength === chunkSize) {
      this.buffer_.shift();
    } else {
      this.buffer_[0] = this.buffer_[0].subarray(chunkSize);
    }

    this.bufferSize_ -= chunk.byteLength;

    // base64 encode the bytes
    let binary = [];
    let length = chunk.byteLength;

    for (let i = 0; i < length; i++) {
      binary.push(String.fromCharCode(chunk[i]));
    }
    let b64str = window.btoa(binary.join(''));

    window[this.flashEncodedDataName_] = () => {
      // schedule another processBuffer to process any left over data or to
      // trigger updateend
      scheduleTick(this.processBuffer_.bind(this));
      delete window[this.flashEncodedDataName_];
      return b64str;
    };

    // Notify the swf that segment data is ready to be appended
    this.mediaSource_.swfObj.vjs_appendChunkReady(this.flashEncodedDataName_);
  }

  /**
   * Turns an array of flv tags into a Uint8Array representing the
   * flv data. Also removes any tags that are before the current
   * time so that playback begins at or slightly after the right
   * place on a seek
   *
   * @private
   * @param {Object} segmentData object of segment data
   */
  convertTagsToData_(segmentData) {
    let segmentByteLength = 0;
    let tech = this.mediaSource_.tech_;
    let videoTargetPts = 0;
    let segment;
    let videoTags = segmentData.tags.videoTags;
    let audioTags = segmentData.tags.audioTags;

    // Establish the media timeline to PTS translation if we don't
    // have one already
    if (isNaN(this.basePtsOffset_) && (videoTags.length || audioTags.length)) {
      // We know there is at least one video or audio tag, but since we may not have both,
      // we use pts: Infinity for the missing tag. The will force the following Math.min
      // call will to use the proper pts value since it will always be less than Infinity
      const firstVideoTag = videoTags[0] || { pts: Infinity };
      const firstAudioTag = audioTags[0] || { pts: Infinity };

      this.basePtsOffset_ = Math.min(firstAudioTag.pts, firstVideoTag.pts);
    }

    if (tech.seeking()) {
      // Do not use previously saved buffer end values while seeking since buffer
      // is cleared on all seeks
      this.videoBufferEnd_ = NaN;
      this.audioBufferEnd_ = NaN;
    }

    if (isNaN(this.videoBufferEnd_)) {
      if (tech.buffered().length) {
        videoTargetPts = tech.buffered().end(0) - this.timestampOffset;
      }

      // Trim to currentTime if seeking
      if (tech.seeking()) {
        videoTargetPts = Math.max(videoTargetPts, tech.currentTime() - this.timestampOffset);
      }

      // PTS values are represented in milliseconds
      videoTargetPts *= 1e3;
      videoTargetPts += this.basePtsOffset_;
    } else {
      // Add a fudge factor of 0.1 to the last video pts appended since a rendition change
      // could append an overlapping segment, in which case there is a high likelyhood
      // a tag could have a matching pts to videoBufferEnd_, which would cause
      // that tag to get appended by the tag.pts >= targetPts check below even though it
      // is a duplicate of what was previously appended
      videoTargetPts = this.videoBufferEnd_ + 0.1;
    }

    // filter complete GOPs with a presentation time less than the seek target/end of buffer
    let currentIndex = videoTags.length;

    // if the last tag is beyond videoTargetPts, then do not search the list for a GOP
    // since our videoTargetPts lies in a future segment
    if (currentIndex && videoTags[currentIndex - 1].pts >= videoTargetPts) {
      // Start by walking backwards from the end of the list until we reach a tag that
      // is equal to or less than videoTargetPts
      while (--currentIndex) {
        const currentTag = videoTags[currentIndex];

        if (currentTag.pts > videoTargetPts) {
          continue;
        }

        // if we see a keyFrame or metadata tag once we've gone below videoTargetPts,
        // exit the loop as this is the start of the GOP that we want to append
        if (currentTag.keyFrame || currentTag.metaDataTag) {
          break;
        }
      }

      // We need to check if there are any metadata tags that come before currentIndex
      // as those will be metadata tags associated with the GOP we are appending
      // There could be 0 to 2 metadata tags that come before the currentIndex depending
      // on what videoTargetPts is and whether the transmuxer prepended metadata tags to this
      // key frame
      while (currentIndex) {
        const nextTag = videoTags[currentIndex - 1];

        if (!nextTag.metaDataTag) {
          break;
        }

        currentIndex--;
      }
    }

    const filteredVideoTags = videoTags.slice(currentIndex);

    let audioTargetPts;

    if (isNaN(this.audioBufferEnd_)) {
      audioTargetPts = videoTargetPts;
    } else {
      // Add a fudge factor of 0.1 to the last video pts appended since a rendition change
      // could append an overlapping segment, in which case there is a high likelyhood
      // a tag could have a matching pts to videoBufferEnd_, which would cause
      // that tag to get appended by the tag.pts >= targetPts check below even though it
      // is a duplicate of what was previously appended
      audioTargetPts = this.audioBufferEnd_ + 0.1;
    }

    if (filteredVideoTags.length) {
      // If targetPts intersects a GOP and we appended the tags for the GOP that came
      // before targetPts, we want to make sure to trim audio tags at the pts
      // of the first video tag to avoid brief moments of silence
      audioTargetPts = Math.min(audioTargetPts, filteredVideoTags[0].pts);
    }

    // skip tags with a presentation time less than the seek target/end of buffer
    currentIndex = 0;

    while (currentIndex < audioTags.length) {
      if (audioTags[currentIndex].pts >= audioTargetPts) {
        break;
      }

      currentIndex++;
    }

    const filteredAudioTags = audioTags.slice(currentIndex);

    // update the audio and video buffer ends
    if (filteredAudioTags.length) {
      this.audioBufferEnd_ = filteredAudioTags[filteredAudioTags.length - 1].pts;
    }
    if (filteredVideoTags.length) {
      this.videoBufferEnd_ = filteredVideoTags[filteredVideoTags.length - 1].pts;
    }

    let tags = this.getOrderedTags_(filteredVideoTags, filteredAudioTags);

    if (tags.length === 0) {
      return;
    }

    // If we are appending data that comes before our target pts, we want to tell
    // the swf to adjust its notion of current time to account for the extra tags
    // we are appending to complete the GOP that intersects with targetPts
    if (tags[0].pts < videoTargetPts && tech.seeking()) {
      const fudgeFactor = 1 / 30;
      const currentTime = tech.currentTime();
      const diff = (videoTargetPts - tags[0].pts) / 1e3;
      let adjustedTime = currentTime - diff;

      if (adjustedTime < fudgeFactor) {
        adjustedTime = 0;
      }

      try {
        this.mediaSource_.swfObj.vjs_adjustCurrentTime(adjustedTime);
      } catch (e) {
        // no-op for backwards compatability of swf. If adjustCurrentTime fails,
        // the swf may incorrectly report currentTime and buffered ranges
        // but should not affect playback over than the time displayed on the
        // progress bar is inaccurate
      }
    }

    // concatenate the bytes into a single segment
    for (let i = 0; i < tags.length; i++) {
      segmentByteLength += tags[i].bytes.byteLength;
    }
    segment = new Uint8Array(segmentByteLength);
    for (let i = 0, j = 0; i < tags.length; i++) {
      segment.set(tags[i].bytes, j);
      j += tags[i].bytes.byteLength;
    }

    return segment;
  }

  /**
   * Assemble the FLV tags in decoder order.
   *
   * @private
   * @param {Array} videoTags list of video tags
   * @param {Array} audioTags list of audio tags
   */
  getOrderedTags_(videoTags, audioTags) {
    let tag;
    let tags = [];

    while (videoTags.length || audioTags.length) {
      if (!videoTags.length) {
        // only audio tags remain
        tag = audioTags.shift();
      } else if (!audioTags.length) {
        // only video tags remain
        tag = videoTags.shift();
      } else if (audioTags[0].dts < videoTags[0].dts) {
        // audio should be decoded next
        tag = audioTags.shift();
      } else {
        // video should be decoded next
        tag = videoTags.shift();
      }

      tags.push(tag);
    }

    return tags;
  }
}
