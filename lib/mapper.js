'use strict';

/**
 * Module dependencies.
 */

var time = require('unix-time');
var get = require('obj-case');

/**
 * Map track.
 *
 * @param {Track} track
 * @return {Object}
 * @api private
 */

var track = exports.track = function(track) {
  var event = exports.clean(track.event());
  var opts = track.options();
  return {
    name: event,
    value: track.value() == null ? 1 : track.value(),
    measure_time: time(track.timestamp()),
    source: track.options(this.name).source
      || get(opts, 'source')
      || event
  };
};


/**
 * Map page.
 *
 * @param {Page} page
 * @return {Object}
 * @api private
 */

exports.page = function(page) {
  var name = page.fullName();
  if (name) { return track.call(this, page.track(name)); }
  return track.call(this, page.track());
};

/**
 * Clean event for librato.
 *
 * @param {String} event
 * @return {String}
 * @api private
 */

exports.clean = function(event) {
  return event
    .replace(/[^a-z0-9._-]/gi, '-')
    .substring(0, 255);
};
