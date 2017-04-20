# videojs-media-sources

A [Media Source Extensions](https://dvcs.w3.org/hg/html-media/raw-file/tip/media-source/media-source.html) shim for video.js.

Media Source Extensions (MSE) is a W3C draft specification that makes it possible to feed data directly to a video element.
MSE allows video developers to build functionality like adaptive streaming directly in javascript.

Lead Maintainer: Jon-Carlos Rivera [@imbcmdth](https://github.com/imbcmdth)

Maintenance Status: Stable

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Getting Started](#getting-started)
- [Options](#options)
  - [mode](#mode)
- [Release History](#release-history)
- [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->


## Getting Started

On browsers that natively support Media Source Extensions, the HTML implementation will be used.
If you're running in an environment without MSE, a Flash-backed polyfill will be used.
Currently, the Flash polyfill only supports video content encoded in the FLV file format.
For information on how FLVs are structured, Adobe hosts the [latest version of the spec](http://www.adobe.com/devnet/f4v.html) on their site.

The Flash polyfill attempts to balance throughput to the FLV with end-user responsiveness by asynchronously feeding bytes to the SWF at a fixed rate.
By default, that rate is capped at 4MB/s.
If you'd like to play higher bitrate content, you can adjust that setting:

```javascript
// 8MB/s at 60fps
videojs.MediaSource.BYTES_PER_SECOND_GOAL = 8 * 1024 * 1024;
```
Setting the `BYTES_PER_SECOND_GOAL` too high may lead to dropped frames during playback on slower computers.

Check out an example of the plugin in use in [example.html](example.html).

## Options
You can configure some aspects of the MediaSource polyfill by
specifying a hash of options when you construct it:

```js
var mediaSource = new videojs.MediaSource({ mode: 'html5' });
```

### mode
Type: `string`
Values: `'auto'`, `'html5'`, `'flash'`
Default Value: `'auto'`

How to determine the MediaSources implementation to use. With the
default value of `auto`, the presence of native MediaSources is
detected at construction time and they're used if available. Choosing
`html5` or `flash` will force the use of that respective MediaSource
implementation, even if it does not appear the browser supports it.

## Release History

 * 1.0.0: throw an error if appends are called during an update
 * 0.3.0: Delegate SourceBuffer.abort() calls to the SWF
 * 0.2.0: Improve interactivity by batching communication with Flash.
 * 0.1.0: Initial release

## License

See [LICENSE-APACHE2](LICENSE-APACHE2).
