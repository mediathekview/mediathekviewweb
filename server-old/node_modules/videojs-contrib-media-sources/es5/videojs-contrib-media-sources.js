/**
 * @file videojs-contrib-media-sources.js
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _globalWindow = require('global/window');

var _globalWindow2 = _interopRequireDefault(_globalWindow);

var _flashMediaSource = require('./flash-media-source');

var _flashMediaSource2 = _interopRequireDefault(_flashMediaSource);

var _htmlMediaSource = require('./html-media-source');

var _htmlMediaSource2 = _interopRequireDefault(_htmlMediaSource);

var _videoJs = require('video.js');

var _videoJs2 = _interopRequireDefault(_videoJs);

var urlCount = 0;

// ------------
// Media Source
// ------------

var defaults = {
  // how to determine the MediaSource implementation to use. There
  // are three available modes:
  // - auto: use native MediaSources where available and Flash
  //   everywhere else
  // - html5: always use native MediaSources
  // - flash: always use the Flash MediaSource polyfill
  mode: 'auto'
};

// store references to the media sources so they can be connected
// to a video element (a swf object)
// TODO: can we store this somewhere local to this module?
_videoJs2['default'].mediaSources = {};

/**
 * Provide a method for a swf object to notify JS that a
 * media source is now open.
 *
 * @param {String} msObjectURL string referencing the MSE Object URL
 * @param {String} swfId the swf id
 */
var open = function open(msObjectURL, swfId) {
  var mediaSource = _videoJs2['default'].mediaSources[msObjectURL];

  if (mediaSource) {
    mediaSource.trigger({ type: 'sourceopen', swfId: swfId });
  } else {
    throw new Error('Media Source not found (Video.js)');
  }
};

/**
 * Check to see if the native MediaSource object exists and supports
 * an MP4 container with both H.264 video and AAC-LC audio.
 *
 * @return {Boolean} if  native media sources are supported
 */
var supportsNativeMediaSources = function supportsNativeMediaSources() {
  return !!_globalWindow2['default'].MediaSource && !!_globalWindow2['default'].MediaSource.isTypeSupported && _globalWindow2['default'].MediaSource.isTypeSupported('video/mp4;codecs="avc1.4d400d,mp4a.40.2"');
};

/**
 * An emulation of the MediaSource API so that we can support
 * native and non-native functionality such as flash and
 * video/mp2t videos. returns an instance of HtmlMediaSource or
 * FlashMediaSource depending on what is supported and what options
 * are passed in.
 *
 * @link https://developer.mozilla.org/en-US/docs/Web/API/MediaSource/MediaSource
 * @param {Object} options options to use during setup.
 */
var MediaSource = function MediaSource(options) {
  var settings = _videoJs2['default'].mergeOptions(defaults, options);

  this.MediaSource = {
    open: open,
    supportsNativeMediaSources: supportsNativeMediaSources
  };

  // determine whether HTML MediaSources should be used
  if (settings.mode === 'html5' || settings.mode === 'auto' && supportsNativeMediaSources()) {
    return new _htmlMediaSource2['default']();
  } else if (_videoJs2['default'].getTech('Flash')) {
    return new _flashMediaSource2['default']();
  }

  throw new Error('Cannot use Flash or Html5 to create a MediaSource for this video');
};

exports.MediaSource = MediaSource;
MediaSource.open = open;
MediaSource.supportsNativeMediaSources = supportsNativeMediaSources;

/**
 * A wrapper around the native URL for our MSE object
 * implementation, this object is exposed under videojs.URL
 *
 * @link https://developer.mozilla.org/en-US/docs/Web/API/URL/URL
 */
var URL = {
  /**
   * A wrapper around the native createObjectURL for our objects.
   * This function maps a native or emulated mediaSource to a blob
   * url so that it can be loaded into video.js
   *
   * @link https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL
   * @param {MediaSource} object the object to create a blob url to
   */
  createObjectURL: function createObjectURL(object) {
    var objectUrlPrefix = 'blob:vjs-media-source/';
    var url = undefined;

    // use the native MediaSource to generate an object URL
    if (object instanceof _htmlMediaSource2['default']) {
      url = _globalWindow2['default'].URL.createObjectURL(object.nativeMediaSource_);
      object.url_ = url;
      return url;
    }
    // if the object isn't an emulated MediaSource, delegate to the
    // native implementation
    if (!(object instanceof _flashMediaSource2['default'])) {
      url = _globalWindow2['default'].URL.createObjectURL(object);
      object.url_ = url;
      return url;
    }

    // build a URL that can be used to map back to the emulated
    // MediaSource
    url = objectUrlPrefix + urlCount;

    urlCount++;

    // setup the mapping back to object
    _videoJs2['default'].mediaSources[url] = object;

    return url;
  }
};

exports.URL = URL;
_videoJs2['default'].MediaSource = MediaSource;
_videoJs2['default'].URL = URL;