/**
 * @file async-stream.js
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _stream = require('./stream');

var _stream2 = _interopRequireDefault(_stream);

/**
 * A wrapper around the Stream class to use setTiemout
 * and run stream "jobs" Asynchronously
 *
 * @class AsyncStream
 * @extends Stream
 */

var AsyncStream = (function (_Stream) {
  _inherits(AsyncStream, _Stream);

  function AsyncStream() {
    _classCallCheck(this, AsyncStream);

    _get(Object.getPrototypeOf(AsyncStream.prototype), 'constructor', this).call(this, _stream2['default']);
    this.jobs = [];
    this.delay = 1;
    this.timeout_ = null;
  }

  /**
   * process an async job
   *
   * @private
   */

  _createClass(AsyncStream, [{
    key: 'processJob_',
    value: function processJob_() {
      this.jobs.shift()();
      if (this.jobs.length) {
        this.timeout_ = setTimeout(this.processJob_.bind(this), this.delay);
      } else {
        this.timeout_ = null;
      }
    }

    /**
     * push a job into the stream
     *
     * @param {Function} job the job to push into the stream
     */
  }, {
    key: 'push',
    value: function push(job) {
      this.jobs.push(job);
      if (!this.timeout_) {
        this.timeout_ = setTimeout(this.processJob_.bind(this), this.delay);
      }
    }
  }]);

  return AsyncStream;
})(_stream2['default']);

exports['default'] = AsyncStream;
module.exports = exports['default'];