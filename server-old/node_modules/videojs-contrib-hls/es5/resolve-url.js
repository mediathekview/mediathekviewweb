/**
 * @file resolve-url.js
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _urlToolkit = require('url-toolkit');

var _urlToolkit2 = _interopRequireDefault(_urlToolkit);

var _globalWindow = require('global/window');

var _globalWindow2 = _interopRequireDefault(_globalWindow);

var resolveUrl = function resolveUrl(baseURL, relativeURL) {
  // return early if we don't need to resolve
  if (/^[a-z]+:/i.test(relativeURL)) {
    return relativeURL;
  }

  // if the base URL is relative then combine with the current location
  if (!/\/\//i.test(baseURL)) {
    baseURL = _urlToolkit2['default'].buildAbsoluteURL(_globalWindow2['default'].location.href, baseURL);
  }

  return _urlToolkit2['default'].buildAbsoluteURL(baseURL, relativeURL);
};

exports['default'] = resolveUrl;
module.exports = exports['default'];