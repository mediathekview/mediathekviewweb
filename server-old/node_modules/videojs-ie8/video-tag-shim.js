/**
 * HTML5 Element Shim for IE8
 *
 * **THIS CODE MUST BE LOADED IN THE <HEAD> OF THE DOCUMENT**
 *
 * Video.js uses the video tag as an embed code, even in IE8 which
 * doesn't have support for HTML5 video. The following code is needed
 * to make it possible to use the video tag. Otherwise IE8 ignores everything
 * inside the video tag.
 */
if (typeof window.HTMLVideoElement === 'undefined') {
  document.createElement('video');
  document.createElement('audio');
  document.createElement('track');
}
