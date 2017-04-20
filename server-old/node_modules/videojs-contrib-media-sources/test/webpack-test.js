/* eslint-disable no-var */
/* eslint-env qunit */
var mediaSources = require('../es5/videojs-contrib-media-sources.js');
var q = window.QUnit;

q.module('Webpack Require');
q.test('mediaSources should be requirable and bundled via webpack', function(assert) {
  assert.ok(mediaSources, 'videojs-contrib-media-sources is required properly');
});
