(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _lineStream = require('./line-stream');

var _lineStream2 = _interopRequireDefault(_lineStream);

var _parseStream = require('./parse-stream');

var _parseStream2 = _interopRequireDefault(_parseStream);

var _parser = require('./parser');

var _parser2 = _interopRequireDefault(_parser);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

module.exports = {
  LineStream: _lineStream2['default'],
  ParseStream: _parseStream2['default'],
  Parser: _parser2['default']
}; /**
    * @file m3u8/index.js
    *
    * Utilities for parsing M3U8 files. If the entire manifest is available,
    * `Parser` will create an object representation with enough detail for managing
    * playback. `ParseStream` and `LineStream` are lower-level parsing primitives
    * that do not assume the entirety of the manifest is ready and expose a
    * ReadableStream-like interface.
    */

},{"./line-stream":2,"./parse-stream":3,"./parser":4}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _stream = require('./stream');

var _stream2 = _interopRequireDefault(_stream);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @file m3u8/line-stream.js
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


/**
 * A stream that buffers string input and generates a `data` event for each
 * line.
 *
 * @class LineStream
 * @extends Stream
 */
var LineStream = function (_Stream) {
  _inherits(LineStream, _Stream);

  function LineStream() {
    _classCallCheck(this, LineStream);

    var _this = _possibleConstructorReturn(this, (LineStream.__proto__ || Object.getPrototypeOf(LineStream)).call(this));

    _this.buffer = '';
    return _this;
  }

  /**
   * Add new data to be parsed.
   *
   * @param {String} data the text to process
   */


  _createClass(LineStream, [{
    key: 'push',
    value: function push(data) {
      var nextNewline = void 0;

      this.buffer += data;
      nextNewline = this.buffer.indexOf('\n');

      for (; nextNewline > -1; nextNewline = this.buffer.indexOf('\n')) {
        this.trigger('data', this.buffer.substring(0, nextNewline));
        this.buffer = this.buffer.substring(nextNewline + 1);
      }
    }
  }]);

  return LineStream;
}(_stream2['default']);

exports['default'] = LineStream;

},{"./stream":5}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _stream = require('./stream');

var _stream2 = _interopRequireDefault(_stream);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @file m3u8/parse-stream.js
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


/**
 * "forgiving" attribute list psuedo-grammar:
 * attributes -> keyvalue (',' keyvalue)*
 * keyvalue   -> key '=' value
 * key        -> [^=]*
 * value      -> '"' [^"]* '"' | [^,]*
 */
var attributeSeparator = function attributeSeparator() {
  var key = '[^=]*';
  var value = '"[^"]*"|[^,]*';
  var keyvalue = '(?:' + key + ')=(?:' + value + ')';

  return new RegExp('(?:^|,)(' + keyvalue + ')');
};

/**
 * Parse attributes from a line given the seperator
 *
 * @param {String} attributes the attibute line to parse
 */
var parseAttributes = function parseAttributes(attributes) {
  // split the string using attributes as the separator
  var attrs = attributes.split(attributeSeparator());
  var result = {};
  var i = attrs.length;
  var attr = void 0;

  while (i--) {
    // filter out unmatched portions of the string
    if (attrs[i] === '') {
      continue;
    }

    // split the key and value
    attr = /([^=]*)=(.*)/.exec(attrs[i]).slice(1);
    // trim whitespace and remove optional quotes around the value
    attr[0] = attr[0].replace(/^\s+|\s+$/g, '');
    attr[1] = attr[1].replace(/^\s+|\s+$/g, '');
    attr[1] = attr[1].replace(/^['"](.*)['"]$/g, '$1');
    result[attr[0]] = attr[1];
  }
  return result;
};

/**
 * A line-level M3U8 parser event stream. It expects to receive input one
 * line at a time and performs a context-free parse of its contents. A stream
 * interpretation of a manifest can be useful if the manifest is expected to
 * be too large to fit comfortably into memory or the entirety of the input
 * is not immediately available. Otherwise, it's probably much easier to work
 * with a regular `Parser` object.
 *
 * Produces `data` events with an object that captures the parser's
 * interpretation of the input. That object has a property `tag` that is one
 * of `uri`, `comment`, or `tag`. URIs only have a single additional
 * property, `line`, which captures the entirety of the input without
 * interpretation. Comments similarly have a single additional property
 * `text` which is the input without the leading `#`.
 *
 * Tags always have a property `tagType` which is the lower-cased version of
 * the M3U8 directive without the `#EXT` or `#EXT-X-` prefix. For instance,
 * `#EXT-X-MEDIA-SEQUENCE` becomes `media-sequence` when parsed. Unrecognized
 * tags are given the tag type `unknown` and a single additional property
 * `data` with the remainder of the input.
 *
 * @class ParseStream
 * @extends Stream
 */

var ParseStream = function (_Stream) {
  _inherits(ParseStream, _Stream);

  function ParseStream() {
    _classCallCheck(this, ParseStream);

    return _possibleConstructorReturn(this, (ParseStream.__proto__ || Object.getPrototypeOf(ParseStream)).call(this));
  }

  /**
   * Parses an additional line of input.
   *
   * @param {String} line a single line of an M3U8 file to parse
   */


  _createClass(ParseStream, [{
    key: 'push',
    value: function push(line) {
      var match = void 0;
      var event = void 0;

      // strip whitespace
      line = line.replace(/^[\u0000\s]+|[\u0000\s]+$/g, '');
      if (line.length === 0) {
        // ignore empty lines
        return;
      }

      // URIs
      if (line[0] !== '#') {
        this.trigger('data', {
          type: 'uri',
          uri: line
        });
        return;
      }

      // Comments
      if (line.indexOf('#EXT') !== 0) {
        this.trigger('data', {
          type: 'comment',
          text: line.slice(1)
        });
        return;
      }

      // strip off any carriage returns here so the regex matching
      // doesn't have to account for them.
      line = line.replace('\r', '');

      // Tags
      match = /^#EXTM3U/.exec(line);
      if (match) {
        this.trigger('data', {
          type: 'tag',
          tagType: 'm3u'
        });
        return;
      }
      match = /^#EXTINF:?([0-9\.]*)?,?(.*)?$/.exec(line);
      if (match) {
        event = {
          type: 'tag',
          tagType: 'inf'
        };
        if (match[1]) {
          event.duration = parseFloat(match[1]);
        }
        if (match[2]) {
          event.title = match[2];
        }
        this.trigger('data', event);
        return;
      }
      match = /^#EXT-X-TARGETDURATION:?([0-9.]*)?/.exec(line);
      if (match) {
        event = {
          type: 'tag',
          tagType: 'targetduration'
        };
        if (match[1]) {
          event.duration = parseInt(match[1], 10);
        }
        this.trigger('data', event);
        return;
      }
      match = /^#ZEN-TOTAL-DURATION:?([0-9.]*)?/.exec(line);
      if (match) {
        event = {
          type: 'tag',
          tagType: 'totalduration'
        };
        if (match[1]) {
          event.duration = parseInt(match[1], 10);
        }
        this.trigger('data', event);
        return;
      }
      match = /^#EXT-X-VERSION:?([0-9.]*)?/.exec(line);
      if (match) {
        event = {
          type: 'tag',
          tagType: 'version'
        };
        if (match[1]) {
          event.version = parseInt(match[1], 10);
        }
        this.trigger('data', event);
        return;
      }
      match = /^#EXT-X-MEDIA-SEQUENCE:?(\-?[0-9.]*)?/.exec(line);
      if (match) {
        event = {
          type: 'tag',
          tagType: 'media-sequence'
        };
        if (match[1]) {
          event.number = parseInt(match[1], 10);
        }
        this.trigger('data', event);
        return;
      }
      match = /^#EXT-X-DISCONTINUITY-SEQUENCE:?(\-?[0-9.]*)?/.exec(line);
      if (match) {
        event = {
          type: 'tag',
          tagType: 'discontinuity-sequence'
        };
        if (match[1]) {
          event.number = parseInt(match[1], 10);
        }
        this.trigger('data', event);
        return;
      }
      match = /^#EXT-X-PLAYLIST-TYPE:?(.*)?$/.exec(line);
      if (match) {
        event = {
          type: 'tag',
          tagType: 'playlist-type'
        };
        if (match[1]) {
          event.playlistType = match[1];
        }
        this.trigger('data', event);
        return;
      }
      match = /^#EXT-X-BYTERANGE:?([0-9.]*)?@?([0-9.]*)?/.exec(line);
      if (match) {
        event = {
          type: 'tag',
          tagType: 'byterange'
        };
        if (match[1]) {
          event.length = parseInt(match[1], 10);
        }
        if (match[2]) {
          event.offset = parseInt(match[2], 10);
        }
        this.trigger('data', event);
        return;
      }
      match = /^#EXT-X-ALLOW-CACHE:?(YES|NO)?/.exec(line);
      if (match) {
        event = {
          type: 'tag',
          tagType: 'allow-cache'
        };
        if (match[1]) {
          event.allowed = !/NO/.test(match[1]);
        }
        this.trigger('data', event);
        return;
      }
      match = /^#EXT-X-MAP:?(.*)$/.exec(line);
      if (match) {
        event = {
          type: 'tag',
          tagType: 'map'
        };

        if (match[1]) {
          var attributes = parseAttributes(match[1]);

          if (attributes.URI) {
            event.uri = attributes.URI;
          }
          if (attributes.BYTERANGE) {
            var _attributes$BYTERANGE = attributes.BYTERANGE.split('@'),
                _attributes$BYTERANGE2 = _slicedToArray(_attributes$BYTERANGE, 2),
                length = _attributes$BYTERANGE2[0],
                offset = _attributes$BYTERANGE2[1];

            event.byterange = {};
            if (length) {
              event.byterange.length = parseInt(length, 10);
            }
            if (offset) {
              event.byterange.offset = parseInt(offset, 10);
            }
          }
        }

        this.trigger('data', event);
        return;
      }
      match = /^#EXT-X-STREAM-INF:?(.*)$/.exec(line);
      if (match) {
        event = {
          type: 'tag',
          tagType: 'stream-inf'
        };
        if (match[1]) {
          event.attributes = parseAttributes(match[1]);

          if (event.attributes.RESOLUTION) {
            var split = event.attributes.RESOLUTION.split('x');
            var resolution = {};

            if (split[0]) {
              resolution.width = parseInt(split[0], 10);
            }
            if (split[1]) {
              resolution.height = parseInt(split[1], 10);
            }
            event.attributes.RESOLUTION = resolution;
          }
          if (event.attributes.BANDWIDTH) {
            event.attributes.BANDWIDTH = parseInt(event.attributes.BANDWIDTH, 10);
          }
          if (event.attributes['PROGRAM-ID']) {
            event.attributes['PROGRAM-ID'] = parseInt(event.attributes['PROGRAM-ID'], 10);
          }
        }
        this.trigger('data', event);
        return;
      }
      match = /^#EXT-X-MEDIA:?(.*)$/.exec(line);
      if (match) {
        event = {
          type: 'tag',
          tagType: 'media'
        };
        if (match[1]) {
          event.attributes = parseAttributes(match[1]);
        }
        this.trigger('data', event);
        return;
      }
      match = /^#EXT-X-ENDLIST/.exec(line);
      if (match) {
        this.trigger('data', {
          type: 'tag',
          tagType: 'endlist'
        });
        return;
      }
      match = /^#EXT-X-DISCONTINUITY/.exec(line);
      if (match) {
        this.trigger('data', {
          type: 'tag',
          tagType: 'discontinuity'
        });
        return;
      }
      match = /^#EXT-X-PROGRAM-DATE-TIME:?(.*)$/.exec(line);
      if (match) {
        event = {
          type: 'tag',
          tagType: 'program-date-time'
        };
        if (match[1]) {
          event.dateTimeString = match[1];
          event.dateTimeObject = new Date(match[1]);
        }
        this.trigger('data', event);
        return;
      }
      match = /^#EXT-X-KEY:?(.*)$/.exec(line);
      if (match) {
        event = {
          type: 'tag',
          tagType: 'key'
        };
        if (match[1]) {
          event.attributes = parseAttributes(match[1]);
          // parse the IV string into a Uint32Array
          if (event.attributes.IV) {
            if (event.attributes.IV.substring(0, 2).toLowerCase() === '0x') {
              event.attributes.IV = event.attributes.IV.substring(2);
            }

            event.attributes.IV = event.attributes.IV.match(/.{8}/g);
            event.attributes.IV[0] = parseInt(event.attributes.IV[0], 16);
            event.attributes.IV[1] = parseInt(event.attributes.IV[1], 16);
            event.attributes.IV[2] = parseInt(event.attributes.IV[2], 16);
            event.attributes.IV[3] = parseInt(event.attributes.IV[3], 16);
            event.attributes.IV = new Uint32Array(event.attributes.IV);
          }
        }
        this.trigger('data', event);
        return;
      }
      match = /^#EXT-X-CUE-OUT-CONT:?(.*)?$/.exec(line);
      if (match) {
        event = {
          type: 'tag',
          tagType: 'cue-out-cont'
        };
        if (match[1]) {
          event.data = match[1];
        } else {
          event.data = '';
        }
        this.trigger('data', event);
        return;
      }
      match = /^#EXT-X-CUE-OUT:?(.*)?$/.exec(line);
      if (match) {
        event = {
          type: 'tag',
          tagType: 'cue-out'
        };
        if (match[1]) {
          event.data = match[1];
        } else {
          event.data = '';
        }
        this.trigger('data', event);
        return;
      }
      match = /^#EXT-X-CUE-IN:?(.*)?$/.exec(line);
      if (match) {
        event = {
          type: 'tag',
          tagType: 'cue-in'
        };
        if (match[1]) {
          event.data = match[1];
        } else {
          event.data = '';
        }
        this.trigger('data', event);
        return;
      }

      // unknown tag type
      this.trigger('data', {
        type: 'tag',
        data: line.slice(4)
      });
    }
  }]);

  return ParseStream;
}(_stream2['default']);

exports['default'] = ParseStream;

},{"./stream":5}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _stream = require('./stream');

var _stream2 = _interopRequireDefault(_stream);

var _lineStream = require('./line-stream');

var _lineStream2 = _interopRequireDefault(_lineStream);

var _parseStream = require('./parse-stream');

var _parseStream2 = _interopRequireDefault(_parseStream);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @file m3u8/parser.js
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


/**
 * A parser for M3U8 files. The current interpretation of the input is
 * exposed as a property `manifest` on parser objects. It's just two lines to
 * create and parse a manifest once you have the contents available as a string:
 *
 * ```js
 * var parser = new m3u8.Parser();
 * parser.push(xhr.responseText);
 * ```
 *
 * New input can later be applied to update the manifest object by calling
 * `push` again.
 *
 * The parser attempts to create a usable manifest object even if the
 * underlying input is somewhat nonsensical. It emits `info` and `warning`
 * events during the parse if it encounters input that seems invalid or
 * requires some property of the manifest object to be defaulted.
 *
 * @class Parser
 * @extends Stream
 */
var Parser = function (_Stream) {
  _inherits(Parser, _Stream);

  function Parser() {
    _classCallCheck(this, Parser);

    var _this = _possibleConstructorReturn(this, (Parser.__proto__ || Object.getPrototypeOf(Parser)).call(this));

    _this.lineStream = new _lineStream2['default']();
    _this.parseStream = new _parseStream2['default']();
    _this.lineStream.pipe(_this.parseStream);
    /* eslint-disable consistent-this */
    var self = _this;
    /* eslint-enable consistent-this */
    var uris = [];
    var currentUri = {};
    // if specified, the active EXT-X-MAP definition
    var currentMap = void 0;
    // if specified, the active decryption key
    var _key = void 0;
    var noop = function noop() {};
    var defaultMediaGroups = {
      'AUDIO': {},
      'VIDEO': {},
      'CLOSED-CAPTIONS': {},
      'SUBTITLES': {}
    };
    // group segments into numbered timelines delineated by discontinuities
    var currentTimeline = 0;

    // the manifest is empty until the parse stream begins delivering data
    _this.manifest = {
      allowCache: true,
      discontinuityStarts: [],
      segments: []
    };

    // update the manifest with the m3u8 entry from the parse stream
    _this.parseStream.on('data', function (entry) {
      var mediaGroup = void 0;
      var rendition = void 0;

      ({
        tag: function tag() {
          // switch based on the tag type
          (({
            'allow-cache': function allowCache() {
              this.manifest.allowCache = entry.allowed;
              if (!('allowed' in entry)) {
                this.trigger('info', {
                  message: 'defaulting allowCache to YES'
                });
                this.manifest.allowCache = true;
              }
            },
            byterange: function byterange() {
              var byterange = {};

              if ('length' in entry) {
                currentUri.byterange = byterange;
                byterange.length = entry.length;

                if (!('offset' in entry)) {
                  this.trigger('info', {
                    message: 'defaulting offset to zero'
                  });
                  entry.offset = 0;
                }
              }
              if ('offset' in entry) {
                currentUri.byterange = byterange;
                byterange.offset = entry.offset;
              }
            },
            endlist: function endlist() {
              this.manifest.endList = true;
            },
            inf: function inf() {
              if (!('mediaSequence' in this.manifest)) {
                this.manifest.mediaSequence = 0;
                this.trigger('info', {
                  message: 'defaulting media sequence to zero'
                });
              }
              if (!('discontinuitySequence' in this.manifest)) {
                this.manifest.discontinuitySequence = 0;
                this.trigger('info', {
                  message: 'defaulting discontinuity sequence to zero'
                });
              }
              if (entry.duration > 0) {
                currentUri.duration = entry.duration;
              }

              if (entry.duration === 0) {
                currentUri.duration = 0.01;
                this.trigger('info', {
                  message: 'updating zero segment duration to a small value'
                });
              }

              this.manifest.segments = uris;
            },
            key: function key() {
              if (!entry.attributes) {
                this.trigger('warn', {
                  message: 'ignoring key declaration without attribute list'
                });
                return;
              }
              // clear the active encryption key
              if (entry.attributes.METHOD === 'NONE') {
                _key = null;
                return;
              }
              if (!entry.attributes.URI) {
                this.trigger('warn', {
                  message: 'ignoring key declaration without URI'
                });
                return;
              }
              if (!entry.attributes.METHOD) {
                this.trigger('warn', {
                  message: 'defaulting key method to AES-128'
                });
              }

              // setup an encryption key for upcoming segments
              _key = {
                method: entry.attributes.METHOD || 'AES-128',
                uri: entry.attributes.URI
              };

              if (typeof entry.attributes.IV !== 'undefined') {
                _key.iv = entry.attributes.IV;
              }
            },
            'media-sequence': function mediaSequence() {
              if (!isFinite(entry.number)) {
                this.trigger('warn', {
                  message: 'ignoring invalid media sequence: ' + entry.number
                });
                return;
              }
              this.manifest.mediaSequence = entry.number;
            },
            'discontinuity-sequence': function discontinuitySequence() {
              if (!isFinite(entry.number)) {
                this.trigger('warn', {
                  message: 'ignoring invalid discontinuity sequence: ' + entry.number
                });
                return;
              }
              this.manifest.discontinuitySequence = entry.number;
              currentTimeline = entry.number;
            },
            'playlist-type': function playlistType() {
              if (!/VOD|EVENT/.test(entry.playlistType)) {
                this.trigger('warn', {
                  message: 'ignoring unknown playlist type: ' + entry.playlist
                });
                return;
              }
              this.manifest.playlistType = entry.playlistType;
            },
            map: function map() {
              currentMap = {};
              if (entry.uri) {
                currentMap.uri = entry.uri;
              }
              if (entry.byterange) {
                currentMap.byterange = entry.byterange;
              }
            },
            'stream-inf': function streamInf() {
              this.manifest.playlists = uris;
              this.manifest.mediaGroups = this.manifest.mediaGroups || defaultMediaGroups;

              if (!entry.attributes) {
                this.trigger('warn', {
                  message: 'ignoring empty stream-inf attributes'
                });
                return;
              }

              if (!currentUri.attributes) {
                currentUri.attributes = {};
              }
              _extends(currentUri.attributes, entry.attributes);
            },
            media: function media() {
              this.manifest.mediaGroups = this.manifest.mediaGroups || defaultMediaGroups;

              if (!(entry.attributes && entry.attributes.TYPE && entry.attributes['GROUP-ID'] && entry.attributes.NAME)) {
                this.trigger('warn', {
                  message: 'ignoring incomplete or missing media group'
                });
                return;
              }

              // find the media group, creating defaults as necessary
              var mediaGroupType = this.manifest.mediaGroups[entry.attributes.TYPE];

              mediaGroupType[entry.attributes['GROUP-ID']] = mediaGroupType[entry.attributes['GROUP-ID']] || {};
              mediaGroup = mediaGroupType[entry.attributes['GROUP-ID']];

              // collect the rendition metadata
              rendition = {
                'default': /yes/i.test(entry.attributes.DEFAULT)
              };
              if (rendition['default']) {
                rendition.autoselect = true;
              } else {
                rendition.autoselect = /yes/i.test(entry.attributes.AUTOSELECT);
              }
              if (entry.attributes.LANGUAGE) {
                rendition.language = entry.attributes.LANGUAGE;
              }
              if (entry.attributes.URI) {
                rendition.uri = entry.attributes.URI;
              }
              if (entry.attributes['INSTREAM-ID']) {
                rendition.instreamId = entry.attributes['INSTREAM-ID'];
              }
              if (entry.attributes.CHARACTERISTICS) {
                rendition.characteristics = entry.attributes.CHARACTERISTICS;
              }
              if (entry.attributes.FORCED) {
                rendition.forced = /yes/i.test(entry.attributes.FORCED);
              }

              // insert the new rendition
              mediaGroup[entry.attributes.NAME] = rendition;
            },
            discontinuity: function discontinuity() {
              currentTimeline += 1;
              currentUri.discontinuity = true;
              this.manifest.discontinuityStarts.push(uris.length);
            },
            'program-date-time': function programDateTime() {
              this.manifest.dateTimeString = entry.dateTimeString;
              this.manifest.dateTimeObject = entry.dateTimeObject;
            },
            targetduration: function targetduration() {
              if (!isFinite(entry.duration) || entry.duration < 0) {
                this.trigger('warn', {
                  message: 'ignoring invalid target duration: ' + entry.duration
                });
                return;
              }
              this.manifest.targetDuration = entry.duration;
            },
            totalduration: function totalduration() {
              if (!isFinite(entry.duration) || entry.duration < 0) {
                this.trigger('warn', {
                  message: 'ignoring invalid total duration: ' + entry.duration
                });
                return;
              }
              this.manifest.totalDuration = entry.duration;
            },
            'cue-out': function cueOut() {
              currentUri.cueOut = entry.data;
            },
            'cue-out-cont': function cueOutCont() {
              currentUri.cueOutCont = entry.data;
            },
            'cue-in': function cueIn() {
              currentUri.cueIn = entry.data;
            }
          })[entry.tagType] || noop).call(self);
        },
        uri: function uri() {
          currentUri.uri = entry.uri;
          uris.push(currentUri);

          // if no explicit duration was declared, use the target duration
          if (this.manifest.targetDuration && !('duration' in currentUri)) {
            this.trigger('warn', {
              message: 'defaulting segment duration to the target duration'
            });
            currentUri.duration = this.manifest.targetDuration;
          }
          // annotate with encryption information, if necessary
          if (_key) {
            currentUri.key = _key;
          }
          currentUri.timeline = currentTimeline;
          // annotate with initialization segment information, if necessary
          if (currentMap) {
            currentUri.map = currentMap;
          }

          // prepare for the next URI
          currentUri = {};
        },
        comment: function comment() {
          // comments are not important for playback
        }
      })[entry.type].call(self);
    });

    return _this;
  }

  /**
   * Parse the input string and update the manifest object.
   *
   * @param {String} chunk a potentially incomplete portion of the manifest
   */


  _createClass(Parser, [{
    key: 'push',
    value: function push(chunk) {
      this.lineStream.push(chunk);
    }

    /**
     * Flush any remaining input. This can be handy if the last line of an M3U8
     * manifest did not contain a trailing newline but the file has been
     * completely received.
     */

  }, {
    key: 'end',
    value: function end() {
      // flush any buffered input
      this.lineStream.push('\n');
    }
  }]);

  return Parser;
}(_stream2['default']);

exports['default'] = Parser;

},{"./line-stream":2,"./parse-stream":3,"./stream":5}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @file stream.js
 */
