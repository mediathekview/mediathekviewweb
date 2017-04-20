/**
 * @file decrypter.js
 *
 * An asynchronous implementation of AES-128 CBC decryption with
 * PKCS#7 padding.
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _aes = require('./aes');

var _aes2 = _interopRequireDefault(_aes);

var _asyncStream = require('./async-stream');

var _asyncStream2 = _interopRequireDefault(_asyncStream);

var _pkcs7 = require('pkcs7');

/**
 * Convert network-order (big-endian) bytes into their little-endian
 * representation.
 */
var ntoh = function ntoh(word) {
  return word << 24 | (word & 0xff00) << 8 | (word & 0xff0000) >> 8 | word >>> 24;
};

/**
 * Decrypt bytes using AES-128 with CBC and PKCS#7 padding.
 *
 * @param {Uint8Array} encrypted the encrypted bytes
 * @param {Uint32Array} key the bytes of the decryption key
 * @param {Uint32Array} initVector the initialization vector (IV) to
 * use for the first round of CBC.
 * @return {Uint8Array} the decrypted bytes
 *
 * @see http://en.wikipedia.org/wiki/Advanced_Encryption_Standard
 * @see http://en.wikipedia.org/wiki/Block_cipher_mode_of_operation#Cipher_Block_Chaining_.28CBC.29
 * @see https://tools.ietf.org/html/rfc2315
 */
var decrypt = function decrypt(encrypted, key, initVector) {
  // word-level access to the encrypted bytes
  var encrypted32 = new Int32Array(encrypted.buffer, encrypted.byteOffset, encrypted.byteLength >> 2);

  var decipher = new _aes2['default'](Array.prototype.slice.call(key));

  // byte and word-level access for the decrypted output
  var decrypted = new Uint8Array(encrypted.byteLength);
  var decrypted32 = new Int32Array(decrypted.buffer);

  // temporary variables for working with the IV, encrypted, and
  // decrypted data
  var init0 = undefined;
  var init1 = undefined;
  var init2 = undefined;
  var init3 = undefined;
  var encrypted0 = undefined;
  var encrypted1 = undefined;
  var encrypted2 = undefined;
  var encrypted3 = undefined;

  // iteration variable
  var wordIx = undefined;

  // pull out the words of the IV to ensure we don't modify the
  // passed-in reference and easier access
  init0 = initVector[0];
  init1 = initVector[1];
  init2 = initVector[2];
  init3 = initVector[3];

  // decrypt four word sequences, applying cipher-block chaining (CBC)
  // to each decrypted block
  for (wordIx = 0; wordIx < encrypted32.length; wordIx += 4) {
    // convert big-endian (network order) words into little-endian
    // (javascript order)
    encrypted0 = ntoh(encrypted32[wordIx]);
    encrypted1 = ntoh(encrypted32[wordIx + 1]);
    encrypted2 = ntoh(encrypted32[wordIx + 2]);
    encrypted3 = ntoh(encrypted32[wordIx + 3]);

    // decrypt the block
    decipher.decrypt(encrypted0, encrypted1, encrypted2, encrypted3, decrypted32, wordIx);

    // XOR with the IV, and restore network byte-order to obtain the
    // plaintext
    decrypted32[wordIx] = ntoh(decrypted32[wordIx] ^ init0);
    decrypted32[wordIx + 1] = ntoh(decrypted32[wordIx + 1] ^ init1);
    decrypted32[wordIx + 2] = ntoh(decrypted32[wordIx + 2] ^ init2);
    decrypted32[wordIx + 3] = ntoh(decrypted32[wordIx + 3] ^ init3);

    // setup the IV for the next round
    init0 = encrypted0;
    init1 = encrypted1;
    init2 = encrypted2;
    init3 = encrypted3;
  }

  return decrypted;
};

exports.decrypt = decrypt;
/**
 * The `Decrypter` class that manages decryption of AES
 * data through `AsyncStream` objects and the `decrypt`
 * function
 *
 * @param {Uint8Array} encrypted the encrypted bytes
 * @param {Uint32Array} key the bytes of the decryption key
 * @param {Uint32Array} initVector the initialization vector (IV) to
 * @param {Function} done the function to run when done
 * @class Decrypter
 */

var Decrypter = (function () {
  function Decrypter(encrypted, key, initVector, done) {
    _classCallCheck(this, Decrypter);

    var step = Decrypter.STEP;
    var encrypted32 = new Int32Array(encrypted.buffer);
    var decrypted = new Uint8Array(encrypted.byteLength);
    var i = 0;

    this.asyncStream_ = new _asyncStream2['default']();

    // split up the encryption job and do the individual chunks asynchronously
    this.asyncStream_.push(this.decryptChunk_(encrypted32.subarray(i, i + step), key, initVector, decrypted));
    for (i = step; i < encrypted32.length; i += step) {
      initVector = new Uint32Array([ntoh(encrypted32[i - 4]), ntoh(encrypted32[i - 3]), ntoh(encrypted32[i - 2]), ntoh(encrypted32[i - 1])]);
      this.asyncStream_.push(this.decryptChunk_(encrypted32.subarray(i, i + step), key, initVector, decrypted));
    }
    // invoke the done() callback when everything is finished
    this.asyncStream_.push(function () {
      // remove pkcs#7 padding from the decrypted bytes
      done(null, (0, _pkcs7.unpad)(decrypted));
    });
  }

  /**
   * a getter for step the maximum number of bytes to process at one time
   *
   * @return {Number} the value of step 32000
   */

  _createClass(Decrypter, [{
    key: 'decryptChunk_',

    /**
     * @private
     */
    value: function decryptChunk_(encrypted, key, initVector, decrypted) {
      return function () {
        var bytes = decrypt(encrypted, key, initVector);

        decrypted.set(bytes, encrypted.byteOffset);
      };
    }
  }], [{
    key: 'STEP',
    get: function get() {
      // 4 * 8000;
      return 32000;
    }
  }]);

  return Decrypter;
})();

exports.Decrypter = Decrypter;
exports['default'] = {
  Decrypter: Decrypter,
  decrypt: decrypt
};