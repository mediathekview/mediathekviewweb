/**
 * Remove the text track from the player if one with matching kind and
 * label properties already exists on the player
 *
 * @param {Object} player the video.js player object
 * @param {String} kind to be considered the text track's `kind` must match
 * @param {String} label to be considered the text track's `label` must match
 * @private
 */
export const removeExistingTrack = function(player, kind, label) {
  const tracks = player.remoteTextTracks() || [];

  for (let i = 0; i < tracks.length; i++) {
    const track = tracks[i];

    if (track.kind === kind && track.label === label) {
      player.removeRemoteTextTrack(track);
    }
  }
};

/**
 * Cleaup text tracks on video.js if they exist
 *
 * @param {Object} player the video.js player object
 * @private
 */
export const cleanupTextTracks = function(player) {
  removeExistingTrack(player, 'captions', 'cc1');
  removeExistingTrack(player, 'metadata', 'Timed Metadata');
};
