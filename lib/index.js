
/**
 * Module dependencies.
 */

var integration = require('segmentio-integration');
var mapper = require('./mapper');

/**
 * Expose `Librato`
 */

var Librato = module.exports = integration('Librato')
  .endpoint('https://metrics-api.librato.com/v1')
  .channels(['server', 'client', 'mobile'])
  .ensure('settings.token')
  .ensure('settings.email')
  .mapper(mapper)
  .retries(2);

/**
 * Track.
 *
 * @param {Object} payload
 * @param {Object} settings
 * @param {Function} fn
 * @api public
 */

Librato.prototype.track = function(payload, fn){
  return this
    .post('/metrics')
    .type('json')
    .auth(this.settings.email, this.settings.token)
    .send({ gauges: [payload] })
    .end(this.handle(fn));
};