/**
 * A lightweight readable stream implemention that handles event dispatching.
 *
 * @class Stream
 */
var Stream = function () {
  function Stream() {
    _classCallCheck(this, Stream);

    this.listeners = {};
  }

  /**
   * Add a listener for a specified event type.
   *
   * @param {String} type the event name
   * @param {Function} listener the callback to be invoked when an event of
   * the specified type occurs
   */


  _createClass(Stream, [{
    key: 'on',
    value: function on(type, listener) {
      if (!this.listeners[type]) {
        this.listeners[type] = [];
      }
      this.listeners[type].push(listener);
    }

    /**
     * Remove a listener for a specified event type.
     *
     * @param {String} type the event name
     * @param {Function} listener  a function previously registered for this
     * type of event through `on`
     * @return {Boolean} if we could turn it off or not
     */

  }, {
    key: 'off',
    value: function off(type, listener) {
      if (!this.listeners[type]) {
        return false;
      }

      var index = this.listeners[type].indexOf(listener);

      this.listeners[type].splice(index, 1);
      return index > -1;
    }

    /**
     * Trigger an event of the specified type on this stream. Any additional
     * arguments to this function are passed as parameters to event listeners.
     *
     * @param {String} type the event name
     */

  }, {
    key: 'trigger',
    value: function trigger(type) {
      var callbacks = this.listeners[type];
      var i = void 0;
      var length = void 0;
      var args = void 0;

      if (!callbacks) {
        return;
      }
      // Slicing the arguments on every invocation of this method
      // can add a significant amount of overhead. Avoid the
      // intermediate object creation for the common case of a
      // single callback argument
      if (arguments.length === 2) {
        length = callbacks.length;
        for (i = 0; i < length; ++i) {
          callbacks[i].call(this, arguments[1]);
        }
      } else {
        args = Array.prototype.slice.call(arguments, 1);
        length = callbacks.length;
        for (i = 0; i < length; ++i) {
          callbacks[i].apply(this, args);
        }
      }
    }

    /**
     * Destroys the stream and cleans up.
     */

  }, {
    key: 'dispose',
    value: function dispose() {
      this.listeners = {};
    }
    /**
     * Forwards all `data` events on this stream to the destination stream. The
     * destination stream should provide a method `push` to receive the data
     * events as they arrive.
     *
     * @param {Stream} destination the stream that will receive all `data` events
     * @see http://nodejs.org/api/stream.html#stream_readable_pipe_destination_options
     */

  }, {
    key: 'pipe',
    value: function pipe(destination) {
      this.on('data', function (data) {
        destination.push(data);
      });
    }
  }]);

  return Stream;
}();

