'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _globalWindow = require('global/window');

var _globalWindow2 = _interopRequireDefault(_globalWindow);

var _aesDecrypter = require('aes-decrypter');

var _binUtils = require('./bin-utils');

/**
 * Our web worker interface so that things can talk to aes-decrypter
 * that will be running in a web worker. the scope is passed to this by
 * webworkify.
 *
 * @param {Object} self
 *        the scope for the web worker
 */
var DecrypterWorker = function DecrypterWorker(self) {
  self.onmessage = function (event) {
    var data = event.data;
    var encrypted = new Uint8Array(data.encrypted.bytes, data.encrypted.byteOffset, data.encrypted.byteLength);
    var key = new Uint32Array(data.key.bytes, data.key.byteOffset, data.key.byteLength / 4);
    var iv = new Uint32Array(data.iv.bytes, data.iv.byteOffset, data.iv.byteLength / 4);

    /* eslint-disable no-new, handle-callback-err */
    new _aesDecrypter.Decrypter(encrypted, key, iv, function (err, bytes) {
      _globalWindow2['default'].postMessage((0, _binUtils.createTransferableMessage)({
        source: data.source,
        decrypted: bytes
      }), [bytes.buffer]);
    });
    /* eslint-enable */
  };
};

exports['default'] = function (self) {
  return new DecrypterWorker(self);
};

module.exports = exports['default'];