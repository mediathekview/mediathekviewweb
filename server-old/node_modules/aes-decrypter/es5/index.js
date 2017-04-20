/**
 * @file index.js
 *
 * Index module to easily import the primary components of AES-128
 * decryption. Like this:
 *
 * ```js
 * import {Decrypter, decrypt, AsyncStream} from 'aes-decrypter';
 * ```
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _decrypter = require('./decrypter');

var _asyncStream = require('./async-stream');

var _asyncStream2 = _interopRequireDefault(_asyncStream);

exports['default'] = {
  decrypt: _decrypter.decrypt,
  Decrypter: _decrypter.Decrypter,
  AsyncStream: _asyncStream2['default']
};
module.exports = exports['default'];