/**
 * A Node.js wrapper for the Piwik (http://piwik.org) tracking HTTP API
 * https://github.com/fhemberger/piwik-tracker
 *
 * @author  Frederic Hemberger
 * @license MIT
 */

'use strict';

const assert = require('assert');
const events = require('events');
const util   = require('util');
const qs     = require('querystring');

let agent;


/**
 * @constructor
 * @param {Number} siteId     Id of the site you want to track
 * @param {String} trackerUrl URL of your Piwik instance
 */
function PiwikTracker (siteId, trackerUrl) {
  if (!(this instanceof PiwikTracker)) { return new PiwikTracker(siteId, trackerUrl); }
  events.EventEmitter.call(this);

  assert.ok(siteId && !isNaN(siteId), 'Piwik siteId required.');
  assert.ok(trackerUrl && typeof trackerUrl == 'string', 'Piwik tracker URL required, e.g. http://example.com/piwik.php')
  assert.ok(trackerUrl.endsWith('piwik.php'), 'A tracker URL must end with "piwik.php"')

  this.siteId = siteId;
  this.trackerUrl = trackerUrl;

  // Use either HTTPS or HTTP agent according to Piwik tracker URL
  agent = require( trackerUrl.startsWith('https') ? 'https' : 'http' );
}
util.inherits(PiwikTracker, events.EventEmitter);


/**
 * Executes the call to the Piwik tracking API
 *
 * For a list of tracking option parameters see
 * http://developer.piwik.org/api-reference/tracking-api
 *
 * @param {(String|Object)} URL to track or options (must contain URL as well)
 */
PiwikTracker.prototype.track = function track (options) {
  var hasErrorListeners = this.listeners('error').length;

  if (typeof options === 'string') {
    options = { url: options };
  }

  // Set mandatory options
  options = options || {};
  options.idsite = this.siteId;
  options.rec = 1;

  assert.ok(options.url, 'URL to be tracked must be specified.');

  var requestUrl = this.trackerUrl + '?' + qs.stringify(options);
  var req = agent.get(requestUrl, (res) => {
    // Check HTTP statuscode for 200 and 30x
    if ( !/^(200|30[12478])$/.test(res.statusCode) ) {
      if (hasErrorListeners) { this.emit('error', res.statusCode); }
    }
  });

  req.on('error', (err) => hasErrorListeners && this.emit('error', err.message));

  req.end();
};


module.exports = PiwikTracker;