exports['default'] = Stream;

},{}],6:[function(require,module,exports){
(function (global){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _src = require('../src');

var _qunit = (typeof window !== "undefined" ? window['QUnit'] : typeof global !== "undefined" ? global['QUnit'] : null);

var _qunit2 = _interopRequireDefault(_qunit);

var _testExpected = require('./test-expected.js');

var _testExpected2 = _interopRequireDefault(_testExpected);

var _testManifests = require('./test-manifests.js');

var _testManifests2 = _interopRequireDefault(_testManifests);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

_qunit2['default'].module('LineStream', {
  beforeEach: function beforeEach() {
    this.lineStream = new _src.LineStream();
  }
});
_qunit2['default'].test('empty inputs produce no tokens', function () {
  var data = false;

  this.lineStream.on('data', function () {
    data = true;
  });
  this.lineStream.push('');
  _qunit2['default'].ok(!data, 'no tokens were produced');
});
_qunit2['default'].test('splits on newlines', function () {
  var lines = [];

  this.lineStream.on('data', function (line) {
    lines.push(line);
  });
  this.lineStream.push('#EXTM3U\nmovie.ts\n');

  _qunit2['default'].strictEqual(2, lines.length, 'two lines are ready');
  _qunit2['default'].strictEqual('#EXTM3U', lines.shift(), 'the first line is the first token');
  _qunit2['default'].strictEqual('movie.ts', lines.shift(), 'the second line is the second token');
});
_qunit2['default'].test('empty lines become empty strings', function () {
  var lines = [];

  this.lineStream.on('data', function (line) {
    lines.push(line);
  });
  this.lineStream.push('\n\n');

  _qunit2['default'].strictEqual(2, lines.length, 'two lines are ready');
  _qunit2['default'].strictEqual('', lines.shift(), 'the first line is empty');
  _qunit2['default'].strictEqual('', lines.shift(), 'the second line is empty');
});
_qunit2['default'].test('handles lines broken across appends', function () {
  var lines = [];

  this.lineStream.on('data', function (line) {
    lines.push(line);
  });
  this.lineStream.push('#EXTM');
  _qunit2['default'].strictEqual(0, lines.length, 'no lines are ready');

  this.lineStream.push('3U\nmovie.ts\n');
  _qunit2['default'].strictEqual(2, lines.length, 'two lines are ready');
  _qunit2['default'].strictEqual('#EXTM3U', lines.shift(), 'the first line is the first token');
  _qunit2['default'].strictEqual('movie.ts', lines.shift(), 'the second line is the second token');
});
_qunit2['default'].test('stops sending events after deregistering', function () {
  var temporaryLines = [];
  var temporary = function temporary(line) {
    temporaryLines.push(line);
  };
  var permanentLines = [];
  var permanent = function permanent(line) {
    permanentLines.push(line);
  };

  this.lineStream.on('data', temporary);
  this.lineStream.on('data', permanent);
  this.lineStream.push('line one\n');
  _qunit2['default'].strictEqual(temporaryLines.length, permanentLines.length, 'both callbacks receive the event');

  _qunit2['default'].ok(this.lineStream.off('data', temporary), 'a listener was removed');
  this.lineStream.push('line two\n');
  _qunit2['default'].strictEqual(1, temporaryLines.length, 'no new events are received');
  _qunit2['default'].strictEqual(2, permanentLines.length, 'new events are still received');
});

_qunit2['default'].module('ParseStream', {
  beforeEach: function beforeEach() {
    this.lineStream = new _src.LineStream();
    this.parseStream = new _src.ParseStream();
    this.lineStream.pipe(this.parseStream);
  }
});
_qunit2['default'].test('parses comment lines', function () {
  var manifest = '# a line that starts with a hash mark without "EXT" is a comment\n';
  var element = void 0;

  this.parseStream.on('data', function (elem) {
    element = elem;
  });
  this.lineStream.push(manifest);

  _qunit2['default'].ok(element, 'an event was triggered');
  _qunit2['default'].strictEqual(element.type, 'comment', 'the type is comment');
  _qunit2['default'].strictEqual(element.text, manifest.slice(1, manifest.length - 1), 'the comment text is parsed');
});
_qunit2['default'].test('parses uri lines', function () {
  var manifest = 'any non-blank line that does not start with a hash-mark is a URI\n';
  var element = void 0;

  this.parseStream.on('data', function (elem) {
    element = elem;
  });
  this.lineStream.push(manifest);

  _qunit2['default'].ok(element, 'an event was triggered');
  _qunit2['default'].strictEqual(element.type, 'uri', 'the type is uri');
  _qunit2['default'].strictEqual(element.uri, manifest.substring(0, manifest.length - 1), 'the uri text is parsed');
});
_qunit2['default'].test('parses unknown tag types', function () {
  var manifest = '#EXT-X-EXAMPLE-TAG:some,additional,stuff\n';
  var element = void 0;

  this.parseStream.on('data', function (elem) {
    element = elem;
  });
  this.lineStream.push(manifest);

  _qunit2['default'].ok(element, 'an event was triggered');
  _qunit2['default'].strictEqual(element.type, 'tag', 'the type is tag');
  _qunit2['default'].strictEqual(element.data, manifest.slice(4, manifest.length - 1), 'unknown tag data is preserved');
});

// #EXTM3U
_qunit2['default'].test('parses #EXTM3U tags', function () {
  var manifest = '#EXTM3U\n';
  var element = void 0;

  this.parseStream.on('data', function (elem) {
    element = elem;
  });
  this.lineStream.push(manifest);

  _qunit2['default'].ok(element, 'an event was triggered');
  _qunit2['default'].strictEqual(element.type, 'tag', 'the line type is tag');
  _qunit2['default'].strictEqual(element.tagType, 'm3u', 'the tag type is m3u');
});

// #EXTINF
_qunit2['default'].test('parses minimal #EXTINF tags', function () {
  var manifest = '#EXTINF\n';
  var element = void 0;

  this.parseStream.on('data', function (elem) {
    element = elem;
  });
  this.lineStream.push(manifest);

  _qunit2['default'].ok(element, 'an event was triggered');
  _qunit2['default'].strictEqual(element.type, 'tag', 'the line type is tag');
  _qunit2['default'].strictEqual(element.tagType, 'inf', 'the tag type is inf');
});
_qunit2['default'].test('parses #EXTINF tags with durations', function () {
  var manifest = '#EXTINF:15\n';
  var element = void 0;

  this.parseStream.on('data', function (elem) {
    element = elem;
  });
  this.lineStream.push(manifest);

  _qunit2['default'].ok(element, 'an event was triggered');
  _qunit2['default'].strictEqual(element.type, 'tag', 'the line type is tag');
  _qunit2['default'].strictEqual(element.tagType, 'inf', 'the tag type is inf');
  _qunit2['default'].strictEqual(element.duration, 15, 'the duration is parsed');
  _qunit2['default'].ok(!('title' in element), 'no title is parsed');

  manifest = '#EXTINF:21,\n';
  this.lineStream.push(manifest);

  _qunit2['default'].ok(element, 'an event was triggered');
  _qunit2['default'].strictEqual(element.type, 'tag', 'the line type is tag');
  _qunit2['default'].strictEqual(element.tagType, 'inf', 'the tag type is inf');
  _qunit2['default'].strictEqual(element.duration, 21, 'the duration is parsed');
  _qunit2['default'].ok(!('title' in element), 'no title is parsed');
});
_qunit2['default'].test('parses #EXTINF tags with a duration and title', function () {
  var manifest = '#EXTINF:13,Does anyone really use the title attribute?\n';
  var element = void 0;

  this.parseStream.on('data', function (elem) {
    element = elem;
  });
  this.lineStream.push(manifest);

  _qunit2['default'].ok(element, 'an event was triggered');
  _qunit2['default'].strictEqual(element.type, 'tag', 'the line type is tag');
  _qunit2['default'].strictEqual(element.tagType, 'inf', 'the tag type is inf');
  _qunit2['default'].strictEqual(element.duration, 13, 'the duration is parsed');
  _qunit2['default'].strictEqual(element.title, manifest.substring(manifest.indexOf(',') + 1, manifest.length - 1), 'the title is parsed');
});
_qunit2['default'].test('parses #EXTINF tags with carriage returns', function () {
  var manifest = '#EXTINF:13,Does anyone really use the title attribute?\r\n';
  var element = void 0;

  this.parseStream.on('data', function (elem) {
    element = elem;
  });
  this.lineStream.push(manifest);

  _qunit2['default'].ok(element, 'an event was triggered');
  _qunit2['default'].strictEqual(element.type, 'tag', 'the line type is tag');
  _qunit2['default'].strictEqual(element.tagType, 'inf', 'the tag type is inf');
  _qunit2['default'].strictEqual(element.duration, 13, 'the duration is parsed');
  _qunit2['default'].strictEqual(element.title, manifest.substring(manifest.indexOf(',') + 1, manifest.length - 2), 'the title is parsed');
});

// #EXT-X-TARGETDURATION
_qunit2['default'].test('parses minimal #EXT-X-TARGETDURATION tags', function () {
  var manifest = '#EXT-X-TARGETDURATION\n';
  var element = void 0;

  this.parseStream.on('data', function (elem) {
    element = elem;
  });
  this.lineStream.push(manifest);

  _qunit2['default'].ok(element, 'an event was triggered');
  _qunit2['default'].strictEqual(element.type, 'tag', 'the line type is tag');
  _qunit2['default'].strictEqual(element.tagType, 'targetduration', 'the tag type is targetduration');
  _qunit2['default'].ok(!('duration' in element), 'no duration is parsed');
});
_qunit2['default'].test('parses #EXT-X-TARGETDURATION with duration', function () {
  var manifest = '#EXT-X-TARGETDURATION:47\n';
  var element = void 0;

  this.parseStream.on('data', function (elem) {
    element = elem;
  });
  this.lineStream.push(manifest);

  _qunit2['default'].ok(element, 'an event was triggered');
  _qunit2['default'].strictEqual(element.type, 'tag', 'the line type is tag');
  _qunit2['default'].strictEqual(element.tagType, 'targetduration', 'the tag type is targetduration');
  _qunit2['default'].strictEqual(element.duration, 47, 'the duration is parsed');
});

// #EXT-X-VERSION
_qunit2['default'].test('parses minimal #EXT-X-VERSION tags', function () {
  var manifest = '#EXT-X-VERSION:\n';
  var element = void 0;

  this.parseStream.on('data', function (elem) {
    element = elem;
  });
  this.lineStream.push(manifest);

  _qunit2['default'].ok(element, 'an event was triggered');
  _qunit2['default'].strictEqual(element.type, 'tag', 'the line type is tag');
  _qunit2['default'].strictEqual(element.tagType, 'version', 'the tag type is version');
  _qunit2['default'].ok(!('version' in element), 'no version is present');
});
_qunit2['default'].test('parses #EXT-X-VERSION with a version', function () {
  var manifest = '#EXT-X-VERSION:99\n';
  var element = void 0;

  this.parseStream.on('data', function (elem) {
    element = elem;
  });
  this.lineStream.push(manifest);

  _qunit2['default'].ok(element, 'an event was triggered');
  _qunit2['default'].strictEqual(element.type, 'tag', 'the line type is tag');
  _qunit2['default'].strictEqual(element.tagType, 'version', 'the tag type is version');
  _qunit2['default'].strictEqual(element.version, 99, 'the version is parsed');
});

// #EXT-X-MEDIA-SEQUENCE
_qunit2['default'].test('parses minimal #EXT-X-MEDIA-SEQUENCE tags', function () {
  var manifest = '#EXT-X-MEDIA-SEQUENCE\n';
  var element = void 0;

  this.parseStream.on('data', function (elem) {
    element = elem;
  });
  this.lineStream.push(manifest);

  _qunit2['default'].ok(element, 'an event was triggered');
  _qunit2['default'].strictEqual(element.type, 'tag', 'the line type is tag');
  _qunit2['default'].strictEqual(element.tagType, 'media-sequence', 'the tag type is media-sequence');
  _qunit2['default'].ok(!('number' in element), 'no number is present');
});
_qunit2['default'].test('parses #EXT-X-MEDIA-SEQUENCE with sequence numbers', function () {
  var manifest = '#EXT-X-MEDIA-SEQUENCE:109\n';
  var element = void 0;

  this.parseStream.on('data', function (elem) {
    element = elem;
  });
  this.lineStream.push(manifest);

  _qunit2['default'].ok(element, 'an event was triggered');
  _qunit2['default'].strictEqual(element.type, 'tag', 'the line type is tag');
  _qunit2['default'].strictEqual(element.tagType, 'media-sequence', 'the tag type is media-sequence');
  _qunit2['default'].ok(element.number, 109, 'the number is parsed');
});

// #EXT-X-PLAYLIST-TYPE
_qunit2['default'].test('parses minimal #EXT-X-PLAYLIST-TYPE tags', function () {
  var manifest = '#EXT-X-PLAYLIST-TYPE:\n';
  var element = void 0;

  this.parseStream.on('data', function (elem) {
    element = elem;
  });
  this.lineStream.push(manifest);

  _qunit2['default'].ok(element, 'an event was triggered');
  _qunit2['default'].strictEqual(element.type, 'tag', 'the line type is tag');
  _qunit2['default'].strictEqual(element.tagType, 'playlist-type', 'the tag type is playlist-type');
  _qunit2['default'].ok(!('playlistType' in element), 'no playlist type is present');
});
_qunit2['default'].test('parses #EXT-X-PLAYLIST-TYPE with mutability info', function () {
  var manifest = '#EXT-X-PLAYLIST-TYPE:EVENT\n';
  var element = void 0;

  this.parseStream.on('data', function (elem) {
    element = elem;
  });
  this.lineStream.push(manifest);

  _qunit2['default'].ok(element, 'an event was triggered');
  _qunit2['default'].strictEqual(element.type, 'tag', 'the line type is tag');
  _qunit2['default'].strictEqual(element.tagType, 'playlist-type', 'the tag type is playlist-type');
  _qunit2['default'].strictEqual(element.playlistType, 'EVENT', 'the playlist type is EVENT');

  manifest = '#EXT-X-PLAYLIST-TYPE:VOD\n';
  this.lineStream.push(manifest);
  _qunit2['default'].ok(element, 'an event was triggered');
  _qunit2['default'].strictEqual(element.type, 'tag', 'the line type is tag');
  _qunit2['default'].strictEqual(element.tagType, 'playlist-type', 'the tag type is playlist-type');
  _qunit2['default'].strictEqual(element.playlistType, 'VOD', 'the playlist type is VOD');

  manifest = '#EXT-X-PLAYLIST-TYPE:nonsense\n';
  this.lineStream.push(manifest);
  _qunit2['default'].ok(element, 'an event was triggered');
  _qunit2['default'].strictEqual(element.type, 'tag', 'the line type is tag');
  _qunit2['default'].strictEqual(element.tagType, 'playlist-type', 'the tag type is playlist-type');
  _qunit2['default'].strictEqual(element.playlistType, 'nonsense', 'the playlist type is parsed');
});

// #EXT-X-BYTERANGE
_qunit2['default'].test('parses minimal #EXT-X-BYTERANGE tags', function () {
  var manifest = '#EXT-X-BYTERANGE\n';
  var element = void 0;

  this.parseStream.on('data', function (elem) {
    element = elem;
  });
  this.lineStream.push(manifest);

  _qunit2['default'].ok(element, 'an event was triggered');
  _qunit2['default'].strictEqual(element.type, 'tag', 'the line type is tag');
  _qunit2['default'].strictEqual(element.tagType, 'byterange', 'the tag type is byterange');
  _qunit2['default'].ok(!('length' in element), 'no length is present');
  _qunit2['default'].ok(!('offset' in element), 'no offset is present');
});
_qunit2['default'].test('parses #EXT-X-BYTERANGE with length and offset', function () {
  var manifest = '#EXT-X-BYTERANGE:45\n';
  var element = void 0;

  this.parseStream.on('data', function (elem) {
    element = elem;
  });
  this.lineStream.push(manifest);

  _qunit2['default'].ok(element, 'an event was triggered');
  _qunit2['default'].strictEqual(element.type, 'tag', 'the line type is tag');
  _qunit2['default'].strictEqual(element.tagType, 'byterange', 'the tag type is byterange');
  _qunit2['default'].strictEqual(element.length, 45, 'length is parsed');
  _qunit2['default'].ok(!('offset' in element), 'no offset is present');

  manifest = '#EXT-X-BYTERANGE:108@16\n';
  this.lineStream.push(manifest);
  _qunit2['default'].ok(element, 'an event was triggered');
  _qunit2['default'].strictEqual(element.type, 'tag', 'the line type is tag');
  _qunit2['default'].strictEqual(element.tagType, 'byterange', 'the tag type is byterange');
  _qunit2['default'].strictEqual(element.length, 108, 'length is parsed');
  _qunit2['default'].strictEqual(element.offset, 16, 'offset is parsed');
});

// #EXT-X-ALLOW-CACHE
_qunit2['default'].test('parses minimal #EXT-X-ALLOW-CACHE tags', function () {
  var manifest = '#EXT-X-ALLOW-CACHE:\n';
  var element = void 0;

  this.parseStream.on('data', function (elem) {
    element = elem;
  });
  this.lineStream.push(manifest);

  _qunit2['default'].ok(element, 'an event was triggered');
  _qunit2['default'].strictEqual(element.type, 'tag', 'the line type is tag');
  _qunit2['default'].strictEqual(element.tagType, 'allow-cache', 'the tag type is allow-cache');
  _qunit2['default'].ok(!('allowed' in element), 'no allowed is present');
});
_qunit2['default'].test('parses valid #EXT-X-ALLOW-CACHE tags', function () {
  var manifest = '#EXT-X-ALLOW-CACHE:YES\n';
  var element = void 0;

  this.parseStream.on('data', function (elem) {
    element = elem;
  });
  this.lineStream.push(manifest);

  _qunit2['default'].ok(element, 'an event was triggered');
  _qunit2['default'].strictEqual(element.type, 'tag', 'the line type is tag');
  _qunit2['default'].strictEqual(element.tagType, 'allow-cache', 'the tag type is allow-cache');
  _qunit2['default'].ok(element.allowed, 'allowed is parsed');

  manifest = '#EXT-X-ALLOW-CACHE:NO\n';
  this.lineStream.push(manifest);

  _qunit2['default'].ok(element, 'an event was triggered');
  _qunit2['default'].strictEqual(element.type, 'tag', 'the line type is tag');
  _qunit2['default'].strictEqual(element.tagType, 'allow-cache', 'the tag type is allow-cache');
  _qunit2['default'].ok(!element.allowed, 'allowed is parsed');
});
// #EXT-X-MAP
_qunit2['default'].test('parses minimal #EXT-X-MAP tags', function () {
  var manifest = '#EXT-X-MAP:URI="init.m4s"\n';
  var element = void 0;

  this.parseStream.on('data', function (elem) {
    element = elem;
  });

  this.lineStream.push(manifest);
  _qunit2['default'].ok(element, 'an event was triggered');
  _qunit2['default'].strictEqual(element.type, 'tag', 'the line type is tag');
  _qunit2['default'].strictEqual(element.tagType, 'map', 'the tag type is map');
  _qunit2['default'].strictEqual(element.uri, 'init.m4s', 'parsed the uri');
});
_qunit2['default'].test('parses #EXT-X-MAP tags with a byterange', function () {
  var manifest = '#EXT-X-MAP:URI="0.m4s", BYTERANGE="1000@23"\n';
  var element = void 0;

  this.parseStream.on('data', function (elem) {
    element = elem;
  });

  this.lineStream.push(manifest);
  _qunit2['default'].ok(element, 'an event was triggered');
  _qunit2['default'].strictEqual(element.uri, '0.m4s', 'parsed the uri');
  _qunit2['default'].strictEqual(element.byterange.length, 1000, 'parsed the byterange length');
  _qunit2['default'].strictEqual(element.byterange.offset, 23, 'parsed the byterange offset');
});
_qunit2['default'].test('parses #EXT-X-MAP tags with arbitrary attributes', function () {
  var manifest = '#EXT-X-MAP:URI="init.mp4", SOMETHING=YES,BYTERANGE="720@0"\n';
  var element = void 0;

  this.parseStream.on('data', function (elem) {
    element = elem;
  });

  this.lineStream.push(manifest);
  _qunit2['default'].ok(element, 'an event was triggered');
  _qunit2['default'].strictEqual(element.uri, 'init.mp4', 'parsed the uri');
  _qunit2['default'].strictEqual(element.byterange.length, 720, 'parsed the byterange length');
  _qunit2['default'].strictEqual(element.byterange.offset, 0, 'parsed the byterange offset');
});
// #EXT-X-STREAM-INF
_qunit2['default'].test('parses minimal #EXT-X-STREAM-INF tags', function () {
  var manifest = '#EXT-X-STREAM-INF\n';
  var element = void 0;

  this.parseStream.on('data', function (elem) {
    element = elem;
  });
  this.lineStream.push(manifest);

  _qunit2['default'].ok(element, 'an event was triggered');
  _qunit2['default'].strictEqual(element.type, 'tag', 'the line type is tag');
  _qunit2['default'].strictEqual(element.tagType, 'stream-inf', 'the tag type is stream-inf');
  _qunit2['default'].ok(!('attributes' in element), 'no attributes are present');
});
// #EXT-X-PROGRAM-DATE-TIME
_qunit2['default'].test('parses minimal EXT-X-PROGRAM-DATE-TIME tags', function () {
  var manifest = '#EXT-X-PROGRAM-DATE-TIME\n';
  var element = void 0;

  this.parseStream.on('data', function (elem) {
    element = elem;
  });
  this.lineStream.push(manifest);

  _qunit2['default'].ok(element, 'an event was triggered');
  _qunit2['default'].strictEqual(element.type, 'tag', 'the line type is tag');
  _qunit2['default'].strictEqual(element.tagType, 'program-date-time', 'the tag type is date-time');
  _qunit2['default'].ok(!('dateTimeString' in element), 'no dateTime is present');
});
_qunit2['default'].test('parses EXT-X-PROGRAM-DATE-TIME tags with valid date-time formats', function () {
  var manifest = '#EXT-X-PROGRAM-DATE-TIME:2016-06-22T09:20:16.166-04:00\n';
  var element = void 0;

  this.parseStream.on('data', function (elem) {
    element = elem;
  });
  this.lineStream.push(manifest);

  _qunit2['default'].ok(element, 'an event was triggered');
  _qunit2['default'].strictEqual(element.type, 'tag', 'the line type is tag');
  _qunit2['default'].strictEqual(element.tagType, 'program-date-time', 'the tag type is date-time');
  _qunit2['default'].strictEqual(element.dateTimeString, '2016-06-22T09:20:16.166-04:00', 'dateTimeString is parsed');
  _qunit2['default'].deepEqual(element.dateTimeObject, new Date('2016-06-22T09:20:16.166-04:00'), 'dateTimeObject is parsed');

  manifest = '#EXT-X-PROGRAM-DATE-TIME:2016-06-22T09:20:16.16389Z\n';
  this.lineStream.push(manifest);

  _qunit2['default'].ok(element, 'an event was triggered');
  _qunit2['default'].strictEqual(element.type, 'tag', 'the line type is tag');
  _qunit2['default'].strictEqual(element.tagType, 'program-date-time', 'the tag type is date-time');
  _qunit2['default'].strictEqual(element.dateTimeString, '2016-06-22T09:20:16.16389Z', 'dateTimeString is parsed');
  _qunit2['default'].deepEqual(element.dateTimeObject, new Date('2016-06-22T09:20:16.16389Z'), 'dateTimeObject is parsed');
});
_qunit2['default'].test('parses #EXT-X-STREAM-INF with common attributes', function () {
  var manifest = '#EXT-X-STREAM-INF:BANDWIDTH=14400\n';
  var element = void 0;

  this.parseStream.on('data', function (elem) {
    element = elem;
  });
  this.lineStream.push(manifest);

  _qunit2['default'].ok(element, 'an event was triggered');
  _qunit2['default'].strictEqual(element.type, 'tag', 'the line type is tag');
  _qunit2['default'].strictEqual(element.tagType, 'stream-inf', 'the tag type is stream-inf');
  _qunit2['default'].strictEqual(element.attributes.BANDWIDTH, 14400, 'bandwidth is parsed');

  manifest = '#EXT-X-STREAM-INF:PROGRAM-ID=7\n';
  this.lineStream.push(manifest);

  _qunit2['default'].ok(element, 'an event was triggered');
  _qunit2['default'].strictEqual(element.type, 'tag', 'the line type is tag');
  _qunit2['default'].strictEqual(element.tagType, 'stream-inf', 'the tag type is stream-inf');
  _qunit2['default'].strictEqual(element.attributes['PROGRAM-ID'], 7, 'program-id is parsed');

  manifest = '#EXT-X-STREAM-INF:RESOLUTION=396x224\n';
  this.lineStream.push(manifest);

  _qunit2['default'].ok(element, 'an event was triggered');
  _qunit2['default'].strictEqual(element.type, 'tag', 'the line type is tag');
  _qunit2['default'].strictEqual(element.tagType, 'stream-inf', 'the tag type is stream-inf');
  _qunit2['default'].strictEqual(element.attributes.RESOLUTION.width, 396, 'width is parsed');
  _qunit2['default'].strictEqual(element.attributes.RESOLUTION.height, 224, 'heigth is parsed');

  manifest = '#EXT-X-STREAM-INF:CODECS="avc1.4d400d, mp4a.40.2"\n';
  this.lineStream.push(manifest);

  _qunit2['default'].ok(element, 'an event was triggered');
  _qunit2['default'].strictEqual(element.type, 'tag', 'the line type is tag');
  _qunit2['default'].strictEqual(element.tagType, 'stream-inf', 'the tag type is stream-inf');
  _qunit2['default'].strictEqual(element.attributes.CODECS, 'avc1.4d400d, mp4a.40.2', 'codecs are parsed');
});
_qunit2['default'].test('parses #EXT-X-STREAM-INF with arbitrary attributes', function () {
  var manifest = '#EXT-X-STREAM-INF:NUMERIC=24,ALPHA=Value,MIXED=123abc\n';
  var element = void 0;

  this.parseStream.on('data', function (elem) {
    element = elem;
  });
  this.lineStream.push(manifest);

  _qunit2['default'].ok(element, 'an event was triggered');
  _qunit2['default'].strictEqual(element.type, 'tag', 'the line type is tag');
  _qunit2['default'].strictEqual(element.tagType, 'stream-inf', 'the tag type is stream-inf');
  _qunit2['default'].strictEqual(element.attributes.NUMERIC, '24', 'numeric attributes are parsed');
  _qunit2['default'].strictEqual(element.attributes.ALPHA, 'Value', 'alphabetic attributes are parsed');
  _qunit2['default'].strictEqual(element.attributes.MIXED, '123abc', 'mixed attributes are parsed');
});
// #EXT-X-ENDLIST
_qunit2['default'].test('parses #EXT-X-ENDLIST tags', function () {
  var manifest = '#EXT-X-ENDLIST\n';
  var element = void 0;

  this.parseStream.on('data', function (elem) {
    element = elem;
  });
  this.lineStream.push(manifest);

  _qunit2['default'].ok(element, 'an event was triggered');
  _qunit2['default'].strictEqual(element.type, 'tag', 'the line type is tag');
  _qunit2['default'].strictEqual(element.tagType, 'endlist', 'the tag type is stream-inf');
});

// #EXT-X-KEY
_qunit2['default'].test('parses valid #EXT-X-KEY tags', function () {
  var manifest = '#EXT-X-KEY:METHOD=AES-128,URI="https://priv.example.com/key.php?r=52"\n';
  var element = void 0;

  this.parseStream.on('data', function (elem) {
    element = elem;
  });
  this.lineStream.push(manifest);

  _qunit2['default'].ok(element, 'an event was triggered');
  _qunit2['default'].deepEqual(element, {
    type: 'tag',
    tagType: 'key',
    attributes: {
      METHOD: 'AES-128',
      URI: 'https://priv.example.com/key.php?r=52'
    }
  }, 'parsed a valid key');

  manifest = '#EXT-X-KEY:URI="https://example.com/key#1",METHOD=FutureType-1024\n';
  this.lineStream.push(manifest);
  _qunit2['default'].ok(element, 'an event was triggered');
  _qunit2['default'].deepEqual(element, {
    type: 'tag',
    tagType: 'key',
    attributes: {
      METHOD: 'FutureType-1024',
      URI: 'https://example.com/key#1'
    }
  }, 'parsed the attribute list independent of order');

  manifest = '#EXT-X-KEY:IV=1234567890abcdef1234567890abcdef\n';
  this.lineStream.push(manifest);
  _qunit2['default'].ok(element.attributes.IV, 'detected an IV attribute');
  _qunit2['default'].deepEqual(element.attributes.IV, new Uint32Array([0x12345678, 0x90abcdef, 0x12345678, 0x90abcdef]), 'parsed an IV value');
});

_qunit2['default'].test('parses minimal #EXT-X-KEY tags', function () {
  var manifest = '#EXT-X-KEY:\n';
  var element = void 0;

  this.parseStream.on('data', function (elem) {
    element = elem;
  });
  this.lineStream.push(manifest);

  _qunit2['default'].ok(element, 'an event was triggered');
  _qunit2['default'].deepEqual(element, {
    type: 'tag',
    tagType: 'key'
  }, 'parsed a minimal key tag');
});

_qunit2['default'].test('parses lightly-broken #EXT-X-KEY tags', function () {
  var manifest = '#EXT-X-KEY:URI=\'https://example.com/single-quote\',METHOD=AES-128\n';
  var element = void 0;

  this.parseStream.on('data', function (elem) {
    element = elem;
  });
  this.lineStream.push(manifest);

  _qunit2['default'].strictEqual(element.attributes.URI, 'https://example.com/single-quote', 'parsed a single-quoted uri');

  element = null;
  manifest = '#EXT-X-KEYURI="https://example.com/key",METHOD=AES-128\n';
  this.lineStream.push(manifest);
  _qunit2['default'].strictEqual(element.tagType, 'key', 'parsed the tag type');
  _qunit2['default'].strictEqual(element.attributes.URI, 'https://example.com/key', 'inferred a colon after the tag type');

  element = null;
  manifest = '#EXT-X-KEY:  URI =  "https://example.com/key",METHOD=AES-128\n';
  this.lineStream.push(manifest);
  _qunit2['default'].strictEqual(element.attributes.URI, 'https://example.com/key', 'trims and removes quotes around the URI');
});

_qunit2['default'].test('parses prefixed with 0x or 0X #EXT-X-KEY:IV tags', function () {
  var manifest = void 0;
  var element = void 0;

  this.parseStream.on('data', function (elem) {
    element = elem;
  });

  manifest = '#EXT-X-KEY:IV=0x1234567890abcdef1234567890abcdef\n';
  this.lineStream.push(manifest);
  _qunit2['default'].ok(element.attributes.IV, 'detected an IV attribute');
  _qunit2['default'].deepEqual(element.attributes.IV, new Uint32Array([0x12345678, 0x90abcdef, 0x12345678, 0x90abcdef]), 'parsed an IV value with 0x');

  manifest = '#EXT-X-KEY:IV=0X1234567890abcdef1234567890abcdef\n';
  this.lineStream.push(manifest);
  _qunit2['default'].ok(element.attributes.IV, 'detected an IV attribute');
  _qunit2['default'].deepEqual(element.attributes.IV, new Uint32Array([0x12345678, 0x90abcdef, 0x12345678, 0x90abcdef]), 'parsed an IV value with 0X');
});

_qunit2['default'].test('ignores empty lines', function () {
  var manifest = '\n';
  var event = false;

  this.parseStream.on('data', function () {
    event = true;
  });
  this.lineStream.push(manifest);

  _qunit2['default'].ok(!event, 'no event is triggered');
});

_qunit2['default'].module('m3u8 parser');

_qunit2['default'].test('can be constructed', function () {
  _qunit2['default'].notStrictEqual(_typeof(new _src.Parser()), 'undefined', 'parser is defined');
});

_qunit2['default'].test('attaches cue-out data to segment', function () {
  var parser = new _src.Parser();

  var manifest = ['#EXTM3U', '#EXTINF:5,', '#COMMENT', 'ex1.ts', '#EXT-X-CUE-OUT:10', '#EXTINF:5,', 'ex2.ts', '#EXT-X-CUE-OUT15', '#EXT-UKNOWN-TAG', '#EXTINF:5,', 'ex3.ts', '#EXT-X-CUE-OUT', '#EXTINF:5,', 'ex3.ts', '#EXT-X-ENDLIST'].join('\n');

  parser.push(manifest);

  _qunit2['default'].equal(parser.manifest.segments[1].cueOut, '10', 'parser attached cue out tag');
  _qunit2['default'].equal(parser.manifest.segments[2].cueOut, '15', 'cue out without : seperator');
  _qunit2['default'].equal(parser.manifest.segments[3].cueOut, '', 'cue out without data');
});

_qunit2['default'].test('attaches cue-out-cont data to segment', function () {
  var parser = new _src.Parser();

  var manifest = ['#EXTM3U', '#EXTINF:5,', '#COMMENT', 'ex1.ts', '#EXT-X-CUE-OUT-CONT:10/60', '#EXTINF:5,', 'ex2.ts', '#EXT-X-CUE-OUT-CONT15/30', '#EXT-UKNOWN-TAG', '#EXTINF:5,', 'ex3.ts', '#EXT-X-CUE-OUT-CONT', '#EXTINF:5,', 'ex3.ts', '#EXT-X-ENDLIST'].join('\n');

  parser.push(manifest);

  _qunit2['default'].equal(parser.manifest.segments[1].cueOutCont, '10/60', 'parser attached cue out cont tag');
  _qunit2['default'].equal(parser.manifest.segments[2].cueOutCont, '15/30', 'cue out cont without : seperator');
  _qunit2['default'].equal(parser.manifest.segments[3].cueOutCont, '', 'cue out cont without data');
});

_qunit2['default'].test('attaches cue-in data to segment', function () {
  var parser = new _src.Parser();

  var manifest = ['#EXTM3U', '#EXTINF:5,', '#COMMENT', 'ex1.ts', '#EXT-X-CUE-IN', '#EXTINF:5,', 'ex2.ts', '#EXT-X-CUE-IN:15', '#EXT-UKNOWN-TAG', '#EXTINF:5,', 'ex3.ts', '#EXT-X-CUE-IN=abc', '#EXTINF:5,', 'ex3.ts', '#EXT-X-ENDLIST'].join('\n');

  parser.push(manifest);

  _qunit2['default'].equal(parser.manifest.segments[1].cueIn, '', 'parser attached cue in tag');
  _qunit2['default'].equal(parser.manifest.segments[2].cueIn, '15', 'cue in with data');
  _qunit2['default'].equal(parser.manifest.segments[3].cueIn, '=abc', 'cue in without colon seperator');
});

_qunit2['default'].test('parses characteristics attribute', function () {
  var parser = new _src.Parser();

  var manifest = ['#EXTM3U', '#EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="subs",CHARACTERISTICS="char",NAME="test"', '#EXT-X-STREAM-INF:BANDWIDTH=1,CODECS="mp4a.40.2, avc1.4d400d",SUBTITLES="subs"', 'index.m3u8'].join('\n');

  parser.push(manifest);

  _qunit2['default'].equal(parser.manifest.mediaGroups.SUBTITLES.subs.test.characteristics, 'char', 'parsed CHARACTERISTICS attribute');
});

_qunit2['default'].test('parses FORCED attribute', function () {
  var parser = new _src.Parser();

  var manifest = ['#EXTM3U', '#EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="subs",CHARACTERISTICS="char",NAME="test",FORCED=YES', '#EXT-X-STREAM-INF:BANDWIDTH=1,CODECS="mp4a.40.2, avc1.4d400d",SUBTITLES="subs"', 'index.m3u8'].join('\n');

  parser.push(manifest);

  _qunit2['default'].ok(parser.manifest.mediaGroups.SUBTITLES.subs.test.forced, 'parsed FORCED attribute');
});

_qunit2['default'].module('m3u8s');

_qunit2['default'].test('parses static manifests as expected', function () {
  var key = void 0;

  for (key in _testManifests2['default']) {
    if (_testExpected2['default'][key]) {
      var parser = new _src.Parser();

      parser.push(_testManifests2['default'][key]);
      _qunit2['default'].deepEqual(parser.manifest, _testExpected2['default'][key], key + '.m3u8 was parsed correctly');
    }
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../src":1,"./test-expected.js":7,"./test-manifests.js":8}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = {
  "absoluteUris": {
    "allowCache": true,
    "mediaSequence": 0,
    "playlistType": "VOD",
    "segments": [{
      "duration": 10,
      "timeline": 0,
      "uri": "http://example.com/00001.ts"
    }, {
      "duration": 10,
      "timeline": 0,
      "uri": "https://example.com/00002.ts"
    }, {
      "duration": 10,
      "timeline": 0,
      "uri": "//example.com/00003.ts"
    }, {
      "duration": 10,
      "timeline": 0,
      "uri": "http://example.com/00004.ts"
    }],
    "targetDuration": 10,
    "endList": true,
    "discontinuitySequence": 0,
    "discontinuityStarts": []
  },

  "allowCache": {
    "allowCache": true,
    "mediaSequence": 0,
    "playlistType": "VOD",
    "segments": [{
      "byterange": {
        "length": 522828,
        "offset": 0
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "byterange": {
        "length": 587500,
        "offset": 522828
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "byterange": {
        "length": 713084,
        "offset": 1110328
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "byterange": {
        "length": 476580,
        "offset": 1823412
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "byterange": {
        "length": 535612,
        "offset": 2299992
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "byterange": {
        "length": 207176,
        "offset": 2835604
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "byterange": {
        "length": 455900,
        "offset": 3042780
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "byterange": {
        "length": 657248,
        "offset": 3498680
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "byterange": {
        "length": 571708,
        "offset": 4155928
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "byterange": {
        "length": 485040,
        "offset": 4727636
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "byterange": {
        "length": 709136,
        "offset": 5212676
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "byterange": {
        "length": 730004,
        "offset": 5921812
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "byterange": {
        "length": 456276,
        "offset": 6651816
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "byterange": {
        "length": 468684,
        "offset": 7108092
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "byterange": {
        "length": 444996,
        "offset": 7576776
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "byterange": {
        "length": 331444,
        "offset": 8021772
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "byterange": {
        "length": 44556,
        "offset": 8353216
      },
      "duration": 1.4167,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }],
    "targetDuration": 10,
    "endList": true,
    "discontinuitySequence": 0,
    "discontinuityStarts": []
  },

  "allowCacheInvalid": {
    "allowCache": true,
    "mediaSequence": 0,
    "playlistType": "VOD",
    "segments": [{
      "byterange": {
        "length": 522828,
        "offset": 0
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }],
    "targetDuration": 10,
    "endList": true,
    "discontinuitySequence": 0,
    "discontinuityStarts": []
  },

  "alternateAudio": {
    allowCache: true,
    discontinuityStarts: [],
    mediaGroups: {
      // TYPE
      AUDIO: {
        // GROUP-ID
        "audio": {
          // NAME
          "English": {
            language: 'eng',
            autoselect: true,
            "default": true,
            uri: "eng/prog_index.m3u8"
          },
          // NAME
          "Français": {
            language: "fre",
            autoselect: true,
            "default": false,
            uri: "fre/prog_index.m3u8"
          },
          // NAME
          "Espanol": {
            language: "sp",
            autoselect: true,
            "default": false,
            uri: "sp/prog_index.m3u8"
          }
        }
      },
      VIDEO: {},
      "CLOSED-CAPTIONS": {},
      SUBTITLES: {}
    },
    playlists: [{
      attributes: {
        "PROGRAM-ID": 1,
        BANDWIDTH: 195023,
        CODECS: "avc1.42e00a,mp4a.40.2",
        AUDIO: 'audio'
      },
      timeline: 0,
      uri: "lo/prog_index.m3u8"
    }, {
      attributes: {
        "PROGRAM-ID": 1,
        BANDWIDTH: 591680,
        CODECS: "avc1.42e01e,mp4a.40.2",
        AUDIO: 'audio'
      },
      timeline: 0,
      uri: "hi/prog_index.m3u8"
    }],
    segments: []
  },

  "alternateVideo": {
    allowCache: true,
    discontinuityStarts: [],
    mediaGroups: {
      AUDIO: {
        aac: {
          English: {
            autoselect: true,
            "default": true,
            language: "eng",
            uri: "eng/prog_index.m3u8"
          }
        }
      },
      VIDEO: {
        "500kbs": {
          Angle1: {
            autoselect: true,
            "default": true
          },
          Angle2: {
            autoselect: true,
            "default": false,
            uri: "Angle2/500kbs/prog_index.m3u8"
          },
          Angle3: {
            autoselect: true,
            "default": false,
            uri: "Angle3/500kbs/prog_index.m3u8"
          }
        }
      },
      "CLOSED-CAPTIONS": {},
      SUBTITLES: {}
    },
    playlists: [{
      attributes: {
        "PROGRAM-ID": 1,
        BANDWIDTH: 754857,
        CODECS: "mp4a.40.2,avc1.4d401e",
        AUDIO: "aac",
        VIDEO: "500kbs"
      },
      timeline: 0,
      uri: "Angle1/500kbs/prog_index.m3u8"
    }],
    segments: []
  },

  "brightcove": {
    "allowCache": true,
    "playlists": [{
      "attributes": {
        "PROGRAM-ID": 1,
        "BANDWIDTH": 240000,
        "RESOLUTION": {
          "width": 396,
          "height": 224
        }
      },
      "timeline": 0,
      "uri": "http://c.brightcove.com/services/mobile/streaming/index/rendition.m3u8?assetId=1824686811001&videoId=1824650741001"
    }, {
      "attributes": {
        "PROGRAM-ID": 1,
        "BANDWIDTH": 40000
      },
      "timeline": 0,
      "uri": "http://c.brightcove.com/services/mobile/streaming/index/rendition.m3u8?assetId=1824683759001&videoId=1824650741001"
    }, {
      "attributes": {
        "PROGRAM-ID": 1,
        "BANDWIDTH": 440000,
        "RESOLUTION": {
          "width": 396,
          "height": 224
        }
      },
      "timeline": 0,
      "uri": "http://c.brightcove.com/services/mobile/streaming/index/rendition.m3u8?assetId=1824686593001&videoId=1824650741001"
    }, {
      "attributes": {
        "PROGRAM-ID": 1,
        "BANDWIDTH": 1928000,
        "RESOLUTION": {
          "width": 960,
          "height": 540
        }
      },
      "timeline": 0,
      "uri": "http://c.brightcove.com/services/mobile/streaming/index/rendition.m3u8?assetId=1824687660001&videoId=1824650741001"
    }],
    "discontinuityStarts": [],
    "mediaGroups": {
      "VIDEO": {},
      "AUDIO": {},
      "CLOSED-CAPTIONS": {},
      "SUBTITLES": {}
    },
    "segments": []
  },

  "byteRange": {
    "allowCache": true,
    "mediaSequence": 0,
    "playlistType": "VOD",
    "segments": [{
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "byterange": {
        "length": 587500,
        "offset": 522828
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "byterange": {
        "length": 713084,
        "offset": 0
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video2.ts"
    }, {
      "byterange": {
        "length": 476580,
        "offset": 1823412
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "byterange": {
        "length": 535612,
        "offset": 2299992
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "byterange": {
        "length": 207176,
        "offset": 2835604
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "byterange": {
        "length": 455900,
        "offset": 3042780
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "byterange": {
        "length": 657248,
        "offset": 3498680
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "byterange": {
        "length": 571708,
        "offset": 4155928
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "byterange": {
        "length": 485040,
        "offset": 4727636
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "byterange": {
        "length": 709136,
        "offset": 5212676
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "byterange": {
        "length": 730004,
        "offset": 5921812
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "byterange": {
        "length": 456276,
        "offset": 6651816
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "byterange": {
        "length": 468684,
        "offset": 7108092
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "byterange": {
        "length": 444996,
        "offset": 7576776
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "byterange": {
        "length": 331444,
        "offset": 8021772
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "byterange": {
        "length": 44556,
        "offset": 8353216
      },
      "duration": 1.4167,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }],
    "targetDuration": 10,
    "endList": true,
    "discontinuitySequence": 0,
    "discontinuityStarts": []
  },

  "dateTime": {
    "allowCache": false,
    "mediaSequence": 0,
    "playlistType": "VOD",
    "segments": [{
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }],
    "targetDuration": 10,
    "endList": true,
    "dateTimeString": "2016-06-22T09:20:16.166-04:00",
    "dateTimeObject": new Date("2016-06-22T09:20:16.166-04:00"),
    "discontinuitySequence": 0,
    "discontinuityStarts": []
  },

  "disallowCache": {
    "allowCache": false,
    "mediaSequence": 0,
    "playlistType": "VOD",
    "segments": [{
      "byterange": {
        "length": 522828,
        "offset": 0
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }],
    "targetDuration": 10,
    "endList": true,
    "discontinuitySequence": 0,
    "discontinuityStarts": []
  },

  "disc-sequence": {
    "allowCache": true,
    "mediaSequence": 0,
    "discontinuitySequence": 3,
    "segments": [{
      "duration": 10,
      "timeline": 3,
      "uri": "001.ts"
    }, {
      "duration": 19,
      "timeline": 3,
      "uri": "002.ts"
    }, {
      "discontinuity": true,
      "duration": 10,
      "timeline": 4,
      "uri": "003.ts"
    }, {
      "duration": 11,
      "timeline": 4,
      "uri": "004.ts"
    }],
    "targetDuration": 19,
    "endList": true,
    "discontinuityStarts": [2]
  },

  "discontinuity": {
    "allowCache": true,
    "mediaSequence": 0,
    "discontinuitySequence": 0,
    "segments": [{
      "duration": 10,
      "timeline": 0,
      "uri": "001.ts"
    }, {
      "duration": 19,
      "timeline": 0,
      "uri": "002.ts"
    }, {
      "discontinuity": true,
      "duration": 10,
      "timeline": 1,
      "uri": "003.ts"
    }, {
      "duration": 11,
      "timeline": 1,
      "uri": "004.ts"
    }, {
      "discontinuity": true,
      "duration": 10,
      "timeline": 2,
      "uri": "005.ts"
    }, {
      "duration": 10,
      "timeline": 2,
      "uri": "006.ts"
    }, {
      "duration": 10,
      "timeline": 2,
      "uri": "007.ts"
    }, {
      "discontinuity": true,
      "duration": 10,
      "timeline": 3,
      "uri": "008.ts"
    }, {
      "duration": 16,
      "timeline": 3,
      "uri": "009.ts"
    }],
    "targetDuration": 19,
    "endList": true,
    "discontinuityStarts": [2, 4, 7]
  },

  "domainUris": {
    "allowCache": true,
    "mediaSequence": 0,
    "playlistType": "VOD",
    "segments": [{
      "duration": 10,
      "timeline": 0,
      "uri": "/00001.ts"
    }, {
      "duration": 10,
      "timeline": 0,
      "uri": "/subdir/00002.ts"
    }, {
      "duration": 10,
      "timeline": 0,
      "uri": "/00003.ts"
    }, {
      "duration": 10,
      "timeline": 0,
      "uri": "/00004.ts"
    }],
    "targetDuration": 10,
    "endList": true,
    "discontinuitySequence": 0,
    "discontinuityStarts": []
  },

  "empty": {
    "allowCache": true,
    "discontinuityStarts": [],
    "segments": []
  },

  "emptyAllowCache": {
    "allowCache": true,
    "mediaSequence": 0,
    "playlistType": "VOD",
    "segments": [{
      "byterange": {
        "length": 522828,
        "offset": 0
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }],
    "targetDuration": 10,
    "endList": true,
    "discontinuitySequence": 0,
    "discontinuityStarts": []
  },

  "emptyMediaSequence": {
    "allowCache": true,
    "mediaSequence": 0,
    "playlistType": "VOD",
    "segments": [{
      "duration": 6.64,
      "timeline": 0,
      "uri": "/test/ts-files/tvy7/8a5e2822668b5370f4eb1438b2564fb7ab12ffe1-hi720.ts"
    }, {
      "duration": 6.08,
      "timeline": 0,
      "uri": "/test/ts-files/tvy7/56be1cef869a1c0cc8e38864ad1add17d187f051-hi720.ts"
    }, {
      "duration": 6.6,
      "timeline": 0,
      "uri": "/test/ts-files/tvy7/549c8c77f55f049741a06596e5c1e01dacaa46d0-hi720.ts"
    }, {
      "duration": 5,
      "timeline": 0,
      "uri": "/test/ts-files/tvy7/6cfa378684ffeb1c455a64dae6c103290a1f53d4-hi720.ts"
    }],
    "targetDuration": 8,
    "endList": true,
    "discontinuitySequence": 0,
    "discontinuityStarts": []
  },

  "emptyPlaylistType": {
    "allowCache": true,
    "mediaSequence": 0,
    "segments": [{
      "duration": 10,
      "timeline": 0,
      "uri": "/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00001.ts"
    }, {
      "duration": 10,
      "timeline": 0,
      "uri": "/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00002.ts"
    }, {
      "duration": 10,
      "timeline": 0,
      "uri": "/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00003.ts"
    }, {
      "duration": 10,
      "timeline": 0,
      "uri": "/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00004.ts"
    }, {
      "duration": 10,
      "timeline": 0,
      "uri": "/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00005.ts"
    }, {
      "duration": 8,
      "timeline": 0,
      "uri": "/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00006.ts"
    }],
    "targetDuration": 10,
    "endList": true,
    "discontinuitySequence": 0,
    "discontinuityStarts": []
  },

  "emptyTargetDuration": {
    "allowCache": true,
    "playlists": [{
      "attributes": {
        "PROGRAM-ID": 1,
        "BANDWIDTH": 240000,
        "RESOLUTION": {
          "width": 396,
          "height": 224
        }
      },
      "timeline": 0,
      "uri": "http://c.brightcove.com/services/mobile/streaming/index/rendition.m3u8?assetId=1824686811001&videoId=1824650741001"
    }, {
      "attributes": {
        "PROGRAM-ID": 1,
        "BANDWIDTH": 40000
      },
      "timeline": 0,
      "uri": "http://c.brightcove.com/services/mobile/streaming/index/rendition.m3u8?assetId=1824683759001&videoId=1824650741001"
    }, {
      "attributes": {
        "PROGRAM-ID": 1,
        "BANDWIDTH": 440000,
        "RESOLUTION": {
          "width": 396,
          "height": 224
        }
      },
      "timeline": 0,
      "uri": "http://c.brightcove.com/services/mobile/streaming/index/rendition.m3u8?assetId=1824686593001&videoId=1824650741001"
    }, {
      "attributes": {
        "PROGRAM-ID": 1,
        "BANDWIDTH": 1928000,
        "RESOLUTION": {
          "width": 960,
          "height": 540
        }
      },
      "timeline": 0,
      "uri": "http://c.brightcove.com/services/mobile/streaming/index/rendition.m3u8?assetId=1824687660001&videoId=1824650741001"
    }],
    "discontinuityStarts": [],
    "mediaGroups": {
      "VIDEO": {},
      "AUDIO": {},
      "CLOSED-CAPTIONS": {},
      "SUBTITLES": {}
    },
    "segments": []
  },

  "encrypted": {
    "allowCache": true,
    "mediaSequence": 7794,
    "discontinuitySequence": 0,
    "discontinuityStarts": [],
    "segments": [{
      "duration": 2.833,
      "timeline": 0,
      "key": {
        "method": "AES-128",
        "uri": "https://priv.example.com/key.php?r=52"
      },
      "uri": "http://media.example.com/fileSequence52-A.ts"
    }, {
      "duration": 15,
      "timeline": 0,
      "key": {
        "method": "AES-128",
        "uri": "https://priv.example.com/key.php?r=52"
      },
      "uri": "http://media.example.com/fileSequence52-B.ts"
    }, {
      "duration": 13.333,
      "timeline": 0,
      "key": {
        "method": "AES-128",
        "uri": "https://priv.example.com/key.php?r=52"
      },
      "uri": "http://media.example.com/fileSequence52-C.ts"
    }, {
      "duration": 15,
      "timeline": 0,
      "key": {
        "method": "AES-128",
        "uri": "https://priv.example.com/key.php?r=53"
      },
      "uri": "http://media.example.com/fileSequence53-A.ts"
    }, {
      "duration": 14,
      "timeline": 0,
      "key": {
        "method": "AES-128",
        "uri": "https://priv.example.com/key.php?r=54",
        "iv": new Uint32Array([0, 0, 331, 3063767524])
      },
      "uri": "http://media.example.com/fileSequence53-B.ts"
    }, {
      "duration": 15,
      "timeline": 0,
      "uri": "http://media.example.com/fileSequence53-B.ts"
    }],
    "targetDuration": 15
  },

  "event": {
    "allowCache": true,
    "mediaSequence": 0,
    "playlistType": "EVENT",
    "segments": [{
      "duration": 10,
      "timeline": 0,
      "uri": "/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00001.ts"
    }, {
      "duration": 10,
      "timeline": 0,
      "uri": "/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00002.ts"
    }, {
      "duration": 10,
      "timeline": 0,
      "uri": "/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00003.ts"
    }, {
      "duration": 10,
      "timeline": 0,
      "uri": "/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00004.ts"
    }, {
      "duration": 10,
      "timeline": 0,
      "uri": "/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00005.ts"
    }, {
      "duration": 8,
      "timeline": 0,
      "uri": "/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00006.ts"
    }],
    "targetDuration": 10,
    "endList": true,
    "discontinuitySequence": 0,
    "discontinuityStarts": []
  },

  "extXPlaylistTypeInvalidPlaylist": {
    "allowCache": true,
    "mediaSequence": 1,
    "segments": [{
      "duration": 6.64,
      "timeline": 0,
      "uri": "/test/ts-files/tvy7/8a5e2822668b5370f4eb1438b2564fb7ab12ffe1-hi720.ts"
    }],
    "targetDuration": 8,
    "endList": true,
    "discontinuitySequence": 0,
    "discontinuityStarts": []
  },

  "extinf": {
    "allowCache": true,
    "mediaSequence": 0,
    "playlistType": "VOD",
    "segments": [{
      "byterange": {
        "length": 522828,
        "offset": 0
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "byterange": {
        "length": 587500,
        "offset": 522828
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "byterange": {
        "length": 713084,
        "offset": 1110328
      },
      "duration": 5,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "byterange": {
        "length": 476580,
        "offset": 1823412
      },
      "duration": 9.7,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "byterange": {
        "length": 535612,
        "offset": 2299992
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "byterange": {
        "length": 207176,
        "offset": 2835604
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "byterange": {
        "length": 455900,
        "offset": 3042780
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "byterange": {
        "length": 657248,
        "offset": 3498680
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "byterange": {
        "length": 571708,
        "offset": 4155928
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "byterange": {
        "length": 485040,
        "offset": 4727636
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "byterange": {
        "length": 709136,
        "offset": 5212676
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "byterange": {
        "length": 730004,
        "offset": 5921812
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "byterange": {
        "length": 456276,
        "offset": 6651816
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "byterange": {
        "length": 468684,
        "offset": 7108092
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "byterange": {
        "length": 444996,
        "offset": 7576776
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "byterange": {
        "length": 331444,
        "offset": 8021772
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "byterange": {
        "length": 44556,
        "offset": 8353216
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }],
    "targetDuration": 10,
    "endList": true,
    "discontinuitySequence": 0,
    "discontinuityStarts": []
  },

  "fmp4": {
    "allowCache": true,
    "mediaSequence": 1,
    "playlistType": "VOD",
    "targetDuration": 6,
    "discontinuitySequence": 0,
    "discontinuityStarts": [],
    "segments": [{
      "byterange": {
        "length": 5666510,
        "offset": 720
      },
      "duration": 6.006,
      "timeline": 0,
      "uri": "main.mp4",
      "map": {
        "byterange": {
          "length": 720,
          "offset": 0
        },
        "uri": "main.mp4"
      }
    }, {
      "byterange": {
        "length": 5861577,
        "offset": 5667230
      },
      "duration": 6.006,
      "timeline": 0,
      "uri": "main.mp4",
      "map": {
        "byterange": {
          "length": 720,
          "offset": 0
        },
        "uri": "main.mp4"
      }
    }],
    "endList": true
  },

  "headerOnly": {
    "allowCache": true,
    "discontinuityStarts": [],
    "segments": []
  },

  "invalidAllowCache": {
    "allowCache": true,
    "mediaSequence": 0,
    "playlistType": "VOD",
    "segments": [{
      "byterange": {
        "length": 522828,
        "offset": 0
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }],
    "targetDuration": 10,
    "endList": true,
    "discontinuitySequence": 0,
    "discontinuityStarts": []
  },

  "invalidMediaSequence": {
    "allowCache": true,
    "mediaSequence": 0,
    "playlistType": "VOD",
    "segments": [{
      "duration": 6.64,
      "timeline": 0,
      "uri": "/test/ts-files/tvy7/8a5e2822668b5370f4eb1438b2564fb7ab12ffe1-hi720.ts"
    }, {
      "duration": 6.08,
      "timeline": 0,
      "uri": "/test/ts-files/tvy7/56be1cef869a1c0cc8e38864ad1add17d187f051-hi720.ts"
    }, {
      "duration": 6.6,
      "timeline": 0,
      "uri": "/test/ts-files/tvy7/549c8c77f55f049741a06596e5c1e01dacaa46d0-hi720.ts"
    }, {
      "duration": 5,
      "timeline": 0,
      "uri": "/test/ts-files/tvy7/6cfa378684ffeb1c455a64dae6c103290a1f53d4-hi720.ts"
    }],
    "targetDuration": 8,
    "endList": true,
    "discontinuitySequence": 0,
    "discontinuityStarts": []
  },

  "invalidPlaylistType": {
    "allowCache": true,
    "mediaSequence": 0,
    "segments": [{
      "duration": 10,
      "timeline": 0,
      "uri": "/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00001.ts"
    }, {
      "duration": 10,
      "timeline": 0,
      "uri": "/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00002.ts"
    }, {
      "duration": 10,
      "timeline": 0,
      "uri": "/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00003.ts"
    }, {
      "duration": 10,
      "timeline": 0,
      "uri": "/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00004.ts"
    }, {
      "duration": 10,
      "timeline": 0,
      "uri": "/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00005.ts"
    }, {
      "duration": 8,
      "timeline": 0,
      "uri": "/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00006.ts"
    }],
    "targetDuration": 10,
    "endList": true,
    "discontinuitySequence": 0,
    "discontinuityStarts": []
  },

  "invalidTargetDuration": {
    "allowCache": true,
    "mediaSequence": 0,
    "playlistType": "VOD",
    "segments": [{
      "byterange": {
        "length": 522828,
        "offset": 0
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "byterange": {
        "length": 587500,
        "offset": 522828
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "byterange": {
        "length": 713084,
        "offset": 1110328
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "byterange": {
        "length": 476580,
        "offset": 1823412
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "byterange": {
        "length": 535612,
        "offset": 2299992
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "byterange": {
        "length": 207176,
        "offset": 2835604
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "byterange": {
        "length": 455900,
        "offset": 3042780
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "byterange": {
        "length": 657248,
        "offset": 3498680
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "byterange": {
        "length": 571708,
        "offset": 4155928
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "byterange": {
        "length": 485040,
        "offset": 4727636
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "byterange": {
        "length": 709136,
        "offset": 5212676
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "byterange": {
        "length": 730004,
        "offset": 5921812
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "byterange": {
        "length": 456276,
        "offset": 6651816
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "byterange": {
        "length": 468684,
        "offset": 7108092
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "byterange": {
        "length": 444996,
        "offset": 7576776
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "byterange": {
        "length": 331444,
        "offset": 8021772
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "byterange": {
        "length": 44556,
        "offset": 8353216
      },
      "duration": 1.4167,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }],
    "endList": true,
    "discontinuitySequence": 0,
    "discontinuityStarts": []
  },

  "liveMissingSegmentDuration": {
    "allowCache": true,
    "mediaSequence": 0,
    "playlistType": "VOD",
    "segments": [{
      "duration": 6.64,
      "timeline": 0,
      "uri": "/test/ts-files/tvy7/8a5e2822668b5370f4eb1438b2564fb7ab12ffe1-hi720.ts"
    }, {
      "duration": 8,
      "timeline": 0,
      "uri": "/test/ts-files/tvy7/56be1cef869a1c0cc8e38864ad1add17d187f051-hi720.ts"
    }, {
      "duration": 8,
      "timeline": 0,
      "uri": "/test/ts-files/tvy7/549c8c77f55f049741a06596e5c1e01dacaa46d0-hi720.ts"
    }],
    "targetDuration": 8,
    "discontinuitySequence": 0,
    "discontinuityStarts": []
  },

  "liveStart30sBefore": {
    "allowCache": true,
    "mediaSequence": 0,
    "segments": [{
      "duration": 10,
      "timeline": 0,
      "uri": "001.ts"
    }, {
      "duration": 19,
      "timeline": 0,
      "uri": "002.ts"
    }, {
      "duration": 10,
      "timeline": 0,
      "uri": "003.ts"
    }, {
      "duration": 11,
      "timeline": 0,
      "uri": "004.ts"
    }, {
      "duration": 10,
      "timeline": 0,
      "uri": "005.ts"
    }, {
      "duration": 10,
      "timeline": 0,
      "uri": "006.ts"
    }, {
      "duration": 10,
      "timeline": 0,
      "uri": "007.ts"
    }, {
      "duration": 10,
      "timeline": 0,
      "uri": "008.ts"
    }, {
      "duration": 16,
      "timeline": 0,
      "uri": "009.ts"
    }],
    "targetDuration": 10,
    "discontinuitySequence": 0,
    "discontinuityStarts": []
  },

  "manifestExtTTargetdurationNegative": {
    "allowCache": true,
    "mediaSequence": 0,
    "segments": [{
      "duration": 10,
      "timeline": 0,
      "uri": "/test/ts-files/zencoder/gogo/00001.ts"
    }],
    "endList": true,
    "discontinuitySequence": 0,
    "discontinuityStarts": []
  },

  "manifestExtXEndlistEarly": {
    "allowCache": true,
    "mediaSequence": 0,
    "segments": [{
      "duration": 10,
      "timeline": 0,
      "uri": "/test/ts-files/zencoder/gogo/00001.ts"
    }, {
      "duration": 10,
      "timeline": 0,
      "uri": "/test/ts-files/zencoder/gogo/00002.ts"
    }, {
      "duration": 10,
      "timeline": 0,
      "uri": "/test/ts-files/zencoder/gogo/00003.ts"
    }, {
      "duration": 10,
      "timeline": 0,
      "uri": "/test/ts-files/zencoder/gogo/00004.ts"
    }, {
      "duration": 10,
      "timeline": 0,
      "uri": "/test/ts-files/zencoder/gogo/00005.ts"
    }],
    "targetDuration": 10,
    "endList": true,
    "discontinuitySequence": 0,
    "discontinuityStarts": []
  },

  "manifestNoExtM3u": {
    "allowCache": true,
    "mediaSequence": 0,
    "segments": [{
      "duration": 10,
      "timeline": 0,
      "uri": "/test/ts-files/zencoder/gogo/00001.ts"
    }],
    "targetDuration": 10,
    "endList": true,
    "discontinuitySequence": 0,
    "discontinuityStarts": []
  },

  "master-fmp4": {
    allowCache: true,
    discontinuityStarts: [],
    mediaGroups: {
      AUDIO: {
        aud1: {
          English: {
            autoselect: true,
            "default": true,
            language: "eng",
            uri: "a1/prog_index.m3u8"
          }
        },
        aud2: {
          English: {
            autoselect: true,
            "default": true,
            language: "eng",
            uri: "a2/prog_index.m3u8"
          }
        },
        aud3: {
          English: {
            autoselect: true,
            "default": true,
            language: "eng",
            uri: "a3/prog_index.m3u8"
          }
        }
      },
      VIDEO: {},
      "CLOSED-CAPTIONS": {
        cc1: {
          English: {
            autoselect: true,
            "default": true,
            language: "eng",
            instreamId: "CC1"
          }
        }
      },
      SUBTITLES: {
        sub1: {
          English: {
            autoselect: true,
            "default": true,
            language: "eng",
            uri: 's1/eng/prog_index.m3u8',
            forced: false
          }
        }
      }
    },
    playlists: [{
      attributes: {
        "AVERAGE-BANDWIDTH": "2165224",
        BANDWIDTH: 2215219,
        CODECS: "avc1.640020,mp4a.40.2",
        RESOLUTION: {
          width: 960,
          height: 540
        },
        "FRAME-RATE": "59.940",
        "CLOSED-CAPTIONS": "cc1",
        AUDIO: "aud1",
        SUBTITLES: "sub1"
      },
      timeline: 0,
      uri: "v4/prog_index.m3u8"
    }, {
      "attributes": {
        "AUDIO": "aud1",
        "AVERAGE-BANDWIDTH": "7962844",
        "BANDWIDTH": 7976430,
        "CLOSED-CAPTIONS": "cc1",
        "CODECS": "avc1.64002a,mp4a.40.2",
        "FRAME-RATE": "59.940",
        "RESOLUTION": {
          "height": 1080,
          "width": 1920
        },
        "SUBTITLES": "sub1"
      },
      "timeline": 0,
      "uri": "v8/prog_index.m3u8"
    }, {
      "attributes": {
        "AUDIO": "aud1",
        "AVERAGE-BANDWIDTH": "6165024",
        "BANDWIDTH": 6181885,
        "CLOSED-CAPTIONS": "cc1",
        "CODECS": "avc1.64002a,mp4a.40.2",
        "FRAME-RATE": "59.940",
        "RESOLUTION": {
          "height": 1080,
          "width": 1920
        },
        "SUBTITLES": "sub1"
      },
      "timeline": 0,
      "uri": "v7/prog_index.m3u8"
    }, {
      "attributes": {
        "AUDIO": "aud1",
        "AVERAGE-BANDWIDTH": "4664459",
        "BANDWIDTH": 4682666,
        "CLOSED-CAPTIONS": "cc1",
        "CODECS": "avc1.64002a,mp4a.40.2",
        "FRAME-RATE": "59.940",
        "RESOLUTION": {
          "height": 1080,
          "width": 1920
        },
        "SUBTITLES": "sub1"
      },
      "timeline": 0,
      "uri": "v6/prog_index.m3u8"
    }, {
      "attributes": {
        "AUDIO": "aud1",
        "AVERAGE-BANDWIDTH": "3164759",
        "BANDWIDTH": 3170746,
        "CLOSED-CAPTIONS": "cc1",
        "CODECS": "avc1.640020,mp4a.40.2",
        "FRAME-RATE": "59.940",
        "RESOLUTION": {
          "height": 720,
          "width": 1280
        },
        "SUBTITLES": "sub1"
      },
      "timeline": 0,
      "uri": "v5/prog_index.m3u8"
    }, {
      "attributes": {
        "AUDIO": "aud1",
        "AVERAGE-BANDWIDTH": "1262552",
        "BANDWIDTH": 1276223,
        "CLOSED-CAPTIONS": "cc1",
        "CODECS": "avc1.64001e,mp4a.40.2",
        "FRAME-RATE": "29.970",
        "RESOLUTION": {
          "height": 432,
          "width": 768
        },
        "SUBTITLES": "sub1"
      },
      "timeline": 0,
      "uri": "v3/prog_index.m3u8"
    }, {
      "attributes": {
        "AUDIO": "aud1",
        "AVERAGE-BANDWIDTH": "893243",
        "BANDWIDTH": 904744,
        "CLOSED-CAPTIONS": "cc1",
        "CODECS": "avc1.64001e,mp4a.40.2",
        "FRAME-RATE": "29.970",
        "RESOLUTION": {
          "height": 360,
          "width": 640
        },
        "SUBTITLES": "sub1"
      },
      "timeline": 0,
      "uri": "v2/prog_index.m3u8"
    }, {
      "attributes": {
        "AUDIO": "aud1",
        "AVERAGE-BANDWIDTH": "527673",
        "BANDWIDTH": 538201,
        "CLOSED-CAPTIONS": "cc1",
        "CODECS": "avc1.640015,mp4a.40.2",
        "FRAME-RATE": "29.970",
        "RESOLUTION": {
          "height": 270,
          "width": 480
        },
        "SUBTITLES": "sub1"
      },
      "timeline": 0,
      "uri": "v1/prog_index.m3u8"
    }, {
      "attributes": {
        "AUDIO": "aud2",
        "AVERAGE-BANDWIDTH": "2390334",
        "BANDWIDTH": 2440329,
        "CLOSED-CAPTIONS": "cc1",
        "CODECS": "avc1.640020,ac-3",
        "FRAME-RATE": "59.940",
        "RESOLUTION": {
          "height": 540,
          "width": 960
        },
        "SUBTITLES": "sub1"
      },
      "timeline": 0,
      "uri": "v4/prog_index.m3u8"
    }, {
      "attributes": {
        "AUDIO": "aud2",
        "AVERAGE-BANDWIDTH": "8187954",
        "BANDWIDTH": 8201540,
        "CLOSED-CAPTIONS": "cc1",
        "CODECS": "avc1.64002a,ac-3",
        "FRAME-RATE": "59.940",
        "RESOLUTION": {
          "height": 1080,
          "width": 1920
        },
        "SUBTITLES": "sub1"
      },
      "timeline": 0,
      "uri": "v8/prog_index.m3u8"
    }, {
      "attributes": {
        "AUDIO": "aud2",
        "AVERAGE-BANDWIDTH": "6390134",
        "BANDWIDTH": 6406995,
        "CLOSED-CAPTIONS": "cc1",
        "CODECS": "avc1.64002a,ac-3",
        "FRAME-RATE": "59.940",
        "RESOLUTION": {
          "height": 1080,
          "width": 1920
        },
        "SUBTITLES": "sub1"
      },
      "timeline": 0,
      "uri": "v7/prog_index.m3u8"
    }, {
      "attributes": {
        "AUDIO": "aud2",
        "AVERAGE-BANDWIDTH": "4889569",
        "BANDWIDTH": 4907776,
        "CLOSED-CAPTIONS": "cc1",
        "CODECS": "avc1.64002a,ac-3",
        "FRAME-RATE": "59.940",
        "RESOLUTION": {
          "height": 1080,
          "width": 1920
        },
        "SUBTITLES": "sub1"
      },
      "timeline": 0,
      "uri": "v6/prog_index.m3u8"
    }, {
      "attributes": {
        "AUDIO": "aud2",
        "AVERAGE-BANDWIDTH": "3389869",
        "BANDWIDTH": 3395856,
        "CLOSED-CAPTIONS": "cc1",
        "CODECS": "avc1.640020,ac-3",
        "FRAME-RATE": "59.940",
        "RESOLUTION": {
          "height": 720,
          "width": 1280
        },
        "SUBTITLES": "sub1"
      },
      "timeline": 0,
      "uri": "v5/prog_index.m3u8"
    }, {
      "attributes": {
        "AUDIO": "aud2",
        "AVERAGE-BANDWIDTH": "1487662",
        "BANDWIDTH": 1501333,
        "CLOSED-CAPTIONS": "cc1",
        "CODECS": "avc1.64001e,ac-3",
        "FRAME-RATE": "29.970",
        "RESOLUTION": {
          "height": 432,
          "width": 768
        },
        "SUBTITLES": "sub1"
      },
      "timeline": 0,
      "uri": "v3/prog_index.m3u8"
    }, {
      "attributes": {
        "AUDIO": "aud2",
        "AVERAGE-BANDWIDTH": "1118353",
        "BANDWIDTH": 1129854,
        "CLOSED-CAPTIONS": "cc1",
        "CODECS": "avc1.64001e,ac-3",
        "FRAME-RATE": "29.970",
        "RESOLUTION": {
          "height": 360,
          "width": 640
        },
        "SUBTITLES": "sub1"
      },
      "timeline": 0,
      "uri": "v2/prog_index.m3u8"
    }, {
      "attributes": {
        "AUDIO": "aud2",
        "AVERAGE-BANDWIDTH": "752783",
        "BANDWIDTH": 763311,
        "CLOSED-CAPTIONS": "cc1",
        "CODECS": "avc1.640015,ac-3",
        "FRAME-RATE": "29.970",
        "RESOLUTION": {
          "height": 270,
          "width": 480
        },
        "SUBTITLES": "sub1"
      },
      "timeline": 0,
      "uri": "v1/prog_index.m3u8"
    }, {
      "attributes": {
        "AUDIO": "aud3",
        "AVERAGE-BANDWIDTH": "2198334",
        "BANDWIDTH": 2248329,
        "CLOSED-CAPTIONS": "cc1",
        "CODECS": "avc1.640020,ec-3",
        "FRAME-RATE": "59.940",
        "RESOLUTION": {
          "height": 540,
          "width": 960
        },
        "SUBTITLES": "sub1"
      },
      "timeline": 0,
      "uri": "v4/prog_index.m3u8"
    }, {
      "attributes": {
        "AUDIO": "aud3",
        "AVERAGE-BANDWIDTH": "7995954",
        "BANDWIDTH": 8009540,
        "CLOSED-CAPTIONS": "cc1",
        "CODECS": "avc1.64002a,ec-3",
        "FRAME-RATE": "59.940",
        "RESOLUTION": {
          "height": 1080,
          "width": 1920
        },
        "SUBTITLES": "sub1"
      },
      "timeline": 0,
      "uri": "v8/prog_index.m3u8"
    }, {
      "attributes": {
        "AUDIO": "aud3",
        "AVERAGE-BANDWIDTH": "6198134",
        "BANDWIDTH": 6214995,
        "CLOSED-CAPTIONS": "cc1",
        "CODECS": "avc1.64002a,ec-3",
        "FRAME-RATE": "59.940",
        "RESOLUTION": {
          "height": 1080,
          "width": 1920
        },
        "SUBTITLES": "sub1"
      },
      "timeline": 0,
      "uri": "v7/prog_index.m3u8"
    }, {
      "attributes": {
        "AUDIO": "aud3",
        "AVERAGE-BANDWIDTH": "4697569",
        "BANDWIDTH": 4715776,
        "CLOSED-CAPTIONS": "cc1",
        "CODECS": "avc1.64002a,ec-3",
        "FRAME-RATE": "59.940",
        "RESOLUTION": {
          "height": 1080,
          "width": 1920
        },
        "SUBTITLES": "sub1"
      },
      "timeline": 0,
      "uri": "v6/prog_index.m3u8"
    }, {
      "attributes": {
        "AUDIO": "aud3",
        "AVERAGE-BANDWIDTH": "3197869",
        "BANDWIDTH": 3203856,
        "CLOSED-CAPTIONS": "cc1",
        "CODECS": "avc1.640020,ec-3",
        "FRAME-RATE": "59.940",
        "RESOLUTION": {
          "height": 720,
          "width": 1280
        },
        "SUBTITLES": "sub1"
      },
      "timeline": 0,
      "uri": "v5/prog_index.m3u8"
    }, {
      "attributes": {
        "AUDIO": "aud3",
        "AVERAGE-BANDWIDTH": "1295662",
        "BANDWIDTH": 1309333,
        "CLOSED-CAPTIONS": "cc1",
        "CODECS": "avc1.64001e,ec-3",
        "FRAME-RATE": "29.970",
        "RESOLUTION": {
          "height": 432,
          "width": 768
        },
        "SUBTITLES": "sub1"
      },
      "timeline": 0,
      "uri": "v3/prog_index.m3u8"
    }, {
      "attributes": {
        "AUDIO": "aud3",
        "AVERAGE-BANDWIDTH": "926353",
        "BANDWIDTH": 937854,
        "CLOSED-CAPTIONS": "cc1",
        "CODECS": "avc1.64001e,ec-3",
        "FRAME-RATE": "29.970",
        "RESOLUTION": {
          "height": 360,
          "width": 640
        },
        "SUBTITLES": "sub1"
      },
      "timeline": 0,
      "uri": "v2/prog_index.m3u8"
    }, {
      "attributes": {
        "AUDIO": "aud3",
        "AVERAGE-BANDWIDTH": "560783",
        "BANDWIDTH": 571311,
        "CLOSED-CAPTIONS": "cc1",
        "CODECS": "avc1.640015,ec-3",
        "FRAME-RATE": "29.970",
        "RESOLUTION": {
          "height": 270,
          "width": 480
        },
        "SUBTITLES": "sub1"
      },
      "timeline": 0,
      "uri": "v1/prog_index.m3u8"
    }],
    segments: []
  },

  "master": {
    "allowCache": true,
    "playlists": [{
      "attributes": {
        "PROGRAM-ID": 1,
        "BANDWIDTH": 240000,
        "RESOLUTION": {
          "width": 396,
          "height": 224
        }
      },
      "timeline": 0,
      "uri": "media.m3u8"
    }, {
      "attributes": {
        "PROGRAM-ID": 1,
        "BANDWIDTH": 40000
      },
      "timeline": 0,
      "uri": "media1.m3u8"
    }, {
      "attributes": {
        "PROGRAM-ID": 1,
        "BANDWIDTH": 440000,
        "RESOLUTION": {
          "width": 396,
          "height": 224
        }
      },
      "timeline": 0,
      "uri": "media2.m3u8"
    }, {
      "attributes": {
        "PROGRAM-ID": 1,
        "BANDWIDTH": 1928000,
        "RESOLUTION": {
          "width": 960,
          "height": 540
        }
      },
      "timeline": 0,
      "uri": "media3.m3u8"
    }],
    "discontinuityStarts": [],
    "mediaGroups": {
      "VIDEO": {},
      "AUDIO": {},
      "CLOSED-CAPTIONS": {},
      "SUBTITLES": {}
    },
    segments: []
  },

  "media": {
    "allowCache": true,
    "mediaSequence": 0,
    "playlistType": "VOD",
    "segments": [{
      "duration": 10,
      "timeline": 0,
      "uri": "media-00001.ts"
    }, {
      "duration": 10,
      "timeline": 0,
      "uri": "media-00002.ts"
    }, {
      "duration": 10,
      "timeline": 0,
      "uri": "media-00003.ts"
    }, {
      "duration": 10,
      "timeline": 0,
      "uri": "media-00004.ts"
    }],
    "targetDuration": 10,
    "endList": true,
    "discontinuitySequence": 0,
    "discontinuityStarts": []
  },

  "mediaSequence": {
    "allowCache": true,
    "mediaSequence": 0,
    "playlistType": "VOD",
    "segments": [{
      "duration": 6.64,
      "timeline": 0,
      "uri": "/test/ts-files/tvy7/8a5e2822668b5370f4eb1438b2564fb7ab12ffe1-hi720.ts"
    }, {
      "duration": 6.08,
      "timeline": 0,
      "uri": "/test/ts-files/tvy7/56be1cef869a1c0cc8e38864ad1add17d187f051-hi720.ts"
    }, {
      "duration": 6.6,
      "timeline": 0,
      "uri": "/test/ts-files/tvy7/549c8c77f55f049741a06596e5c1e01dacaa46d0-hi720.ts"
    }, {
      "duration": 5,
      "timeline": 0,
      "uri": "/test/ts-files/tvy7/6cfa378684ffeb1c455a64dae6c103290a1f53d4-hi720.ts"
    }],
    "targetDuration": 8,
    "endList": true,
    "discontinuitySequence": 0,
    "discontinuityStarts": []
  },

  "missingEndlist": {
    "allowCache": true,
    "mediaSequence": 0,
    "segments": [{
      "duration": 10,
      "timeline": 0,
      "uri": "00001.ts"
    }, {
      "duration": 10,
      "timeline": 0,
      "uri": "00002.ts"
    }],
    "targetDuration": 10,
    "discontinuitySequence": 0,
    "discontinuityStarts": []
  },

  "missingExtinf": {
    "allowCache": true,
    "mediaSequence": 0,
    "playlistType": "VOD",
    "segments": [{
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }],
    "targetDuration": 10,
    "endList": true,
    "discontinuitySequence": 0,
    "discontinuityStarts": []
  },

  "missingMediaSequence": {
    "allowCache": true,
    "mediaSequence": 0,
    "playlistType": "VOD",
    "segments": [{
      "duration": 6.64,
      "timeline": 0,
      "uri": "/test/ts-files/tvy7/8a5e2822668b5370f4eb1438b2564fb7ab12ffe1-hi720.ts"
    }, {
      "duration": 6.08,
      "timeline": 0,
      "uri": "/test/ts-files/tvy7/56be1cef869a1c0cc8e38864ad1add17d187f051-hi720.ts"
    }, {
      "duration": 6.6,
      "timeline": 0,
      "uri": "/test/ts-files/tvy7/549c8c77f55f049741a06596e5c1e01dacaa46d0-hi720.ts"
    }, {
      "duration": 5,
      "timeline": 0,
      "uri": "/test/ts-files/tvy7/6cfa378684ffeb1c455a64dae6c103290a1f53d4-hi720.ts"
    }],
    "targetDuration": 8,
    "endList": true,
    "discontinuitySequence": 0,
    "discontinuityStarts": []
  },

  "missingSegmentDuration": {
    "allowCache": true,
    "mediaSequence": 0,
    "playlistType": "VOD",
    "segments": [{
      "duration": 6.64,
      "timeline": 0,
      "uri": "/test/ts-files/tvy7/8a5e2822668b5370f4eb1438b2564fb7ab12ffe1-hi720.ts"
    }, {
      "duration": 8,
      "timeline": 0,
      "uri": "/test/ts-files/tvy7/56be1cef869a1c0cc8e38864ad1add17d187f051-hi720.ts"
    }, {
      "duration": 8,
      "timeline": 0,
      "uri": "/test/ts-files/tvy7/549c8c77f55f049741a06596e5c1e01dacaa46d0-hi720.ts"
    }, {
      "duration": 8,
      "timeline": 0,
      "uri": "/test/ts-files/tvy7/6cfa378684ffeb1c455a64dae6c103290a1f53d4-hi720.ts"
    }],
    "targetDuration": 8,
    "endList": true,
    "discontinuitySequence": 0,
    "discontinuityStarts": []
  },

  "multipleAudioGroups": {
    allowCache: true,
    discontinuityStarts: [],
    mediaGroups: {
      AUDIO: {
        "audio-lo": {
          "English": {
            autoselect: true,
            "default": true,
            language: "eng",
            uri: "englo/prog_index.m3u8"
          },
          "Français": {
            autoselect: true,
            "default": false,
            language: "fre",
            uri: "frelo/prog_index.m3u8"
          },
          "Espanol": {
            autoselect: true,
            "default": false,
            language: "sp",
            uri: "splo/prog_index.m3u8"
          }
        },
        "audio-hi": {
          "English": {
            autoselect: true,
            "default": true,
            language: "eng",
            uri: "eng/prog_index.m3u8"
          },
          "Français": {
            autoselect: true,
            "default": false,
            language: "fre",
            uri: "fre/prog_index.m3u8"
          },
          "Espanol": {
            autoselect: true,
            "default": false,
            language: "sp",
            uri: "sp/prog_index.m3u8"
          }
        }
      },
      VIDEO: {},
      "CLOSED-CAPTIONS": {},
      SUBTITLES: {}
    },
    playlists: [{
      attributes: {
        "PROGRAM-ID": 1,
        BANDWIDTH: 195023,
        CODECS: "mp4a.40.5",
        AUDIO: "audio-lo"
      },
      timeline: 0,
      uri: "lo/prog_index.m3u8"
    }, {
      attributes: {
        "PROGRAM-ID": 1,
        BANDWIDTH: 260000,
        CODECS: "avc1.42e01e,mp4a.40.2",
        AUDIO: "audio-lo"
      },
      timeline: 0,
      uri: "lo2/prog_index.m3u8"
    }, {
      attributes: {
        "PROGRAM-ID": 1,
        BANDWIDTH: 591680,
        CODECS: "mp4a.40.2, avc1.64001e",
        AUDIO: "audio-hi"
      },
      timeline: 0,
      uri: "hi/prog_index.m3u8"
    }, {
      attributes: {
        "PROGRAM-ID": 1,
        BANDWIDTH: 650000,
        CODECS: "avc1.42e01e,mp4a.40.2",
        AUDIO: "audio-hi"
      },
      timeline: 0,
      uri: "hi2/prog_index.m3u8"
    }],
    segments: []
  },

  "multipleAudioGroupsCombinedMain": {
    allowCache: true,
    discontinuityStarts: [],
    mediaGroups: {
      AUDIO: {
        "audio-lo": {
          "English": {
            autoselect: true,
            "default": true,
            language: "eng"
          },
          "Français": {
            autoselect: true,
            "default": false,
            language: "fre",
            uri: "frelo/prog_index.m3u8"
          },
          "Espanol": {
            autoselect: true,
            "default": false,
            language: "sp",
            uri: "splo/prog_index.m3u8"
          }
        },
        "audio-hi": {
          "English": {
            autoselect: true,
            "default": true,
            language: "eng",
            uri: "eng/prog_index.m3u8"
          },
          "Français": {
            autoselect: true,
            "default": false,
            language: "fre",
            uri: "fre/prog_index.m3u8"
          },
          "Espanol": {
            autoselect: true,
            "default": false,
            language: "sp",
            uri: "sp/prog_index.m3u8"
          }
        }
      },
      VIDEO: {},
      "CLOSED-CAPTIONS": {},
      SUBTITLES: {}
    },
    playlists: [{
      attributes: {
        "PROGRAM-ID": 1,
        BANDWIDTH: 195023,
        CODECS: "mp4a.40.5",
        AUDIO: "audio-lo"
      },
      timeline: 0,
      uri: "lo/prog_index.m3u8"
    }, {
      attributes: {
        "PROGRAM-ID": 1,
        BANDWIDTH: 260000,
        CODECS: "avc1.42e01e,mp4a.40.2",
        AUDIO: "audio-lo"
      },
      timeline: 0,
      uri: "lo2/prog_index.m3u8"
    }, {
      attributes: {
        "PROGRAM-ID": 1,
        BANDWIDTH: 591680,
        CODECS: "mp4a.40.2, avc1.64001e",
        AUDIO: "audio-hi"
      },
      timeline: 0,
      uri: "hi/prog_index.m3u8"
    }, {
      attributes: {
        "PROGRAM-ID": 1,
        BANDWIDTH: 650000,
        CODECS: "avc1.42e01e,mp4a.40.2",
        AUDIO: "audio-hi"
      },
      timeline: 0,
      uri: "hi2/prog_index.m3u8"
    }],
    segments: []
  },

  "multipleTargetDurations": {
    "allowCache": true,
    "mediaSequence": 0,
    "targetDuration": 10,
    "segments": [{
      "uri": "001.ts",
      "timeline": 0
    }, {
      "uri": "002.ts",
      "duration": 9,
      "timeline": 0
    }, {
      "uri": "003.ts",
      "duration": 7,
      "timeline": 0
    }, {
      "uri": "004.ts",
      "duration": 10,
      "timeline": 0
    }],
    "discontinuitySequence": 0,
    "discontinuityStarts": []
  },

  "multipleVideo": {
    allowCache: true,
    discontinuityStarts: [],
    mediaGroups: {
      AUDIO: {
        aac: {
          English: {
            autoselect: true,
            "default": true,
            language: "eng",
            uri: "eng/prog_index.m3u8"
          }
        }
      },
      VIDEO: {
        "200kbs": {
          Angle1: {
            autoselect: true,
            "default": true
          },
          Angle2: {
            autoselect: true,
            "default": false,
            uri: "Angle2/200kbs/prog_index.m3u8"
          },
          Angle3: {
            autoselect: true,
            "default": false,
            uri: "Angle3/200kbs/prog_index.m3u8"
          }
        },
        "500kbs": {
          Angle1: {
            autoselect: true,
            "default": true
          },
          Angle2: {
            autoselect: true,
            "default": false,
            uri: "Angle2/500kbs/prog_index.m3u8"
          },
          Angle3: {
            autoselect: true,
            "default": false,
            uri: "Angle3/500kbs/prog_index.m3u8"
          }
        }
      },
      "CLOSED-CAPTIONS": {},
      SUBTITLES: {}
    },
    playlists: [{
      attributes: {
        "PROGRAM-ID": 1,
        BANDWIDTH: 300000,
        CODECS: "mp4a.40.2,avc1.4d401e",
        AUDIO: "aac",
        VIDEO: "200kbs"
      },
      timeline: 0,
      uri: "Angle1/200kbs/prog_index.m3u"
    }, {
      attributes: {
        "PROGRAM-ID": 1,
        BANDWIDTH: 754857,
        CODECS: "mp4a.40.2,avc1.4d401e",
        AUDIO: "aac",
        VIDEO: "500kbs"
      },
      timeline: 0,
      uri: "Angle1/500kbs/prog_index.m3u8"
    }],
    segments: []
  },

  "negativeMediaSequence": {
    "allowCache": true,
    "mediaSequence": -11,
    "playlistType": "VOD",
    "segments": [{
      "duration": 6.64,
      "timeline": 0,
      "uri": "/test/ts-files/tvy7/8a5e2822668b5370f4eb1438b2564fb7ab12ffe1-hi720.ts"
    }, {
      "duration": 6.08,
      "timeline": 0,
      "uri": "/test/ts-files/tvy7/56be1cef869a1c0cc8e38864ad1add17d187f051-hi720.ts"
    }, {
      "duration": 6.6,
      "timeline": 0,
      "uri": "/test/ts-files/tvy7/549c8c77f55f049741a06596e5c1e01dacaa46d0-hi720.ts"
    }, {
      "duration": 5,
      "timeline": 0,
      "uri": "/test/ts-files/tvy7/6cfa378684ffeb1c455a64dae6c103290a1f53d4-hi720.ts"
    }],
    "targetDuration": 8,
    "endList": true,
    "discontinuitySequence": 0,
    "discontinuityStarts": []
  },

  "playlist": {
    "allowCache": true,
    "mediaSequence": 0,
    "playlistType": "VOD",
    "segments": [{
      "byterange": {
        "length": 522828,
        "offset": 0
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "byterange": {
        "length": 587500,
        "offset": 522828
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "byterange": {
        "length": 713084,
        "offset": 1110328
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "byterange": {
        "length": 476580,
        "offset": 1823412
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "byterange": {
        "length": 535612,
        "offset": 2299992
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "byterange": {
        "length": 207176,
        "offset": 2835604
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "byterange": {
        "length": 455900,
        "offset": 3042780
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "byterange": {
        "length": 657248,
        "offset": 3498680
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "byterange": {
        "length": 571708,
        "offset": 4155928
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "byterange": {
        "length": 485040,
        "offset": 4727636
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "byterange": {
        "length": 709136,
        "offset": 5212676
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "byterange": {
        "length": 730004,
        "offset": 5921812
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "byterange": {
        "length": 456276,
        "offset": 6651816
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "byterange": {
        "length": 468684,
        "offset": 7108092
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "byterange": {
        "length": 444996,
        "offset": 7576776
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "byterange": {
        "length": 331444,
        "offset": 8021772
      },
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }, {
      "byterange": {
        "length": 44556,
        "offset": 8353216
      },
      "duration": 1.4167,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }],
    "targetDuration": 10,
    "endList": true,
    "discontinuitySequence": 0,
    "discontinuityStarts": []
  },

  "playlistMediaSequenceHigher": {
    "allowCache": true,
    "mediaSequence": 17,
    "playlistType": "VOD",
    "segments": [{
      "duration": 6.64,
      "timeline": 0,
      "uri": "/test/ts-files/tvy7/8a5e2822668b5370f4eb1438b2564fb7ab12ffe1-hi720.ts"
    }],
    "targetDuration": 8,
    "endList": true,
    "discontinuitySequence": 0,
    "discontinuityStarts": []
  },

  "streamInfInvalid": {
    "allowCache": true,
    "playlists": [{
      "attributes": {
        "PROGRAM-ID": 1
      },
      "timeline": 0,
      "uri": "media.m3u8"
    }, {
      "timeline": 0,
      "uri": "media1.m3u8"
    }],
    "discontinuityStarts": [],
    "mediaGroups": {
      "VIDEO": {},
      "AUDIO": {},
      "CLOSED-CAPTIONS": {},
      "SUBTITLES": {}
    },
    "segments": []
  },

  "twoMediaSequences": {
    "allowCache": true,
    "mediaSequence": 11,
    "playlistType": "VOD",
    "segments": [{
      "duration": 6.64,
      "timeline": 0,
      "uri": "/test/ts-files/tvy7/8a5e2822668b5370f4eb1438b2564fb7ab12ffe1-hi720.ts"
    }, {
      "duration": 6.08,
      "timeline": 0,
      "uri": "/test/ts-files/tvy7/56be1cef869a1c0cc8e38864ad1add17d187f051-hi720.ts"
    }, {
      "duration": 6.6,
      "timeline": 0,
      "uri": "/test/ts-files/tvy7/549c8c77f55f049741a06596e5c1e01dacaa46d0-hi720.ts"
    }, {
      "duration": 5,
      "timeline": 0,
      "uri": "/test/ts-files/tvy7/6cfa378684ffeb1c455a64dae6c103290a1f53d4-hi720.ts"
    }],
    "targetDuration": 8,
    "endList": true,
    "discontinuitySequence": 0,
    "discontinuityStarts": []
  },

  "versionInvalid": {
    "allowCache": true,
    "mediaSequence": 0,
    "playlistType": "VOD",
    "segments": [{
      "duration": 10,
      "timeline": 0,
      "uri": "hls_450k_video.ts"
    }],
    "targetDuration": 10,
    "endList": true,
    "discontinuitySequence": 0,
    "discontinuityStarts": []
  },

  "whiteSpace": {
    "allowCache": true,
    "mediaSequence": 0,
    "playlistType": "VOD",
    "segments": [{
      "duration": 10,
      "timeline": 0,
      "uri": "http://example.com/00001.ts"
    }, {
      "duration": 10,
      "timeline": 0,
      "uri": "https://example.com/00002.ts"
    }, {
      "duration": 10,
      "timeline": 0,
      "uri": "//example.com/00003.ts"
    }, {
      "duration": 10,
      "timeline": 0,
      "uri": "http://example.com/00004.ts"
    }],
    "targetDuration": 10,
    "endList": true,
    "discontinuitySequence": 0,
    "discontinuityStarts": []
  },

  "zeroDuration": {
    "allowCache": true,
    "mediaSequence": 0,
    "playlistType": "VOD",
    "segments": [{
      "duration": 0.01,
      "timeline": 0,
      "uri": "http://example.com/00001.ts"
    }],
    "targetDuration": 10,
    "endList": true,
    "discontinuitySequence": 0,
    "discontinuityStarts": []
  }

};

},{}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports['default'] = {
  'absoluteUris': '#EXTM3U\n' + '#EXT-X-PLAYLIST-TYPE:VOD\n' + '#EXT-X-TARGETDURATION:10\n' + '#EXTINF:10,\n' + 'http://example.com/00001.ts\n' + '#EXTINF:10,\n' + 'https://example.com/00002.ts\n' + '#EXTINF:10,\n' + '//example.com/00003.ts\n' + '#EXTINF:10,\n' + 'http://example.com/00004.ts\n' + '#ZEN-TOTAL-DURATION:57.9911\n' + '#EXT-X-ENDLIST\n' + '\n',
  'allowCache': '#EXTM3U\n' + '#EXT-X-TARGETDURATION:10\n' + '#EXT-X-VERSION:4\n' + '#EXT-X-ALLOW-CACHE:YES\n' + '#EXT-X-MEDIA-SEQUENCE:0\n' + '#EXT-X-PLAYLIST-TYPE:VOD\n' + '#EXTINF:10,\n' + '#EXT-X-BYTERANGE:522828@0\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,\n' + '#EXT-X-BYTERANGE:587500@522828\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,\n' + '#EXT-X-BYTERANGE:713084@1110328\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,\n' + '#EXT-X-BYTERANGE:476580@1823412\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,\n' + '#EXT-X-BYTERANGE:535612@2299992\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,\n' + '#EXT-X-BYTERANGE:207176@2835604\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,\n' + '#EXT-X-BYTERANGE:455900@3042780\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,\n' + '#EXT-X-BYTERANGE:657248@3498680\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,\n' + '#EXT-X-BYTERANGE:571708@4155928\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,\n' + '#EXT-X-BYTERANGE:485040@4727636\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,\n' + '#EXT-X-BYTERANGE:709136@5212676\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,\n' + '#EXT-X-BYTERANGE:730004@5921812\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,\n' + '#EXT-X-BYTERANGE:456276@6651816\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,\n' + '#EXT-X-BYTERANGE:468684@7108092\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,\n' + '#EXT-X-BYTERANGE:444996@7576776\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,\n' + '#EXT-X-BYTERANGE:331444@8021772\n' + 'hls_450k_video.ts\n' + '#EXTINF:1.4167,\n' + '#EXT-X-BYTERANGE:44556@8353216\n' + 'hls_450k_video.ts\n' + '#EXT-X-ENDLIST\n',
  'allowCacheInvalid': '#EXTM3U\n' + '#EXT-X-TARGETDURATION:10\n' + '#EXT-X-VERSION:4\n' + '#EXT-X-ALLOW-CACHE:0\n' + '#EXT-X-MEDIA-SEQUENCE:0\n' + '#EXT-X-PLAYLIST-TYPE:VOD\n' + '#EXTINF:10,\n' + '#EXT-X-BYTERANGE:522828@0\n' + 'hls_450k_video.ts\n' + '#EXT-X-ENDLIST\n' + '\n',
  'alternateAudio': '#EXTM3U\n' + '#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="audio",LANGUAGE="eng",NAME="English",AUTOSELECT=YES, DEFAULT=YES,URI="eng/prog_index.m3u8"\n' + '#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="audio",LANGUAGE="fre",NAME="Français",AUTOSELECT=YES, DEFAULT=NO,URI="fre/prog_index.m3u8"\n' + '#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="audio",LANGUAGE="sp",NAME="Espanol",AUTOSELECT=YES, DEFAULT=NO,URI="sp/prog_index.m3u8"\n' + '\n' + '#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=195023,CODECS="avc1.42e00a,mp4a.40.2",AUDIO="audio"\n' + 'lo/prog_index.m3u8\n' + '#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=591680,CODECS="avc1.42e01e,mp4a.40.2",AUDIO="audio"\n' + 'hi/prog_index.m3u8\n',
  'alternateVideo': '#EXTM3U\n' + '#EXT-X-MEDIA:TYPE=VIDEO,GROUP-ID="500kbs",NAME="Angle1",AUTOSELECT=YES,DEFAULT=YES\n' + '#EXT-X-MEDIA:TYPE=VIDEO,GROUP-ID="500kbs",NAME="Angle2",AUTOSELECT=YES,DEFAULT=NO,URI="Angle2/500kbs/prog_index.m3u8"\n' + '#EXT-X-MEDIA:TYPE=VIDEO,GROUP-ID="500kbs",NAME="Angle3",AUTOSELECT=YES,DEFAULT=NO,URI="Angle3/500kbs/prog_index.m3u8"\n' + '\n' + '#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="aac",LANGUAGE="eng",NAME="English",AUTOSELECT=YES,DEFAULT=YES,URI="eng/prog_index.m3u8"\n' + '#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=754857,CODECS="mp4a.40.2,avc1.4d401e",VIDEO="500kbs",AUDIO="aac"\n' + 'Angle1/500kbs/prog_index.m3u8\n',
  'brightcove': '#EXTM3U\n' + '#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=240000,RESOLUTION=396x224\n' + 'http://c.brightcove.com/services/mobile/streaming/index/rendition.m3u8?assetId=1824686811001&videoId=1824650741001\n' + '#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=40000\n' + 'http://c.brightcove.com/services/mobile/streaming/index/rendition.m3u8?assetId=1824683759001&videoId=1824650741001\n' + '#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=440000,RESOLUTION=396x224\n' + 'http://c.brightcove.com/services/mobile/streaming/index/rendition.m3u8?assetId=1824686593001&videoId=1824650741001\n' + '#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=1928000,RESOLUTION=960x540\n' + 'http://c.brightcove.com/services/mobile/streaming/index/rendition.m3u8?assetId=1824687660001&videoId=1824650741001\n' + '\n',
  'byteRange': '#EXTM3U\n' + '#EXT-X-TARGETDURATION:10\n' + '#EXT-X-VERSION:3\n' + '#EXT-X-MEDIA-SEQUENCE:0\n' + '#EXT-X-PLAYLIST-TYPE:VOD\n' + '#EXTINF:10,\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,\n' + '#EXT-X-BYTERANGE:587500@522828\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,\n' + '#EXT-X-BYTERANGE:713084\n' + 'hls_450k_video2.ts\n' + '#EXTINF:10,\n' + '#EXT-X-BYTERANGE:476580@1823412\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,\n' + '#EXT-X-BYTERANGE:535612@2299992\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,\n' + '#EXT-X-BYTERANGE:207176@2835604\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,\n' + '#EXT-X-BYTERANGE:455900@3042780\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,\n' + '#EXT-X-BYTERANGE:657248@3498680\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,\n' + '#EXT-X-BYTERANGE:571708@4155928\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,\n' + '#EXT-X-BYTERANGE:485040@4727636\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,\n' + '#EXT-X-BYTERANGE:709136@5212676\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,\n' + '#EXT-X-BYTERANGE:730004@5921812\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,\n' + '#EXT-X-BYTERANGE:456276@6651816\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,\n' + '#EXT-X-BYTERANGE:468684@7108092\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,\n' + '#EXT-X-BYTERANGE:444996@7576776\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,\n' + '#EXT-X-BYTERANGE:331444@8021772\n' + 'hls_450k_video.ts\n' + '#EXTINF:1.4167,\n' + '#EXT-X-BYTERANGE:44556@8353216\n' + 'hls_450k_video.ts\n' + '#EXT-X-ENDLIST\n',
  'dateTime': '#EXTM3U\n' + '#EXT-X-PLAYLIST-TYPE:VOD\n' + '#EXT-X-MEDIA-SEQUENCE:0\n' + '#EXT-X-PROGRAM-DATE-TIME:2016-06-22T09:20:16.166-04:00\n' + '#EXT-X-ALLOW-CACHE:NO\n' + '#EXT-X-TARGETDURATION:10\n' + '#EXTINF:10\n' + 'hls_450k_video.ts\n' + '#EXT-X-ENDLIST\n' + '\n',
  'disallowCache': '#EXTM3U\n' + '#EXT-X-TARGETDURATION:10\n' + '#EXT-X-VERSION:4\n' + '#EXT-X-ALLOW-CACHE:NO\n' + '#EXT-X-MEDIA-SEQUENCE:0\n' + '#EXT-X-PLAYLIST-TYPE:VOD\n' + '#EXTINF:10,\n' + '#EXT-X-BYTERANGE:522828@0\n' + 'hls_450k_video.ts\n' + '#EXT-X-ENDLIST\n',
  'disc-sequence': '#EXTM3U\n' + '#EXT-X-VERSION:3\n' + '#EXT-X-TARGETDURATION:19\n' + '#EXT-X-MEDIA-SEQUENCE:0\n' + '#EXT-X-DISCONTINUITY-SEQUENCE:3\n' + '#EXTINF:10,0\n' + '001.ts\n' + '#EXTINF:19,0\n' + '002.ts\n' + '#EXT-X-DISCONTINUITY\n' + '#EXTINF:10,0\n' + '003.ts\n' + '#EXTINF:11,0\n' + '004.ts\n' + '#EXT-X-ENDLIST\n' + '\n',
  'discontinuity': '#EXTM3U\n' + '#EXT-X-VERSION:3\n' + '#EXT-X-TARGETDURATION:19\n' + '#EXT-X-MEDIA-SEQUENCE:0\n' + '#EXTINF:10,0\n' + '001.ts\n' + '#EXTINF:19,0\n' + '002.ts\n' + '#EXT-X-DISCONTINUITY\n' + '#EXTINF:10,0\n' + '003.ts\n' + '#EXTINF:11,0\n' + '004.ts\n' + '#EXT-X-DISCONTINUITY\n' + '#EXTINF:10,0\n' + '005.ts\n' + '#EXTINF:10,0\n' + '006.ts\n' + '#EXTINF:10,0\n' + '007.ts\n' + '#EXT-X-DISCONTINUITY\n' + '#EXTINF:10,0\n' + '008.ts\n' + '#EXTINF:16,0\n' + '009.ts\n' + '#EXT-X-ENDLIST\n' + '\n',
  'domainUris': '#EXTM3U\n' + '#EXT-X-PLAYLIST-TYPE:VOD\n' + '#EXT-X-TARGETDURATION:10\n' + '#EXTINF:10,\n' + '/00001.ts\n' + '#EXTINF:10,\n' + '/subdir/00002.ts\n' + '#EXTINF:10,\n' + '/00003.ts\n' + '#EXTINF:10,\n' + '/00004.ts\n' + '#ZEN-TOTAL-DURATION:57.9911\n' + '#EXT-X-ENDLIST\n' + '\n',
  'empty': '\n',
  'emptyAllowCache': '#EXTM3U\n' + '#EXT-X-TARGETDURATION:10\n' + '#EXT-X-VERSION:4\n' + '#EXT-X-ALLOW-CACHE:\n' + '#EXT-X-MEDIA-SEQUENCE:0\n' + '#EXT-X-PLAYLIST-TYPE:VOD\n' + '#EXTINF:10,\n' + '#EXT-X-BYTERANGE:522828@0\n' + 'hls_450k_video.ts\n' + '#EXT-X-ENDLIST\n',
  'emptyMediaSequence': '#EXTM3U\n' + '#EXT-X-PLAYLIST-TYPE:VOD\n' + '#EXT-X-MEDIA-SEQUENCE:\n' + '#EXT-X-ALLOW-CACHE:YES\n' + '#EXT-X-TARGETDURATION:8\n' + '#EXTINF:6.640,{}\n' + '/test/ts-files/tvy7/8a5e2822668b5370f4eb1438b2564fb7ab12ffe1-hi720.ts\n' + '#EXTINF:6.080,{}\n' + '/test/ts-files/tvy7/56be1cef869a1c0cc8e38864ad1add17d187f051-hi720.ts\n' + '#EXTINF:6.600,{}\n' + '/test/ts-files/tvy7/549c8c77f55f049741a06596e5c1e01dacaa46d0-hi720.ts\n' + '#EXTINF:5.000,{}\n' + '/test/ts-files/tvy7/6cfa378684ffeb1c455a64dae6c103290a1f53d4-hi720.ts\n' + '#EXT-X-ENDLIST\n' + '\n',
  'emptyPlaylistType': '#EXTM3U\n' + '#EXT-X-PLAYLIST-TYPE:\n' + '#EXT-X-TARGETDURATION:10\n' + '#EXTINF:10,\n' + '/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00001.ts\n' + '#EXTINF:10,\n' + '/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00002.ts\n' + '#EXTINF:10,\n' + '/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00003.ts\n' + '#EXTINF:10,\n' + '/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00004.ts\n' + '#EXTINF:10,\n' + '/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00005.ts\n' + '#EXTINF:8,\n' + '/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00006.ts\n' + '#ZEN-TOTAL-DURATION:57.9911\n' + '#EXT-X-ENDLIST\n' + '\n',
  'emptyTargetDuration': '#EXTM3U\n' + '#EXT-X-TARGETDURATION:\n' + '#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=240000,RESOLUTION=396x224\n' + 'http://c.brightcove.com/services/mobile/streaming/index/rendition.m3u8?assetId=1824686811001&videoId=1824650741001\n' + '#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=40000\n' + 'http://c.brightcove.com/services/mobile/streaming/index/rendition.m3u8?assetId=1824683759001&videoId=1824650741001\n' + '#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=440000,RESOLUTION=396x224\n' + 'http://c.brightcove.com/services/mobile/streaming/index/rendition.m3u8?assetId=1824686593001&videoId=1824650741001\n' + '#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=1928000,RESOLUTION=960x540\n' + 'http://c.brightcove.com/services/mobile/streaming/index/rendition.m3u8?assetId=1824687660001&videoId=1824650741001\n' + '\n',
  'encrypted': '#EXTM3U\n' + '#EXT-X-VERSION:3\n' + '#EXT-X-MEDIA-SEQUENCE:7794\n' + '#EXT-X-TARGETDURATION:15\n' + '\n' + '#EXT-X-KEY:METHOD=AES-128,URI="https://priv.example.com/key.php?r=52"\n' + '\n' + '#EXTINF:2.833,\n' + 'http://media.example.com/fileSequence52-A.ts\n' + '#EXTINF:15.0,\n' + 'http://media.example.com/fileSequence52-B.ts\n' + '#EXTINF:13.333,\n' + 'http://media.example.com/fileSequence52-C.ts\n' + '\n' + '#EXT-X-KEY:METHOD=AES-128,URI="https://priv.example.com/key.php?r=53"\n' + '\n' + '#EXTINF:15.0,\n' + 'http://media.example.com/fileSequence53-A.ts\n' + '\n' + '#EXT-X-KEY:METHOD=AES-128,URI="https://priv.example.com/key.php?r=54",IV=0x00000000000000000000014BB69D61E4\n' + '\n' + '#EXTINF:14.0,\n' + 'http://media.example.com/fileSequence53-B.ts\n' + '\n' + '#EXT-X-KEY:METHOD=NONE\n' + '\n' + '#EXTINF:15.0,\n' + 'http://media.example.com/fileSequence53-B.ts\n',
  'event': '#EXTM3U\n' + '#EXT-X-PLAYLIST-TYPE:EVENT\n' + '#EXT-X-TARGETDURATION:10\n' + '#EXTINF:10,\n' + '/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00001.ts\n' + '#EXTINF:10,\n' + '/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00002.ts\n' + '#EXTINF:10,\n' + '/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00003.ts\n' + '#EXTINF:10,\n' + '/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00004.ts\n' + '#EXTINF:10,\n' + '/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00005.ts\n' + '#EXTINF:8,\n' + '/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00006.ts\n' + '#ZEN-TOTAL-DURATION:57.9911\n' + '#EXT-X-ENDLIST\n' + '\n',
  'extXPlaylistTypeInvalidPlaylist': '#EXTM3U\n' + '#EXT-X-PLAYLIST-TYPE:STRING\n' + '#EXT-X-MEDIA-SEQUENCE:1\n' + '#EXT-X-ALLOW-CACHE:YES\n' + '#EXT-X-TARGETDURATION:8\n' + '#EXTINF:6.640,{}\n' + '/test/ts-files/tvy7/8a5e2822668b5370f4eb1438b2564fb7ab12ffe1-hi720.ts\n' + '#EXT-X-ENDLIST\n' + '\n',
  'extinf': '#EXTM3U\n' + '#EXT-X-TARGETDURATION:10\n' + '#EXT-X-VERSION:3\n' + '#EXT-X-MEDIA-SEQUENCE:0\n' + '#EXT-X-PLAYLIST-TYPE:VOD\n' + '#EXTINF:10\n' + '#EXT-X-BYTERANGE:522828@0\n' + 'hls_450k_video.ts\n' + '#EXTINF:;asljasdfii11)))00,\n' + '#EXT-X-BYTERANGE:587500@522828\n' + 'hls_450k_video.ts\n' + '#EXTINF:5,\n' + '#EXT-X-BYTERANGE:713084@1110328\n' + 'hls_450k_video.ts\n' + '#EXTINF:9.7,\n' + '#EXT-X-BYTERANGE:476580@1823412\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,\n' + '#EXT-X-BYTERANGE:535612@2299992\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,\n' + '#EXT-X-BYTERANGE:207176@2835604\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,\n' + '#EXT-X-BYTERANGE:455900@3042780\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,\n' + '#EXT-X-BYTERANGE:657248@3498680\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,\n' + '#EXT-X-BYTERANGE:571708@4155928\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,\n' + '#EXT-X-BYTERANGE:485040@4727636\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,\n' + '#EXT-X-BYTERANGE:709136@5212676\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,\n' + '#EXT-X-BYTERANGE:730004@5921812\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,\n' + '#EXT-X-BYTERANGE:456276@6651816\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,\n' + '#EXT-X-BYTERANGE:468684@7108092\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,\n' + '#EXT-X-BYTERANGE:444996@7576776\n' + 'hls_450k_video.ts\n' + '#EXTINF:22,\n' + '#EXTINF:10,\n' + '#EXT-X-BYTERANGE:331444@8021772\n' + 'hls_450k_video.ts\n' + '#EXT-X-BYTERANGE:44556@8353216\n' + 'hls_450k_video.ts\n' + '#EXT-X-ENDLIST\n' + '\n',
  'fmp4': '#EXTM3U\n' + '#EXT-X-TARGETDURATION:6\n' + '#EXT-X-VERSION:7\n' + '#EXT-X-MEDIA-SEQUENCE:1\n' + '#EXT-X-PLAYLIST-TYPE:VOD\n' + '#EXT-X-INDEPENDENT-SEGMENTS\n' + '#EXT-X-MAP:URI="main.mp4",BYTERANGE="720@0"\n' + '#EXTINF:6.00600,	\n' + '#EXT-X-BYTERANGE:5666510@720\n' + 'main.mp4\n' + '#EXTINF:6.00600,	\n' + '#EXT-X-BYTERANGE:5861577@5667230\n' + 'main.mp4\n' + '#EXT-X-ENDLIST\n' + '\n',
  'headerOnly': '#EXTM3U\n' + '\n',
  'invalidAllowCache': '#EXTM3U\n' + '#EXT-X-TARGETDURATION:10\n' + '#EXT-X-VERSION:4\n' + '#EXT-X-ALLOW-CACHE:MAYBE\n' + '#EXT-X-MEDIA-SEQUENCE:0\n' + '#EXT-X-PLAYLIST-TYPE:VOD\n' + '#EXTINF:10,\n' + '#EXT-X-BYTERANGE:522828@0\n' + 'hls_450k_video.ts\n' + '#EXT-X-ENDLIST\n',
  'invalidMediaSequence': '#EXTM3U\n' + '#EXT-X-PLAYLIST-TYPE:VOD\n' + '#EXT-X-MEDIA-SEQUENCE:gobblegobble\n' + '#EXT-X-ALLOW-CACHE:YES\n' + '#EXT-X-TARGETDURATION:8\n' + '#EXTINF:6.640,{}\n' + '/test/ts-files/tvy7/8a5e2822668b5370f4eb1438b2564fb7ab12ffe1-hi720.ts\n' + '#EXTINF:6.080,{}\n' + '/test/ts-files/tvy7/56be1cef869a1c0cc8e38864ad1add17d187f051-hi720.ts\n' + '#EXTINF:6.600,{}\n' + '/test/ts-files/tvy7/549c8c77f55f049741a06596e5c1e01dacaa46d0-hi720.ts\n' + '#EXTINF:5.000,{}\n' + '/test/ts-files/tvy7/6cfa378684ffeb1c455a64dae6c103290a1f53d4-hi720.ts\n' + '#EXT-X-ENDLIST\n' + '\n',
  'invalidPlaylistType': '#EXTM3U\n' + '#EXT-X-PLAYLIST-TYPE:asdRASDfasdR\n' + '#EXT-X-TARGETDURATION:10\n' + '#EXTINF:10,\n' + '/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00001.ts\n' + '#EXTINF:10,\n' + '/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00002.ts\n' + '#EXTINF:10,\n' + '/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00003.ts\n' + '#EXTINF:10,\n' + '/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00004.ts\n' + '#EXTINF:10,\n' + '/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00005.ts\n' + '#EXTINF:8,\n' + '/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00006.ts\n' + '#ZEN-TOTAL-DURATION:57.9911\n' + '#EXT-X-ENDLIST\n' + '\n',
  'invalidTargetDuration': '#EXTM3U\n' + '#EXT-X-TARGETDURATION:NaN\n' + '#EXT-X-VERSION:4\n' + '#EXT-X-MEDIA-SEQUENCE:0\n' + '#EXT-X-PLAYLIST-TYPE:VOD\n' + '#EXTINF:10,	\n' + '#EXT-X-BYTERANGE:522828@0\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,	\n' + '#EXT-X-BYTERANGE:587500@522828\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,	\n' + '#EXT-X-BYTERANGE:713084@1110328\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,	\n' + '#EXT-X-BYTERANGE:476580@1823412\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,	\n' + '#EXT-X-BYTERANGE:535612@2299992\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,	\n' + '#EXT-X-BYTERANGE:207176@2835604\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,	\n' + '#EXT-X-BYTERANGE:455900@3042780\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,	\n' + '#EXT-X-BYTERANGE:657248@3498680\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,	\n' + '#EXT-X-BYTERANGE:571708@4155928\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,	\n' + '#EXT-X-BYTERANGE:485040@4727636\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,	\n' + '#EXT-X-BYTERANGE:709136@5212676\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,	\n' + '#EXT-X-BYTERANGE:730004@5921812\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,	\n' + '#EXT-X-BYTERANGE:456276@6651816\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,	\n' + '#EXT-X-BYTERANGE:468684@7108092\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,	\n' + '#EXT-X-BYTERANGE:444996@7576776\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,	\n' + '#EXT-X-BYTERANGE:331444@8021772\n' + 'hls_450k_video.ts\n' + '#EXTINF:1.4167,	\n' + '#EXT-X-BYTERANGE:44556@8353216\n' + 'hls_450k_video.ts\n' + '#EXT-X-ENDLIST\n' + '\n',
  'liveMissingSegmentDuration': '#EXTM3U\n' + '#EXT-X-PLAYLIST-TYPE:VOD\n' + '#EXT-X-MEDIA-SEQUENCE:0\n' + '#EXT-X-ALLOW-CACHE:YES\n' + '#EXT-X-TARGETDURATION:8\n' + '#EXTINF:6.640,{}\n' + '/test/ts-files/tvy7/8a5e2822668b5370f4eb1438b2564fb7ab12ffe1-hi720.ts\n' + '/test/ts-files/tvy7/56be1cef869a1c0cc8e38864ad1add17d187f051-hi720.ts\n' + '/test/ts-files/tvy7/549c8c77f55f049741a06596e5c1e01dacaa46d0-hi720.ts\n' + '\n',
  'liveStart30sBefore': '#EXTM3U\n' + '#EXT-X-MEDIA-SEQUENCE:0\n' + '#EXT-X-ALLOW-CACHE:YES\n' + '#EXT-X-TARGETDURATION:10\n' + '#EXTINF:10,0\n' + '001.ts\n' + '#EXTINF:19,0\n' + '002.ts\n' + '#EXTINF:10,0\n' + '003.ts\n' + '#EXTINF:11,0\n' + '004.ts\n' + '#EXTINF:10,0\n' + '005.ts\n' + '#EXTINF:10,0\n' + '006.ts\n' + '#EXTINF:10,0\n' + '007.ts\n' + '#EXTINF:10,0\n' + '008.ts\n' + '#EXTINF:16,0\n' + '009.ts\n',
  'manifestExtTTargetdurationNegative': '#EXTM3U\n' + '#ZEN-TOTAL-DURATION:50\n' + '#EXT-X-TARGETDURATION:-10\n' + '#EXTINF:10,\n' + '/test/ts-files/zencoder/gogo/00001.ts\n' + '#EXT-X-ENDLIST\n' + '\n',
  'manifestExtXEndlistEarly': '#EXTM3U\n' + '#ZEN-TOTAL-DURATION:50\n' + '#EXT-X-TARGETDURATION:10\n' + '#EXTINF:10,\n' + '/test/ts-files/zencoder/gogo/00001.ts\n' + '#EXTINF:10,\n' + '/test/ts-files/zencoder/gogo/00002.ts\n' + '#EXTINF:10,\n' + '/test/ts-files/zencoder/gogo/00003.ts\n' + '#EXT-X-ENDLIST\n' + '#EXTINF:10,\n' + '/test/ts-files/zencoder/gogo/00004.ts\n' + '#EXTINF:10,\n' + '/test/ts-files/zencoder/gogo/00005.ts\n' + '\n' + '\n',
  'manifestNoExtM3u': '#ZEN-TOTAL-DURATION:10\n' + '#EXT-X-TARGETDURATION:10\n' + '#EXTINF:10,\n' + '/test/ts-files/zencoder/gogo/00001.ts\n' + '#EXT-X-ENDLIST\n' + '\n',
  'master-fmp4': '#EXTM3U\n' + '#EXT-X-VERSION:6\n' + '#EXT-X-INDEPENDENT-SEGMENTS\n' + '\n' + '\n' + '#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="aud1",LANGUAGE="eng",NAME="English",AUTOSELECT=YES,DEFAULT=YES,URI="a1/prog_index.m3u8"\n' + '#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="aud2",LANGUAGE="eng",NAME="English",AUTOSELECT=YES,DEFAULT=YES,URI="a2/prog_index.m3u8"\n' + '#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="aud3",LANGUAGE="eng",NAME="English",AUTOSELECT=YES,DEFAULT=YES,URI="a3/prog_index.m3u8"\n' + '\n' + '\n' + '#EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="sub1",NAME="English",LANGUAGE="eng",DEFAULT=YES,AUTOSELECT=YES,FORCED=NO,URI="s1/eng/prog_index.m3u8"\n' + '\n' + '\n' + '#EXT-X-MEDIA:TYPE=CLOSED-CAPTIONS,GROUP-ID="cc1",NAME="English",LANGUAGE="eng",DEFAULT=YES,AUTOSELECT=YES,INSTREAM-ID="CC1"\n' + '\n' + '\n' + '#EXT-X-I-FRAME-STREAM-INF:AVERAGE-BANDWIDTH=163198,BANDWIDTH=166942,CODECS="avc1.64002a",RESOLUTION=1920x1080,URI="v6/iframe_index.m3u8"\n' + '#EXT-X-I-FRAME-STREAM-INF:AVERAGE-BANDWIDTH=131314,BANDWIDTH=139041,CODECS="avc1.640020",RESOLUTION=1280x720,URI="v5/iframe_index.m3u8"\n' + '#EXT-X-I-FRAME-STREAM-INF:AVERAGE-BANDWIDTH=100233,BANDWIDTH=101724,CODECS="avc1.640020",RESOLUTION=960x540,URI="v4/iframe_index.m3u8"\n' + '#EXT-X-I-FRAME-STREAM-INF:AVERAGE-BANDWIDTH=81002,BANDWIDTH=84112,CODECS="avc1.64001e",RESOLUTION=768x432,URI="v3/iframe_index.m3u8"\n' + '#EXT-X-I-FRAME-STREAM-INF:AVERAGE-BANDWIDTH=64987,BANDWIDTH=65835,CODECS="avc1.64001e",RESOLUTION=640x360,URI="v2/iframe_index.m3u8"\n' + '#EXT-X-I-FRAME-STREAM-INF:AVERAGE-BANDWIDTH=41547,BANDWIDTH=42106,CODECS="avc1.640015",RESOLUTION=480x270,URI="v1/iframe_index.m3u8"\n' + '\n' + '\n' + '#EXT-X-STREAM-INF:AVERAGE-BANDWIDTH=2165224,BANDWIDTH=2215219,CODECS="avc1.640020,mp4a.40.2",RESOLUTION=960x540,FRAME-RATE=59.940,CLOSED-CAPTIONS="cc1",AUDIO="aud1",SUBTITLES="sub1"\n' + 'v4/prog_index.m3u8\n' + '#EXT-X-STREAM-INF:AVERAGE-BANDWIDTH=7962844,BANDWIDTH=7976430,CODECS="avc1.64002a,mp4a.40.2",RESOLUTION=1920x1080,FRAME-RATE=59.940,CLOSED-CAPTIONS="cc1",AUDIO="aud1",SUBTITLES="sub1"\n' + 'v8/prog_index.m3u8\n' + '#EXT-X-STREAM-INF:AVERAGE-BANDWIDTH=6165024,BANDWIDTH=6181885,CODECS="avc1.64002a,mp4a.40.2",RESOLUTION=1920x1080,FRAME-RATE=59.940,CLOSED-CAPTIONS="cc1",AUDIO="aud1",SUBTITLES="sub1"\n' + 'v7/prog_index.m3u8\n' + '#EXT-X-STREAM-INF:AVERAGE-BANDWIDTH=4664459,BANDWIDTH=4682666,CODECS="avc1.64002a,mp4a.40.2",RESOLUTION=1920x1080,FRAME-RATE=59.940,CLOSED-CAPTIONS="cc1",AUDIO="aud1",SUBTITLES="sub1"\n' + 'v6/prog_index.m3u8\n' + '#EXT-X-STREAM-INF:AVERAGE-BANDWIDTH=3164759,BANDWIDTH=3170746,CODECS="avc1.640020,mp4a.40.2",RESOLUTION=1280x720,FRAME-RATE=59.940,CLOSED-CAPTIONS="cc1",AUDIO="aud1",SUBTITLES="sub1"\n' + 'v5/prog_index.m3u8\n' + '#EXT-X-STREAM-INF:AVERAGE-BANDWIDTH=1262552,BANDWIDTH=1276223,CODECS="avc1.64001e,mp4a.40.2",RESOLUTION=768x432,FRAME-RATE=29.970,CLOSED-CAPTIONS="cc1",AUDIO="aud1",SUBTITLES="sub1"\n' + 'v3/prog_index.m3u8\n' + '#EXT-X-STREAM-INF:AVERAGE-BANDWIDTH=893243,BANDWIDTH=904744,CODECS="avc1.64001e,mp4a.40.2",RESOLUTION=640x360,FRAME-RATE=29.970,CLOSED-CAPTIONS="cc1",AUDIO="aud1",SUBTITLES="sub1"\n' + 'v2/prog_index.m3u8\n' + '#EXT-X-STREAM-INF:AVERAGE-BANDWIDTH=527673,BANDWIDTH=538201,CODECS="avc1.640015,mp4a.40.2",RESOLUTION=480x270,FRAME-RATE=29.970,CLOSED-CAPTIONS="cc1",AUDIO="aud1",SUBTITLES="sub1"\n' + 'v1/prog_index.m3u8\n' + '\n' + '\n' + '#EXT-X-STREAM-INF:AVERAGE-BANDWIDTH=2390334,BANDWIDTH=2440329,CODECS="avc1.640020,ac-3",RESOLUTION=960x540,FRAME-RATE=59.940,CLOSED-CAPTIONS="cc1",AUDIO="aud2",SUBTITLES="sub1"\n' + 'v4/prog_index.m3u8\n' + '#EXT-X-STREAM-INF:AVERAGE-BANDWIDTH=8187954,BANDWIDTH=8201540,CODECS="avc1.64002a,ac-3",RESOLUTION=1920x1080,FRAME-RATE=59.940,CLOSED-CAPTIONS="cc1",AUDIO="aud2",SUBTITLES="sub1"\n' + 'v8/prog_index.m3u8\n' + '#EXT-X-STREAM-INF:AVERAGE-BANDWIDTH=6390134,BANDWIDTH=6406995,CODECS="avc1.64002a,ac-3",RESOLUTION=1920x1080,FRAME-RATE=59.940,CLOSED-CAPTIONS="cc1",AUDIO="aud2",SUBTITLES="sub1"\n' + 'v7/prog_index.m3u8\n' + '#EXT-X-STREAM-INF:AVERAGE-BANDWIDTH=4889569,BANDWIDTH=4907776,CODECS="avc1.64002a,ac-3",RESOLUTION=1920x1080,FRAME-RATE=59.940,CLOSED-CAPTIONS="cc1",AUDIO="aud2",SUBTITLES="sub1"\n' + 'v6/prog_index.m3u8\n' + '#EXT-X-STREAM-INF:AVERAGE-BANDWIDTH=3389869,BANDWIDTH=3395856,CODECS="avc1.640020,ac-3",RESOLUTION=1280x720,FRAME-RATE=59.940,CLOSED-CAPTIONS="cc1",AUDIO="aud2",SUBTITLES="sub1"\n' + 'v5/prog_index.m3u8\n' + '#EXT-X-STREAM-INF:AVERAGE-BANDWIDTH=1487662,BANDWIDTH=1501333,CODECS="avc1.64001e,ac-3",RESOLUTION=768x432,FRAME-RATE=29.970,CLOSED-CAPTIONS="cc1",AUDIO="aud2",SUBTITLES="sub1"\n' + 'v3/prog_index.m3u8\n' + '#EXT-X-STREAM-INF:AVERAGE-BANDWIDTH=1118353,BANDWIDTH=1129854,CODECS="avc1.64001e,ac-3",RESOLUTION=640x360,FRAME-RATE=29.970,CLOSED-CAPTIONS="cc1",AUDIO="aud2",SUBTITLES="sub1"\n' + 'v2/prog_index.m3u8\n' + '#EXT-X-STREAM-INF:AVERAGE-BANDWIDTH=752783,BANDWIDTH=763311,CODECS="avc1.640015,ac-3",RESOLUTION=480x270,FRAME-RATE=29.970,CLOSED-CAPTIONS="cc1",AUDIO="aud2",SUBTITLES="sub1"\n' + 'v1/prog_index.m3u8\n' + '\n' + '\n' + '#EXT-X-STREAM-INF:AVERAGE-BANDWIDTH=2198334,BANDWIDTH=2248329,CODECS="avc1.640020,ec-3",RESOLUTION=960x540,FRAME-RATE=59.940,CLOSED-CAPTIONS="cc1",AUDIO="aud3",SUBTITLES="sub1"\n' + 'v4/prog_index.m3u8\n' + '#EXT-X-STREAM-INF:AVERAGE-BANDWIDTH=7995954,BANDWIDTH=8009540,CODECS="avc1.64002a,ec-3",RESOLUTION=1920x1080,FRAME-RATE=59.940,CLOSED-CAPTIONS="cc1",AUDIO="aud3",SUBTITLES="sub1"\n' + 'v8/prog_index.m3u8\n' + '#EXT-X-STREAM-INF:AVERAGE-BANDWIDTH=6198134,BANDWIDTH=6214995,CODECS="avc1.64002a,ec-3",RESOLUTION=1920x1080,FRAME-RATE=59.940,CLOSED-CAPTIONS="cc1",AUDIO="aud3",SUBTITLES="sub1"\n' + 'v7/prog_index.m3u8\n' + '#EXT-X-STREAM-INF:AVERAGE-BANDWIDTH=4697569,BANDWIDTH=4715776,CODECS="avc1.64002a,ec-3",RESOLUTION=1920x1080,FRAME-RATE=59.940,CLOSED-CAPTIONS="cc1",AUDIO="aud3",SUBTITLES="sub1"\n' + 'v6/prog_index.m3u8\n' + '#EXT-X-STREAM-INF:AVERAGE-BANDWIDTH=3197869,BANDWIDTH=3203856,CODECS="avc1.640020,ec-3",RESOLUTION=1280x720,FRAME-RATE=59.940,CLOSED-CAPTIONS="cc1",AUDIO="aud3",SUBTITLES="sub1"\n' + 'v5/prog_index.m3u8\n' + '#EXT-X-STREAM-INF:AVERAGE-BANDWIDTH=1295662,BANDWIDTH=1309333,CODECS="avc1.64001e,ec-3",RESOLUTION=768x432,FRAME-RATE=29.970,CLOSED-CAPTIONS="cc1",AUDIO="aud3",SUBTITLES="sub1"\n' + 'v3/prog_index.m3u8\n' + '#EXT-X-STREAM-INF:AVERAGE-BANDWIDTH=926353,BANDWIDTH=937854,CODECS="avc1.64001e,ec-3",RESOLUTION=640x360,FRAME-RATE=29.970,CLOSED-CAPTIONS="cc1",AUDIO="aud3",SUBTITLES="sub1"\n' + 'v2/prog_index.m3u8\n' + '#EXT-X-STREAM-INF:AVERAGE-BANDWIDTH=560783,BANDWIDTH=571311,CODECS="avc1.640015,ec-3",RESOLUTION=480x270,FRAME-RATE=29.970,CLOSED-CAPTIONS="cc1",AUDIO="aud3",SUBTITLES="sub1"\n' + 'v1/prog_index.m3u8\n' + '\n',
  'master': '# A simple master playlist with multiple variant streams\n' + '#EXTM3U\n' + '#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=240000,RESOLUTION=396x224\n' + 'media.m3u8\n' + '#EXT-X-STREAM-INF:PROGRAM-ID=1, BANDWIDTH=40000\n' + 'media1.m3u8\n' + '#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=440000,RESOLUTION=396x224\n' + 'media2.m3u8\n' + '#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=1928000,RESOLUTION=960x540\n' + 'media3.m3u8\n' + '\n',
  'media': '#EXTM3U\n' + '#EXT-X-PLAYLIST-TYPE:VOD\n' + '#EXT-X-TARGETDURATION:10\n' + '#EXTINF:10,\n' + 'media-00001.ts\n' + '#EXTINF:10,\n' + 'media-00002.ts\n' + '#EXTINF:10,\n' + 'media-00003.ts\n' + '#EXTINF:10,\n' + 'media-00004.ts\n' + '#ZEN-TOTAL-DURATION:57.9911\n' + '#EXT-X-ENDLIST\n' + '\n',
  'media1': '#EXTM3U\n' + '#EXT-X-PLAYLIST-TYPE:VOD\n' + '#EXT-X-TARGETDURATION:10\n' + '#EXTINF:10,\n' + 'media1-00001.ts\n' + '#EXTINF:10,\n' + 'media1-00002.ts\n' + '#EXTINF:10,\n' + 'media1-00003.ts\n' + '#EXTINF:10,\n' + 'media1-00004.ts\n' + '#ZEN-TOTAL-DURATION:57.9911\n' + '#EXT-X-ENDLIST\n' + '\n',
  'media2': '#EXTM3U\n' + '#EXT-X-PLAYLIST-TYPE:VOD\n' + '#EXT-X-TARGETDURATION:10\n' + '#EXTINF:10,\n' + 'media2-00001.ts\n' + '#EXTINF:10,\n' + 'media2-00002.ts\n' + '#EXTINF:10,\n' + 'media2-00003.ts\n' + '#EXTINF:10,\n' + 'media2-00004.ts\n' + '#ZEN-TOTAL-DURATION:57.9911\n' + '#EXT-X-ENDLIST\n' + '\n',
  'media3': '#EXTM3U\n' + '#EXT-X-PLAYLIST-TYPE:VOD\n' + '#EXT-X-TARGETDURATION:10\n' + '#EXTINF:10,\n' + 'media3-00001.ts\n' + '#EXTINF:10,\n' + 'media3-00002.ts\n' + '#EXTINF:10,\n' + 'media3-00003.ts\n' + '#EXTINF:10,\n' + 'media3-00004.ts\n' + '#ZEN-TOTAL-DURATION:57.9911\n' + '#EXT-X-ENDLIST\n' + '\n',
  'mediaSequence': '#EXTM3U\n' + '#EXT-X-PLAYLIST-TYPE:VOD\n' + '#EXT-X-MEDIA-SEQUENCE:0\n' + '#EXT-X-ALLOW-CACHE:YES\n' + '#EXT-X-TARGETDURATION:8\n' + '#EXTINF:6.640,{}\n' + '/test/ts-files/tvy7/8a5e2822668b5370f4eb1438b2564fb7ab12ffe1-hi720.ts\n' + '#EXTINF:6.080,{}\n' + '/test/ts-files/tvy7/56be1cef869a1c0cc8e38864ad1add17d187f051-hi720.ts\n' + '#EXTINF:6.600,{}\n' + '/test/ts-files/tvy7/549c8c77f55f049741a06596e5c1e01dacaa46d0-hi720.ts\n' + '#EXTINF:5.000,{}\n' + '/test/ts-files/tvy7/6cfa378684ffeb1c455a64dae6c103290a1f53d4-hi720.ts\n' + '#EXT-X-ENDLIST\n' + '\n',
  'missingEndlist': '#EXTM3U\n' + '#EXT-X-TARGETDURATION:10\n' + '#EXTINF:10,\n' + '00001.ts\n' + '#EXTINF:10,\n' + '00002.ts\n' + '\n',
  'missingExtinf': '#EXTM3U\n' + '#EXT-X-TARGETDURATION:10\n' + '#EXT-X-VERSION:3\n' + '#EXT-X-MEDIA-SEQUENCE:0\n' + '#EXT-X-PLAYLIST-TYPE:VOD\n' + '#EXTINF:10\n' + 'hls_450k_video.ts\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,\n' + 'hls_450k_video.ts\n' + '#EXT-X-ENDLIST\n' + '\n',
  'missingMediaSequence': '#EXTM3U\n' + '#EXT-X-PLAYLIST-TYPE:VOD\n' + '#EXT-X-ALLOW-CACHE:YES\n' + '#EXT-X-TARGETDURATION:8\n' + '#EXTINF:6.640,{}\n' + '/test/ts-files/tvy7/8a5e2822668b5370f4eb1438b2564fb7ab12ffe1-hi720.ts\n' + '#EXTINF:6.080,{}\n' + '/test/ts-files/tvy7/56be1cef869a1c0cc8e38864ad1add17d187f051-hi720.ts\n' + '#EXTINF:6.600,{}\n' + '/test/ts-files/tvy7/549c8c77f55f049741a06596e5c1e01dacaa46d0-hi720.ts\n' + '#EXTINF:5.000,{}\n' + '/test/ts-files/tvy7/6cfa378684ffeb1c455a64dae6c103290a1f53d4-hi720.ts\n' + '#EXT-X-ENDLIST\n' + '\n',
  'missingSegmentDuration': '#EXTM3U\n' + '#EXT-X-PLAYLIST-TYPE:VOD\n' + '#EXT-X-MEDIA-SEQUENCE:0\n' + '#EXT-X-ALLOW-CACHE:YES\n' + '#EXT-X-TARGETDURATION:8\n' + '#EXTINF:6.640,{}\n' + '/test/ts-files/tvy7/8a5e2822668b5370f4eb1438b2564fb7ab12ffe1-hi720.ts\n' + '/test/ts-files/tvy7/56be1cef869a1c0cc8e38864ad1add17d187f051-hi720.ts\n' + '/test/ts-files/tvy7/549c8c77f55f049741a06596e5c1e01dacaa46d0-hi720.ts\n' + '/test/ts-files/tvy7/6cfa378684ffeb1c455a64dae6c103290a1f53d4-hi720.ts\n' + '#EXT-X-ENDLIST\n' + '\n',
  'multipleAudioGroups': '#EXTM3U\n' + '#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="audio-lo",LANGUAGE="eng",NAME="English",AUTOSELECT=YES, DEFAULT=YES,URI="englo/prog_index.m3u8"\n' + '#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="audio-lo",LANGUAGE="fre",NAME="Français",AUTOSELECT=YES, DEFAULT=NO,URI="frelo/prog_index.m3u8"\n' + '#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="audio-lo",LANGUAGE="sp",NAME="Espanol",AUTOSELECT=YES, DEFAULT=NO,URI="splo/prog_index.m3u8"\n' + '\n' + '#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="audio-hi",LANGUAGE="eng",NAME="English",AUTOSELECT=YES, DEFAULT=YES,URI="eng/prog_index.m3u8"\n' + '#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="audio-hi",LANGUAGE="fre",NAME="Français",AUTOSELECT=YES, DEFAULT=NO,URI="fre/prog_index.m3u8"\n' + '#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="audio-hi",LANGUAGE="sp",NAME="Espanol",AUTOSELECT=YES, DEFAULT=NO,URI="sp/prog_index.m3u8"\n' + '\n' + '#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=195023,CODECS="mp4a.40.5", AUDIO="audio-lo"\n' + 'lo/prog_index.m3u8\n' + '#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=260000,CODECS="avc1.42e01e,mp4a.40.2", AUDIO="audio-lo"\n' + 'lo2/prog_index.m3u8\n' + '#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=591680,CODECS="mp4a.40.2, avc1.64001e", AUDIO="audio-hi"\n' + 'hi/prog_index.m3u8\n' + '#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=650000,CODECS="avc1.42e01e,mp4a.40.2", AUDIO="audio-hi"\n' + 'hi2/prog_index.m3u8\n' + '\n',
  'multipleAudioGroupsCombinedMain': '#EXTM3U\n' + '#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="audio-lo",LANGUAGE="eng",NAME="English",AUTOSELECT=YES, DEFAULT=YES\n' + '#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="audio-lo",LANGUAGE="fre",NAME="Français",AUTOSELECT=YES, DEFAULT=NO,URI="frelo/prog_index.m3u8"\n' + '#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="audio-lo",LANGUAGE="sp",NAME="Espanol",AUTOSELECT=YES, DEFAULT=NO,URI="splo/prog_index.m3u8"\n' + '\n' + '#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="audio-hi",LANGUAGE="eng",NAME="English",AUTOSELECT=YES, DEFAULT=YES,URI="eng/prog_index.m3u8"\n' + '#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="audio-hi",LANGUAGE="fre",NAME="Français",AUTOSELECT=YES, DEFAULT=NO,URI="fre/prog_index.m3u8"\n' + '#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="audio-hi",LANGUAGE="sp",NAME="Espanol",AUTOSELECT=YES, DEFAULT=NO,URI="sp/prog_index.m3u8"\n' + '\n' + '#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=195023,CODECS="mp4a.40.5", AUDIO="audio-lo"\n' + 'lo/prog_index.m3u8\n' + '#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=260000,CODECS="avc1.42e01e,mp4a.40.2", AUDIO="audio-lo"\n' + 'lo2/prog_index.m3u8\n' + '#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=591680,CODECS="mp4a.40.2, avc1.64001e", AUDIO="audio-hi"\n' + 'hi/prog_index.m3u8\n' + '#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=650000,CODECS="avc1.42e01e,mp4a.40.2", AUDIO="audio-hi"\n' + 'hi2/prog_index.m3u8\n' + '\n',
  'multipleTargetDurations': '#EXTM3U\n' + '001.ts\n' + '#EXT-X-TARGETDURATION:9\n' + '002.ts\n' + '#EXTINF:7\n' + '003.ts\n' + '#EXT-X-TARGETDURATION:10\n' + '004.ts\n',
  'multipleVideo': '#EXTM3U\n' + '#EXT-X-MEDIA:TYPE=VIDEO,GROUP-ID="200kbs",NAME="Angle1",AUTOSELECT=YES,DEFAULT=YES\n' + '#EXT-X-MEDIA:TYPE=VIDEO,GROUP-ID="200kbs",NAME="Angle2",AUTOSELECT=YES,DEFAULT=NO,URI="Angle2/200kbs/prog_index.m3u8"\n' + '#EXT-X-MEDIA:TYPE=VIDEO,GROUP-ID="200kbs",NAME="Angle3",AUTOSELECT=YES,DEFAULT=NO,URI="Angle3/200kbs/prog_index.m3u8"\n' + ' \n' + '#EXT-X-MEDIA:TYPE=VIDEO,GROUP-ID="500kbs",NAME="Angle1",AUTOSELECT=YES,DEFAULT=YES\n' + '#EXT-X-MEDIA:TYPE=VIDEO,GROUP-ID="500kbs",NAME="Angle2",AUTOSELECT=YES,DEFAULT=NO,URI="Angle2/500kbs/prog_index.m3u8"\n' + '#EXT-X-MEDIA:TYPE=VIDEO,GROUP-ID="500kbs",NAME="Angle3",AUTOSELECT=YES,DEFAULT=NO,URI="Angle3/500kbs/prog_index.m3u8"\n' + ' \n' + '#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="aac",LANGUAGE="eng",NAME="English",AUTOSELECT=YES,DEFAULT=YES,URI="eng/prog_index.m3u8"\n' + ' \n' + '#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=300000,CODECS="mp4a.40.2,avc1.4d401e",VIDEO="200kbs",AUDIO="aac"\n' + 'Angle1/200kbs/prog_index.m3u\n' + ' \n' + '#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=754857,CODECS="mp4a.40.2,avc1.4d401e",VIDEO="500kbs",AUDIO="aac"\n' + 'Angle1/500kbs/prog_index.m3u8\n',
  'negativeMediaSequence': '#EXTM3U\n' + '#EXT-X-PLAYLIST-TYPE:VOD\n' + '#EXT-X-MEDIA-SEQUENCE:-11\n' + '#EXT-X-ALLOW-CACHE:YES\n' + '#EXT-X-TARGETDURATION:8\n' + '#EXTINF:6.640,{}\n' + '/test/ts-files/tvy7/8a5e2822668b5370f4eb1438b2564fb7ab12ffe1-hi720.ts\n' + '#EXTINF:6.080,{}\n' + '/test/ts-files/tvy7/56be1cef869a1c0cc8e38864ad1add17d187f051-hi720.ts\n' + '#EXTINF:6.600,{}\n' + '/test/ts-files/tvy7/549c8c77f55f049741a06596e5c1e01dacaa46d0-hi720.ts\n' + '#EXTINF:5.000,{}\n' + '/test/ts-files/tvy7/6cfa378684ffeb1c455a64dae6c103290a1f53d4-hi720.ts\n' + '#EXT-X-ENDLIST\n' + '\n',
  'playlist': '#EXTM3U\n' + '#EXT-X-TARGETDURATION:10\n' + '#EXT-X-VERSION:4\n' + '#EXT-X-MEDIA-SEQUENCE:0\n' + '#EXT-X-PLAYLIST-TYPE:VOD\n' + '#EXTINF:10,	\n' + '#EXT-X-BYTERANGE:522828@0\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,	\n' + '#EXT-X-BYTERANGE:587500@522828\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,	\n' + '#EXT-X-BYTERANGE:713084@1110328\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,	\n' + '#EXT-X-BYTERANGE:476580@1823412\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,	\n' + '#EXT-X-BYTERANGE:535612@2299992\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,	\n' + '#EXT-X-BYTERANGE:207176@2835604\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,	\n' + '#EXT-X-BYTERANGE:455900@3042780\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,	\n' + '#EXT-X-BYTERANGE:657248@3498680\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,	\n' + '#EXT-X-BYTERANGE:571708@4155928\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,	\n' + '#EXT-X-BYTERANGE:485040@4727636\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,	\n' + '#EXT-X-BYTERANGE:709136@5212676\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,	\n' + '#EXT-X-BYTERANGE:730004@5921812\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,	\n' + '#EXT-X-BYTERANGE:456276@6651816\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,	\n' + '#EXT-X-BYTERANGE:468684@7108092\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,	\n' + '#EXT-X-BYTERANGE:444996@7576776\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,	\n' + '#EXT-X-BYTERANGE:331444@8021772\n' + 'hls_450k_video.ts\n' + '#EXTINF:1.4167,	\n' + '#EXT-X-BYTERANGE:44556@8353216\n' + 'hls_450k_video.ts\n' + '#EXT-X-ENDLIST\n' + '\n',
  'playlistMediaSequenceHigher': '#EXTM3U\n' + '#EXT-X-PLAYLIST-TYPE:VOD\n' + '#EXT-X-MEDIA-SEQUENCE:17\n' + '#EXT-X-ALLOW-CACHE:YES\n' + '#EXT-X-TARGETDURATION:8\n' + '#EXTINF:6.640,{}\n' + '/test/ts-files/tvy7/8a5e2822668b5370f4eb1438b2564fb7ab12ffe1-hi720.ts\n' + '#EXT-X-ENDLIST\n' + '\n',
  'playlist_allow_cache_template': '#EXTM3U\n' + '#EXT-X-TARGETDURATION:10\n' + '#EXT-X-VERSION:{{{version}}}\n' + '{{#if allowCache}}#EXT-X-ALLOW-CACHE:{{{allowCache}}}{{/if}}\n' + '#EXT-X-MEDIA-SEQUENCE:0\n' + '#EXT-X-PLAYLIST-TYPE:VOD\n' + '#EXTINF:10,\n' + '#EXT-X-BYTERANGE:522828@0\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,\n' + '#EXT-X-BYTERANGE:587500@522828\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,\n' + '#EXT-X-BYTERANGE:713084@1110328\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,\n' + '#EXT-X-BYTERANGE:476580@1823412\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,\n' + '#EXT-X-BYTERANGE:535612@2299992\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,\n' + '#EXT-X-BYTERANGE:207176@2835604\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,\n' + '#EXT-X-BYTERANGE:455900@3042780\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,\n' + '#EXT-X-BYTERANGE:657248@3498680\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,\n' + '#EXT-X-BYTERANGE:571708@4155928\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,\n' + '#EXT-X-BYTERANGE:485040@4727636\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,\n' + '#EXT-X-BYTERANGE:709136@5212676\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,\n' + '#EXT-X-BYTERANGE:730004@5921812\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,\n' + '#EXT-X-BYTERANGE:456276@6651816\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,\n' + '#EXT-X-BYTERANGE:468684@7108092\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,\n' + '#EXT-X-BYTERANGE:444996@7576776\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,\n' + '#EXT-X-BYTERANGE:331444@8021772\n' + 'hls_450k_video.ts\n' + '#EXTINF:1.4167,\n' + '#EXT-X-BYTERANGE:44556@8353216\n' + 'hls_450k_video.ts\n' + '#EXT-X-ENDLIST\n',
  'playlist_byte_range_template': '#EXTM3U\n' + '#EXT-X-TARGETDURATION:10\n' + '#EXT-X-VERSION:{{{version}}}\n' + '#EXT-X-MEDIA-SEQUENCE:0\n' + '#EXT-X-PLAYLIST-TYPE:VOD\n' + '#EXTINF:10,\n' + '{{#if byteRange}}#EXT-X-BYTERANGE:{{{byteRange}}}{{/if}}\n' + '//#EXT-X-BYTERANGE:522828@0\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,\n' + '{{#if byteRange1}}#EXT-X-BYTERANGE:{{{byteRange1}}}{{/if}}\n' + '//#EXT-X-BYTERANGE:587500@522828\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,\n' + '#EXT-X-BYTERANGE:713084@1110328\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,\n' + '#EXT-X-BYTERANGE:476580@1823412\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,\n' + '#EXT-X-BYTERANGE:535612@2299992\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,\n' + '#EXT-X-BYTERANGE:207176@2835604\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,\n' + '#EXT-X-BYTERANGE:455900@3042780\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,\n' + '#EXT-X-BYTERANGE:657248@3498680\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,\n' + '#EXT-X-BYTERANGE:571708@4155928\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,\n' + '#EXT-X-BYTERANGE:485040@4727636\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,\n' + '#EXT-X-BYTERANGE:709136@5212676\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,\n' + '#EXT-X-BYTERANGE:730004@5921812\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,\n' + '#EXT-X-BYTERANGE:456276@6651816\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,\n' + '#EXT-X-BYTERANGE:468684@7108092\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,\n' + '#EXT-X-BYTERANGE:444996@7576776\n' + 'hls_450k_video.ts\n' + '#EXTINF:10,\n' + '#EXT-X-BYTERANGE:331444@8021772\n' + 'hls_450k_video.ts\n' + '#EXTINF:1.4167,\n' + '{{#if byteRange2}}#EXT-X-BYTERANGE:{{{byteRange2}}}{{/if}}\n' + '//#EXT-X-BYTERANGE:44556@8353216\n' + 'hls_450k_video.ts\n' + '#EXT-X-ENDLIST\n',
  'playlist_extinf_template': '#EXTM3U\n' + '  #EXT-X-TARGETDURATION:10\n' + '  #EXT-X-VERSION:{{{version}}}\n' + '  #EXT-X-MEDIA-SEQUENCE:0\n' + '  #EXT-X-PLAYLIST-TYPE:VOD\n' + '  {{#if extInf}}#EXTINF:{{{extInf}}}{{/if}}\n' + '  #EXT-X-BYTERANGE:522828@0\n' + '  {{#if segment}}{{{segment}}}\n{{/if}}\n' + '  {{#if extInf1}}#EXTINF:{{{extInf1}}}{{/if}}\n' + '  #EXT-X-BYTERANGE:587500@522828\n' + '  hls_450k_video.ts\n' + '  #EXTINF:10,\n' + '  #EXT-X-BYTERANGE:713084@1110328\n' + '  hls_450k_video.ts\n' + '  #EXTINF:10,\n' + '  #EXT-X-BYTERANGE:476580@1823412\n' + '  hls_450k_video.ts\n' + '  #EXTINF:10,\n' + '  #EXT-X-BYTERANGE:535612@2299992\n' + '  hls_450k_video.ts\n' + '  #EXTINF:10,\n' + '  #EXT-X-BYTERANGE:207176@2835604\n' + '  hls_450k_video.ts\n' + '  #EXTINF:10,\n' + '  #EXT-X-BYTERANGE:455900@3042780\n' + '  hls_450k_video.ts\n' + '  #EXTINF:10,\n' + '  #EXT-X-BYTERANGE:657248@3498680\n' + '  hls_450k_video.ts\n' + '  #EXTINF:10,\n' + '  #EXT-X-BYTERANGE:571708@4155928\n' + '  hls_450k_video.ts\n' + '  #EXTINF:10,\n' + '  #EXT-X-BYTERANGE:485040@4727636\n' + '  hls_450k_video.ts\n' + '  #EXTINF:10,\n' + '  #EXT-X-BYTERANGE:709136@5212676\n' + '  hls_450k_video.ts\n' + '  #EXTINF:10,\n' + '  #EXT-X-BYTERANGE:730004@5921812\n' + '  hls_450k_video.ts\n' + '  #EXTINF:10,\n' + '  #EXT-X-BYTERANGE:456276@6651816\n' + '  hls_450k_video.ts\n' + '  #EXTINF:10,\n' + '  #EXT-X-BYTERANGE:468684@7108092\n' + '  hls_450k_video.ts\n' + '  #EXTINF:10,\n' + '  #EXT-X-BYTERANGE:444996@7576776\n' + '  hls_450k_video.ts\n' + '  #EXTINF:10,\n' + '  #EXT-X-BYTERANGE:331444@8021772\n' + '  hls_450k_video.ts\n' + '  {{#if extInf2}}#EXTINF:{{{extInf2}}}{{/if}}\n' + '  #EXT-X-BYTERANGE:44556@8353216\n' + '  hls_450k_video.ts\n' + '  #EXT-X-ENDLIST\n' + '\n',
  'playlist_media_sequence_template': '#EXTM3U\n' + '#EXT-X-PLAYLIST-TYPE:VOD\n' + '{{#if mediaSequence}}#EXT-X-MEDIA-SEQUENCE:{{{mediaSequence}}}{{/if}}\n' + '{{#if mediaSequence1}}#EXT-X-MEDIA-SEQUENCE:{{{mediaSequence2}}}{{/if}}\n' + '#EXT-X-ALLOW-CACHE:YES\n' + '#EXT-X-TARGETDURATION:8\n' + '#EXTINF:6.640,{}\n' + '/test/ts-files/tvy7/8a5e2822668b5370f4eb1438b2564fb7ab12ffe1-hi720.ts\n' + '#EXTINF:6.080,{}\n' + '/test/ts-files/tvy7/56be1cef869a1c0cc8e38864ad1add17d187f051-hi720.ts\n' + '#EXTINF:6.600,{}\n' + '/test/ts-files/tvy7/549c8c77f55f049741a06596e5c1e01dacaa46d0-hi720.ts\n' + '#EXTINF:5.000,{}\n' + '/test/ts-files/tvy7/6cfa378684ffeb1c455a64dae6c103290a1f53d4-hi720.ts\n' + '#EXT-X-ENDLIST\n' + '\n',
  'playlist_target_duration_template': '#EXTM3U\n' + '#EXT-X-PLAYLIST-TYPE:VOD\n' + '#EXT-X-MEDIA-SEQUENCE:0\n' + '#EXT-X-ALLOW-CACHE:YES\n' + '{{#if targetDuration}}#EXT-X-TARGETDURATION:{{{targetDuration}}}{{/if}}\n' + '#EXTINF:6.640,{}\n' + '/test/ts-files/tvy7/8a5e2822668b5370f4eb1438b2564fb7ab12ffe1-hi720.ts\n' + '#EXTINF:6.080,{}\n' + '/test/ts-files/tvy7/56be1cef869a1c0cc8e38864ad1add17d187f051-hi720.ts\n' + '#EXTINF:6.600,{}\n' + '/test/ts-files/tvy7/549c8c77f55f049741a06596e5c1e01dacaa46d0-hi720.ts\n' + '#EXTINF:5.000,{}\n' + '/test/ts-files/tvy7/6cfa378684ffeb1c455a64dae6c103290a1f53d4-hi720.ts\n' + '#EXT-X-ENDLIST\n' + '\n',
  'playlist_type_template': '#EXTM3U\n' + '{{#if playlistType}}#EXT-X-PLAYLIST-TYPE:{{{playlistType}}}{{/if}}\n' + '#EXT-X-TARGETDURATION:10\n' + '#EXTINF:10,\n' + '/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00001.ts\n' + '#EXTINF:10,\n' + '/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00002.ts\n' + '#EXTINF:10,\n' + '/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00003.ts\n' + '#EXTINF:10,\n' + '/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00004.ts\n' + '#EXTINF:10,\n' + '/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00005.ts\n' + '#EXTINF:8,\n' + '/test/ts-files/zencoder/haze/Haze_Mantel_President_encoded_1200-00006.ts\n' + '#ZEN-TOTAL-DURATION:57.9911\n' + '#EXT-X-ENDLIST\n' + '\n',
  'streamInfInvalid': '# A simple master playlist with multiple variant streams\n' + '#EXTM3U\n' + '#EXT-X-STREAM-INF:PROGRAM-ID=1\n' + 'media.m3u8\n' + '#EXT-X-STREAM-INF:\n' + 'media1.m3u8\n' + '\n',
  'twoMediaSequences': '#EXTM3U\n' + '#EXT-X-PLAYLIST-TYPE:VOD\n' + '#EXT-X-MEDIA-SEQUENCE:0\n' + '#EXT-X-MEDIA-SEQUENCE:11\n' + '#EXT-X-ALLOW-CACHE:YES\n' + '#EXT-X-TARGETDURATION:8\n' + '#EXTINF:6.640,{}\n' + '/test/ts-files/tvy7/8a5e2822668b5370f4eb1438b2564fb7ab12ffe1-hi720.ts\n' + '#EXTINF:6.080,{}\n' + '/test/ts-files/tvy7/56be1cef869a1c0cc8e38864ad1add17d187f051-hi720.ts\n' + '#EXTINF:6.600,{}\n' + '/test/ts-files/tvy7/549c8c77f55f049741a06596e5c1e01dacaa46d0-hi720.ts\n' + '#EXTINF:5.000,{}\n' + '/test/ts-files/tvy7/6cfa378684ffeb1c455a64dae6c103290a1f53d4-hi720.ts\n' + '#EXT-X-ENDLIST\n' + '\n',
  'versionInvalid': '#EXTM3U\n' + '#EXT-X-TARGETDURATION:10\n' + '#EXT-X-VERSION:NaN\n' + '#EXT-X-MEDIA-SEQUENCE:0\n' + '#EXT-X-PLAYLIST-TYPE:VOD\n' + '#EXTINF:10,\n' + 'hls_450k_video.ts\n' + '#EXT-X-ENDLIST\n' + '\n',
  'whiteSpace': '#EXTM3U\n' + '#EXT-X-PLAYLIST-TYPE:VOD\n' + '#EXT-X-TARGETDURATION:10\n' + '    \n' + '#EXTINF:10,\n' + 'http://example.com/00001.ts \n' + '#EXTINF:10,\n' + ' https://example.com/00002.ts\n' + '#EXTINF:10,\n' + ' //example.com/00003.ts \n' + '#EXTINF:10,\n' + '	http://example.com/00004.ts\n' + '#ZEN-TOTAL-DURATION:57.9911\n' + '#EXT-X-ENDLIST\n' + '\n',
  'zeroDuration': '#EXTM3U\n' + '#EXT-X-PLAYLIST-TYPE:VOD\n' + '#EXT-X-TARGETDURATION:10\n' + '\n' + '#EXTINF:0,\n' + 'http://example.com/00001.ts\n' + '#ZEN-TOTAL-DURATION:57.9911\n' + '#EXT-X-ENDLIST\n' + '\n'
};

},{}]},{},[6]);
