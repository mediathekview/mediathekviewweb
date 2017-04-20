'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _videoJs = require('video.js');

var _videoJs2 = _interopRequireDefault(_videoJs);

var defaultOptions = {
  errorInterval: 30,
  getSource: function getSource(next) {
    var tech = this.tech({ IWillNotUseThisInPlugins: true });
    var sourceObj = tech.currentSource_;

    return next(sourceObj);
  }
};

/**
 * Main entry point for the plugin
 *
 * @param {Player} player a reference to a videojs Player instance
 * @param {Object} [options] an object with plugin options
 * @private
 */
var initPlugin = function initPlugin(player, options) {
  var lastCalled = 0;
  var seekTo = 0;
  var localOptions = _videoJs2['default'].mergeOptions(defaultOptions, options);

  /**
   * Player modifications to perform that must wait until `loadedmetadata`
   * has been triggered
   *
   * @private
   */
  var loadedMetadataHandler = function loadedMetadataHandler() {
    if (seekTo) {
      player.currentTime(seekTo);
    }
  };

  /**
   * Set the source on the player element, play, and seek if necessary
   *
   * @param {Object} sourceObj An object specifying the source url and mime-type to play
   * @private
   */
  var setSource = function setSource(sourceObj) {
    if (sourceObj === null || sourceObj === undefined) {
      return;
    }
    seekTo = player.duration() !== Infinity && player.currentTime() || 0;

    player.one('loadedmetadata', loadedMetadataHandler);

    player.src(sourceObj);
    player.play();
  };

  /**
   * Attempt to get a source from either the built-in getSource function
   * or a custom function provided via the options
   *
   * @private
   */
  var errorHandler = function errorHandler() {
    // Do not attempt to reload the source if a source-reload occurred before
    // 'errorInterval' time has elapsed since the last source-reload
    if (Date.now() - lastCalled < localOptions.errorInterval * 1000) {
      return;
    }

    if (!localOptions.getSource || typeof localOptions.getSource !== 'function') {
      _videoJs2['default'].log.error('ERROR: reloadSourceOnError - The option getSource must be a function!');
      return;
    }
    lastCalled = Date.now();

    return localOptions.getSource.call(player, setSource);
  };

  /**
   * Unbind any event handlers that were bound by the plugin
   *
   * @private
   */
  var cleanupEvents = function cleanupEvents() {
    player.off('loadedmetadata', loadedMetadataHandler);
    player.off('error', errorHandler);
    player.off('dispose', cleanupEvents);
  };

  /**
   * Cleanup before re-initializing the plugin
   *
   * @param {Object} [newOptions] an object with plugin options
   * @private
   */
  var reinitPlugin = function reinitPlugin(newOptions) {
    cleanupEvents();
    initPlugin(player, newOptions);
  };

  player.on('error', errorHandler);
  player.on('dispose', cleanupEvents);

  // Overwrite the plugin function so that we can correctly cleanup before
  // initializing the plugin
  player.reloadSourceOnError = reinitPlugin;
};

/**
 * Reload the source when an error is detected as long as there
 * wasn't an error previously within the last 30 seconds
 *
 * @param {Object} [options] an object with plugin options
 */
var reloadSourceOnError = function reloadSourceOnError(options) {
  initPlugin(this, options);
};

exports['default'] = reloadSourceOnError;
module.exports = exports['default'];