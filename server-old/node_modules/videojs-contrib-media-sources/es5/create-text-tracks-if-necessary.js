/**
 * @file create-text-tracks-if-necessary.js
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _cleanupTextTracks = require('./cleanup-text-tracks');

/**
 * Create text tracks on video.js if they exist on a segment.
 *
 * @param {Object} sourceBuffer the VSB or FSB
 * @param {Object} mediaSource the HTML or Flash media source
 * @param {Object} segment the segment that may contain the text track
 * @private
 */
var createTextTracksIfNecessary = function createTextTracksIfNecessary(sourceBuffer, mediaSource, segment) {
  var player = mediaSource.player_;

  // create an in-band caption track if one is present in the segment
  if (segment.captions && segment.captions.length && !sourceBuffer.inbandTextTrack_) {
    (0, _cleanupTextTracks.removeExistingTrack)(player, 'captions', 'cc1');
    sourceBuffer.inbandTextTrack_ = player.addRemoteTextTrack({
      kind: 'captions',
      label: 'cc1'
    }, false).track;
  }

  if (segment.metadata && segment.metadata.length && !sourceBuffer.metadataTrack_) {
    (0, _cleanupTextTracks.removeExistingTrack)(player, 'metadata', 'Timed Metadata', true);
    sourceBuffer.metadataTrack_ = player.addRemoteTextTrack({
      kind: 'metadata',
      label: 'Timed Metadata'
    }, false).track;
    sourceBuffer.metadataTrack_.inBandMetadataTrackDispatchType = segment.metadata.dispatchType;
  }
};

exports['default'] = createTextTracksIfNecessary;
module.exports = exports['default'];