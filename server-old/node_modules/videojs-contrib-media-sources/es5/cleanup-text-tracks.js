/**
 * Remove the text track from the player if one with matching kind and
 * label properties already exists on the player
 *
 * @param {Object} player the video.js player object
 * @param {String} kind to be considered the text track's `kind` must match
 * @param {String} label to be considered the text track's `label` must match
 * @private
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var removeExistingTrack = function removeExistingTrack(player, kind, label) {
  var tracks = player.remoteTextTracks() || [];

  for (var i = 0; i < tracks.length; i++) {
    var track = tracks[i];

    if (track.kind === kind && track.label === label) {
      player.removeRemoteTextTrack(track);
    }
  }
};

exports.removeExistingTrack = removeExistingTrack;
/**
 * Cleaup text tracks on video.js if they exist
 *
 * @param {Object} player the video.js player object
 * @private
 */
var cleanupTextTracks = function cleanupTextTracks(player) {
  removeExistingTrack(player, 'captions', 'cc1');
  removeExistingTrack(player, 'metadata', 'Timed Metadata');
};
exports.cleanupTextTracks = cleanupTextTracks;