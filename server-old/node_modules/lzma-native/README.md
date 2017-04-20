lzma-native
===========

[![NPM Version](https://img.shields.io/npm/v/lzma-native.svg?style=flat)](https://npmjs.org/package/lzma-native)
[![NPM Downloads](https://img.shields.io/npm/dm/lzma-native.svg?style=flat)](https://npmjs.org/package/lzma-native)
[![Build Status](https://travis-ci.org/addaleax/lzma-native.svg?style=flat&branch=master)](https://travis-ci.org/addaleax/lzma-native?branch=master)
[![Windows](https://img.shields.io/appveyor/ci/addaleax/lzma-native/master.svg?label=windows)](https://ci.appveyor.com/project/addaleax/lzma-native)
[![Coverage Status](https://coveralls.io/repos/addaleax/lzma-native/badge.svg?branch=master)](https://coveralls.io/r/addaleax/lzma-native?branch=master)
[![Dependency Status](https://david-dm.org/addaleax/lzma-native.svg?style=flat)](https://david-dm.org/addaleax/lzma-native)
[![devDependency Status](https://david-dm.org/addaleax/lzma-native/dev-status.svg?style=flat)](https://david-dm.org/addaleax/lzma-native#info=devDependencies)

Node.js interface to the native liblzma compression library (.xz file format, among others)

This package provides interfaces for compression and decompression
of `.xz` (and legacy `.lzma`) files, both stream-based and string-based.

<a name="example-usage"></a>
## Example usage

<a name="installation"></a>
### Installation
Simply install `lzma-native` via npm:
```bash
$ npm install --save lzma-native
```

*Note*: As of version 1.0.0, this module provides pre-built binaries for multiple Node.js
versions and all major OS using [node-pre-gyp](https://github.com/mapbox/node-pre-gyp),
so for 99 % of users no compiler toolchain is necessary.
Please [create an issue here](https://github.com/addaleax/lzma-native/issues/new)
if you have any trouble installing this module.

<a name="streams-usage"></a>
### For streams

If you don’t have any fancy requirements, using this library is quite simple:

<!--
Some examples in this README file are executed as part of the automatic
testing process. See test/readme-examples.js for details.
-->

<!-- runtest:{Compress the README.md file} -->

```js
var lzma = require('lzma-native');

var compressor = lzma.createCompressor();
var input = fs.createReadStream('README.md');
var output = fs.createWriteStream('README.md.xz');

input.pipe(compressor).pipe(output);
```

For decompression, you can simply use `lzma.createDecompressor()`.

Both functions return a stream where you can pipe your
input in and read your (de)compressed output from.

<a name="buffers-usage"></a>
### For simple strings/Buffers

If you want your input/output to be Buffers (strings will be accepted as input),
this even gets a little simpler:

<!-- runtest:{Compress a simple string directly} -->

```js
lzma.compress('Banana', function(result) {
    console.log(result); // <Buffer fd 37 7a 58 5a 00 00 01 69 22 de 36 02 00 21 ...>
});
```

Again, replace `lzma.compress` with `lzma.decompress` and you’ll get the inverse transformation.

For `node >= 0.12` (with `Promise` available), `lzma.compress` and `lzma.decompress`
will return promises and you don’t need to provide any kind of callback
([Example code](#api-q-compress-examle)).

<a name="api"></a>
## API

<a name="api-compat-implementations"></a>
### Compatibility implementations

Apart from the API described here, `lzma-native` implements the APIs of the following
other LZMA libraries so you can use it nearly as a drop-in replacement:

* [node-xz][node-xz] via `lzma.Compressor` and `lzma.Decompressor`
* [LZMA-JS][LZMA-JS] via `lzma.LZMA().compress` and `lzma.LZMA().decompress`,
  though without actual support for progress functions and returning `Buffer` objects
  instead of integer arrays. (This produces output in the `.lzma` file format, *not* the `.xz` format!)

<a name="api-multithreading"></a>
### Multi-threaded encoding

Since version `1.5.0`, lzma-native supports liblzma’s built-in multi-threading
encoding capabilities. To make use of them, set the `threads` option to
an integer value: `lzma.createCompressor({ threads: n });`. You can use
value of `0` to use the number of processor cores. This option is only
available for the `easyEncoder` (the default) and `streamEncoder` encoders.

Note that, by default, encoding will take place in Node’s libuv thread pool
regardless of this option, and setting it when multiple encoders are running
is likely to affect performance negatively.

<a name="api-reference"></a>
### Reference

[Encoding strings and Buffer objects](#api-encoding-buffers)
 * [`compress()`](#api-compress) – Compress strings and Buffers
 * [`decompress()`](#api-decompress) – Decompress strings and Buffers
 * [`LZMA().compress()`](#api-LZMA_compress) ([LZMA-JS][LZMA-JS] compatibility)
 * [`LZMA().decompress()`](#api-LZMA_decompress) ([LZMA-JS][LZMA-JS] compatibility)

[Creating streams for encoding](#api-creating-streams)
 * [`createCompressor()`](#api-create-compressor) – Compress streams
 * [`createDecompressor()`](#api-create-decompressor) – Decompress streams
 * [`createStream()`](#api-create-stream) – (De-)Compression with advanced options
 * [`Compressor()`](#api-robey_compressor) ([node-xz][node-xz] compatibility)
 * [`Decompressor()`](#api-robey_decompressor) ([node-xz][node-xz] compatibility)

[.xz file metadata](#api-parse-indexes)
 * [`isXZ()`](#api-isxz) – Test Buffer for `.xz` file format
 * [`parseFileIndex()`](#api-parse-file-index) – Read `.xz` file metadata
 * [`parseFileIndexFD()`](#api-parse-file-index-fd) – Read `.xz` metadata from a file descriptor

[Miscellaneous functions](#api-functions)
 * [`crc32()`](#api-crc32) – Calculate CRC32 checksum
 * [`checkSize()`](#api-check-size) – Return required size for specific checksum type
 * [`easyDecoderMemusage()`](#api-easy-decoder-memusage) – Expected memory usage
 * [`easyEncoderMemusage()`](#api-easy-encoder-memusage) – Expected memory usage
 * [`rawDecoderMemusage()`](#api-raw-decoder-memusage) – Expected memory usage
 * [`rawEncoderMemusage()`](#api-raw-encoder-memusage) – Expected memory usage
 * [`versionString()`](#api-version-string) – Native library version string
 * [`versionNumber()`](#api-version-number) – Native library numerical version identifier

[Internals](#api-internals)
 * [`setPromiseAPI()`](#api-set-promise-api) – Set (or unset) the `Promise` API

<a name="api-encoding-buffers"></a>
### Encoding strings and Buffer objects

<a name="api-compress"></a>
<a name="api-decompress"></a>
#### `lzma.compress()`, `lzma.decompress()`
`lzma.compress(string, [opt, ]on_finish)`
`lzma.decompress(string, [opt, ]on_finish)`

Param        |  Type            |  Description
------------ | ---------------- | --------------
`string`     | Buffer / String  | Any string or buffer to be (de)compressed (that can be passed to `stream.end(…)`)
[`opt`]      | Options / int    | Optional. See [options](#api-options)
`on_finish`  | Callback         | Will be invoked with the resulting Buffer as the first parameter when encoding is finished, and as `on_finish(null, err)` in case of an error.

If promises are available, a promise will be returned.

Example code:
<!-- runtest:{Compress and decompress directly} -->

```js
lzma.compress('Bananas', 9, function(result) {
    lzma.decompress(result, function(decompressedResult) {
        assert.equal(decompressedResult.toString(), 'Bananas');
    });
});
```

<a name="api-q-compress-examle"></a>
Example code for promises:
<!-- runtest:{Compress and decompress directly using promises} -->

```js
lzma.compress('Bananas', 9).then(function(result) {
    return lzma.decompress(result);
}).then(function(decompressedResult) {
    assert.equal(decompressedResult.toString(), 'Bananas');
}).catch(function(err) {
    // ...
});
```

<a name="api-LZMA_compress"></a>
<a name="api-LZMA_decompress"></a>
#### `lzma.LZMA().compress()`, `lzma.LZMA().decompress()`
`lzma.LZMA().compress(string, mode, on_finish[, on_progress])`
`lzma.LZMA().decompress(string, on_finish[, on_progress])`

(Compatibility; See [LZMA-JS][LZMA-JS] for the original specs.)

**Note that the result of compression is in the older LZMA1 format (`.lzma` files).**
This is different from the more universally used LZMA2 format (`.xz` files) and you will
have to take care of possible compatibility issues with systems expecting `.xz` files.

Param         |  Type                   |  Description
------------- | ----------------------- | --------------
`string`      | Buffer / String / Array | Any string, buffer, or array of integers or typed integers (e.g. `Uint8Array`)
`mode`        | int                     | [A number between 0 and 9](#api-options-preset), indicating compression level
`on_finish`   | Callback                | Will be invoked with the resulting Buffer as the first parameter when encoding is finished, and as `on_finish(null, err)` in case of an error.
`on_progress` | Callback                | Indicates progress by passing a number in [0.0, 1.0]. Currently, this package only invokes the callback with 0.0 and 1.0.

If promises are available, a promise will be returned.

This does not work exactly as described in the original [LZMA-JS][LZMA-JS] specification:
 * The results are `Buffer` objects, not integer arrays. This just makes a lot
   more sense in a Node.js environment.
 * `on_progress` is currently only called with `0.0` and `1.0`.

Example code:
<!-- runtest:{Compress and decompress directly using LZMA-JS compatibility} -->

```js
lzma.LZMA().compress('Bananas', 4, function(result) {
    lzma.LZMA().decompress(result, function(decompressedResult) {
        assert.equal(decompressedResult.toString(), 'Bananas');
    });
});
```

For an example using promises, see [`compress()`](#api-q-compress-examle).

<a name="api-creating-streams"></a>
### Creating streams for encoding

<a name="api-create-compressor"></a>
<a name="api-create-decompressor"></a>
#### `lzma.createCompressor()`, `lzma.createDecompressor()`
`lzma.createCompressor([options])`
`lzma.createDecompressor([options])`

Param       |  Type            |  Description
----------- | ---------------- | --------------
[`options`] | Options / int    | Optional. See [options](#api-options)

Return a [duplex][duplex] stream, i.e. a both readable and writable stream.
Input will be read, (de)compressed and written out. You can use this to pipe
input through this stream, i.e. to mimick the `xz` command line util, you can write:

<!-- runtest:{Compress and decompress using streams} -->

```js
var compressor = lzma.createCompressor();

process.stdin.pipe(compressor).pipe(process.stdout);
```

The output of compression will be in LZMA2 format (`.xz` files), while decompression
will accept either format via automatic detection.

<a name="api-robey_compressor"></a>
<a name="api-robey_decompressor"></a>
#### `lzma.Compressor()`, `lzma.Decompressor()`
`lzma.Compressor([preset], [options])`
`lzma.Decompressor([options])`

(Compatibility; See [node-xz][node-xz] for the original specs.)

These methods handle the `.xz` file format.

Param       |  Type            |  Description
----------- | ---------------- | --------------
[`preset`]  | int              | Optional. See [options.preset](#api-options-preset)
[`options`] | Options          | Optional. See [options](#api-options)

Return a [duplex][duplex] stream, i.e. a both readable and writable stream.
Input will be read, (de)compressed and written out. You can use this to pipe
input through this stream, i.e. to mimick the `xz` command line util, you can write:

<!-- runtest:{Compress and decompress using streams with node-xz compatibility} -->

```js
var compressor = lzma.Compressor();

process.stdin.pipe(compressor).pipe(process.stdout);
```

<a name="api-create-stream"></a>
#### `lzma.createStream()`
`lzma.createStream(coder, options)`

Param       |  Type            |  Description
----------- | ---------------- | --------------
[`coder`]   | string           | Any of the [supported coder names](#api-coders), e.g. `"easyEncoder"` (default) or `"autoDecoder"`.
[`options`] | Options / int    | Optional. See [options](#api-options)

Return a [duplex][duplex] stream for (de-)compression. You can use this to pipe
input through this stream.

<a name="#api-coders"></a>
The available coders are (the most interesting ones first):

* `easyEncoder` 
  Standard LZMA2 ([`.xz` file format](https://en.wikipedia.org/wiki/.xz)) encoder.
  Supports [`options.preset`](#api-options-preset) and [`options.check`](#api-options-check) options.
* `autoDecoder`
  Standard LZMA1/2 (both `.xz` and `.lzma`) decoder with auto detection of file format.
  Supports [`options.memlimit`](#api-options-memlimit) and [`options.flags`](#api-options-flags) options.
* `aloneEncoder`
  Encoder which only uses the legacy `.lzma` format.
  Supports the whole range of [LZMA options](#api-options-lzma).

Less likely to be of interest to you, but also available:

* `aloneDecoder`
  Decoder which only uses the legacy `.lzma` format.
  Supports the [`options.memlimit`](#api-options-memlimit) option.
* `rawEncoder`
  Custom encoder corresponding to `lzma_raw_encoder` (See the native library docs for details).
  Supports the [`options.filters`](#api-options-filters) option.
* `rawDecoder`
  Custom decoder corresponding to `lzma_raw_decoder` (See the native library docs for details).
  Supports the [`options.filters`](#api-options-filters) option.
* `streamEncoder`
  Custom encoder corresponding to `lzma_stream_encoder` (See the native library docs for details).
  Supports [`options.filters`](#api-options-filters) and [`options.check`](#api-options-check) options.
* `streamDecoder`
  Custom decoder corresponding to `lzma_stream_decoder` (See the native library docs for details).
  Supports [`options.memlimit`](#api-options-memlimit) and [`options.flags`](#api-options-flags) options.

<a name="api-options"></a>
#### Options

<a name="api-options-check"></a>
<a name="api-options-memlimit"></a>
<a name="api-options-preset"></a>
<a name="api-options-flags"></a>
<a name="api-options-synchronous"></a>

Option name   |  Type      |  Description
------------- | ---------- | -------------
`check`       | check      |  Any of `lzma.CHECK_CRC32`, `lzma.CHECK_CRC64`, `lzma.CHECK_NONE`, `lzma.CHECK_SHA256`
`memlimit`    | float      |  A memory limit for (de-)compression in bytes 
`preset`      | int        |  A number from 0 to 9, 0 being the fastest and weakest compression, 9 the slowest and highest compression level. (Please also see the [xz(1) manpage][xz-manpage] for notes – don’t just blindly use 9!) You can also OR this with `lzma.PRESET_EXTREME` (the `-e` option to the `xz` command line utility).
`flags`       | int        |  A bitwise or of `lzma.LZMA_TELL_NO_CHECK`, `lzma.LZMA_TELL_UNSUPPORTED_CHECK`, `lzma.LZMA_TELL_ANY_CHECK`, `lzma.LZMA_CONCATENATED`
`synchronous` | bool       |  If true, forces synchronous coding (i.e. no usage of threading)
`bufsize`     | int        |  The default size for allocated buffers
`threads`     | int        |  Set to an integer to use liblzma’s multi-threading support. 0 will choose the number of CPU cores.
`blockSize`   | int        |  Maximum uncompressed size of a block in multi-threading mode
`timeout`     | int        |  Timeout for a single encoding operation in multi-threading mode

<a name="api-options-filters"></a>
`options.filters` can, if the coder supports it, be an array of filter objects, each with the following properties:

* `.id`
  Any of `lzma.FILTERS_MAX`, `lzma.FILTER_ARM`, `lzma.FILTER_ARMTHUMB`, `lzma.FILTER_IA64`,
  `lzma.FILTER_POWERPC`, `lzma.FILTER_SPARC`, `lzma.FILTER_X86` or
  `lzma.FILTER_DELTA`, `lzma.FILTER_LZMA1`, `lzma.FILTER_LZMA2`

The delta filter supports the additional option `.dist` for a distance between bytes (see the [xz(1) manpage][xz-manpage]).

<a name="api-options-lzma"></a>
The LZMA filter supports the additional options `.dict_size`, `.lp`, `.lc`, `pb`, `.mode`, `nice_len`, `.mf`, `.depth`
and `.preset`. See the [xz(1) manpage][xz-manpage] for meaning of these parameters and additional information.

<a name="api-functions"></a>
### Miscellaneous functions

<a name="api-crc32"></a>
#### `lzma.crc32()`
`lzma.crc32(input[, encoding[, previous]])`

Compute the CRC32 checksum of a Buffer or string.

Param        |  Type            |  Description
------------ | ---------------- | --------------
`input`      | string / Buffer  | Any string or Buffer.
[`encoding`] | string           | Optional. If `input` is a string, an encoding to use when converting into binary.
[`previous`] | int              | The result of a previous CRC32 calculation so that you can compute the checksum per each chunk

Example usage:
<!-- runtest:{Compute the CRC32 of a string} -->

```js
lzma.crc32('Banana') // => 69690105
```

<a name="api-check-size"></a>
#### `lzma.checkSize()`
`lzma.checkSize(check)`

Return the byte size of a check sum.

Param        |  Type            |  Description
------------ | ---------------- | --------------
`check`      | check            | Any supported check constant.

Example usage:
<!-- runtest:{Calculate some check sizes} -->

```js
lzma.checkSize(lzma.CHECK_SHA256) // => 16
lzma.checkSize(lzma.CHECK_CRC32)  // => 4
```

<a name="api-easy-decoder-memusage"></a>
#### `lzma.easyDecoderMemusage()`
`lzma.easyDecoderMemusage(preset)`

Returns the approximate memory usage when decoding using easyDecoder for a given preset.

Param        |  Type       |  Description
------------ | ----------- | --------------
`preset`     | preset      |  A compression level from 0 to 9

Example usage:
<!-- runtest:{Return memory usage for decoding} -->

```js
lzma.easyDecoderMemusage(6) // => 8454192
```

<a name="api-easy-encoder-memusage"></a>
#### `lzma.easyEncoderMemusage()`
`lzma.easyEncoderMemusage(preset)`

Returns the approximate memory usage when encoding using easyEncoder for a given preset.

Param        |  Type       |  Description
------------ | ----------- | --------------
`preset`     | preset      |  A compression level from 0 to 9

Example usage:
<!-- runtest:{Return memory usage for encoding} -->

```js
lzma.easyEncoderMemusage(6) // => 97620499
```

<a name="api-raw-decoder-memusage"></a>
#### `lzma.rawDecoderMemusage()`
`lzma.rawDecoderMemusage(filters)`

Returns the approximate memory usage when decoding using rawDecoder for a given filter list.

Param        |  Type       |  Description
------------ | ----------- | --------------
`filters`    | array       |  An array of [filters](#api-options-filters)

<a name="api-raw-encoder-memusage"></a>
#### `lzma.rawEncoderMemusage()`
`lzma.rawEncoderMemusage(filters)`

Returns the approximate memory usage when encoding using rawEncoder for a given filter list.

Param        |  Type       |  Description
------------ | ----------- | --------------
`filters`    | array       |  An array of [filters](#api-options-filters)

<a name="api-version-string"></a>
#### `lzma.versionString()`
`lzma.versionString()`

Returns the version of the underlying C library.

Example usage:
<!-- runtest:{Return a version string} -->

```js
lzma.versionString() // => '5.2.1'
```

<a name="api-version-number"></a>
#### `lzma.versionNumber()`
`lzma.versionNumber()`

Returns the version of the underlying C library.

Example usage:
<!-- runtest:{Return a numeric version identifier} -->

```js
lzma.versionNumber() // => 50020012
```

<a name="api-parse-indexes"></a>
### .xz file metadata

<a name="api-isxz"></a>
#### `lzma.isXZ()`
`lzma.isXZ(input)`

Tells whether an input buffer is an XZ file (`.xz`, LZMA2 format) using the
file format’s magic number. This is not a complete test, i.e. the data
following the file header may still be invalid in some way.

Param        |  Type            |  Description
------------ | ---------------- | --------------
`input`      | string / Buffer  | Any string or Buffer (integer arrays accepted).

Example usage:
<!-- runtest:{.isXZ() checks some strings correctly} -->

```js
lzma.isXZ(fs.readFileSync('test/hamlet.txt.xz')); // => true
lzma.isXZ(fs.readFileSync('test/hamlet.txt.lzma')); // => false
lzma.isXZ('Banana'); // => false
```

(The magic number of XZ files is hex `fd 37 7a 58 5a 00` at position 0.)

<a name="api-parse-file-index"></a>
#### `lzma.parseFileIndex()`
`lzma.parseFileIndex(options[, callback])`

Read `.xz` file metadata.

`options.fileSize` needs to be an integer indicating the size of the file
being inspected, e.g. obtained by `fs.stat()`.

`options.read(count, offset, cb)` must be a function that reads `count` bytes
from the underlying file, starting at position `offset`. If that is not
possible, e.g. because the file does not have enough bytes, the file should
be considered corrupt. On success, `cb` should be called with a `Buffer`
containing the read data. `cb` can be invoked as `cb(err, buffer)`, in which
case `err` will be passed along to the original `callback` argument when set.

`callback` will be called with `err` and `info` as its arguments.

If no `callback` is provided, `options.read()` must work synchronously and
the file info will be returned from `lzma.parseFileIndex()`.

Example usage:
<!-- runtest:{Read .xz file metadata} -->

```js
fs.readFile('test/hamlet.txt.xz', function(err, content) {
  // handle error

  lzma.parseFileIndex({
    fileSize: content.length,
    read: function(count, offset, cb) {
      cb(content.slice(offset, offset + count));
    }
  }, function(err, info) {
    // handle error
    
    // do something with e.g. info.uncompressedSize
  });
});
```

<a name="api-parse-file-index-fd"></a>
#### `lzma.parseFileIndexFD()`
`lzma.parseFileIndexFD(fd, callback)`

Read `.xz` metadata from a file descriptor.

This is like [`parseFileIndex()`](#api-parse-file-index), but lets you 
pass an file descriptor in `fd`. The file will be inspected using
`fs.stat()` and `fs.read()`. The file descriptor will not be opened or closed
by this call.

Example usage:
<!-- runtest:{Read .xz file metadata from a file descriptor} -->

```js
fs.open('test/hamlet.txt.xz', 'r', function(err, fd) {
  // handle error

  lzma.parseFileIndexFD(fd, function(err, info) {
    // handle error
    
    // do something with e.g. info.uncompressedSize
    
    fs.close(fd, function(err) { /* handle error */ });
  });
});
```


<a name="api-internals"></a>
### Internals

<a name="api-set-promise-api"></a>
#### `lzma.setPromiseAPI()`
`lzma.setPromiseAPI([api])`

Set the used `Promise` API for the methods that encode/decode single strings
of buffers in one run. You can pass in `null` to remove promise support
and `'default'` to reset everything to auto-detection using 
[any-promise](https://www.npmjs.com/package/any-promise).

The previous value will be returned; Passing no parameters will result in
no change, i.e. can be used to test for availability of promises.

Example usage:
<!-- runtest:{Set the promise API} -->

```js
lzma.setPromiseAPI() // => [Function: Promise] or similar

var Q = require('q');
lzma.setPromiseAPI(Q); // => old value, e.g. [Function: Promise]
lzma.setPromiseAPI(); // => Q
lzma.setPromiseAPI(null); // disable promises, return Q again
lzma.setPromiseAPI('default'); // back to square 1
```

Note: This module uses the ES6 Promise API by default, which can be found
in all Node.js versions `>= 0.12`. If no global `Promise` object is detected,
but [Q][Q] is somewhere in your `node_modules`, it will be used; Otherwise,
promises are not available by default.

## Installation

This package includes the native C library, so there is no need to install it separately.

## Licensing

The original C library package contains code under various licenses,
with its core (liblzma) being public domain. See its contents for details.
This wrapper is licensed under the MIT License.

## Related projects

Other implementations of the LZMA algorithms for node.js and/or web clients include:

* [lzma-purejs](https://github.com/cscott/lzma-purejs)
* [LZMA-JS](https://github.com/nmrugg/LZMA-JS)
* [node-xz](https://github.com/robey/node-xz) (native)
* [node-liblzma](https://github.com/oorabona/node-liblzma) (native)

Note that LZMA has been designed to have much faster decompression than
compression, which is something you may want to take into account when
choosing an compression algorithm for large files. Almost always, LZMA achieves
higher compression ratios than other algorithms, though.

## Acknowledgements

Initial development of this project was financially supported by [Tradity](https://tradity.de/).

[node-xz]: https://github.com/robey/node-xz
[LZMA-JS]: https://github.com/nmrugg/LZMA-JS
[Q]: https://github.com/kriskowal/q
[duplex]: https://nodejs.org/api/stream.html#stream_class_stream_duplex
[xz-manpage]: https://www.freebsd.org/cgi/man.cgi?query=xz&sektion=1&manpath=FreeBSD+8.3-RELEASE
