'use strict';

var Test = require('segmentio-integration-tester');
var time = require('unix-time');
var helpers = require('./helpers');
var Librato = require('..');

describe('Librato', function() {
  var settings;
  var librato;
  var test;

  beforeEach(function() {
    settings = {
      email: 'tools+librato@segment.com',
      token: '331436d2a5ed2b3cf8239f13dc1e5e5fe7400a852be8336d130c478864acf725'
    };
    librato = new Librato(settings);
    test = Test(librato, __dirname);
  });

  it('should have correct settings', function() {
    test
      .name('Librato')
      .endpoint('https://metrics-api.librato.com/v1')
      .channels(['server', 'client', 'mobile'])
      .ensure('settings.token')
      .ensure('settings.email');
  });

  describe('.validate()', function() {
    var identify = helpers.identify();

    it('should not validate settings without an email', function() {
      test.invalid(identify, {});
      test.invalid(identify, { token: 'x' });
    });

    it('should not validate messages without a token', function() {
      test.invalid(identify, { email: 'x' });
    });

    it('should validate proper identify calls', function() {
      test.valid(identify, { email: 'x', token: 'y' });
    });
  });

  describe('mapper', function() {
    describe('track', function() {
      it('should map basic track', function() {
        test.maps('track-basic');
      });

      it('should fallback value to 1 and source to .event', function() {
        test.maps('track-fallback');
      });

      it('should fallback to options.source', function() {
        test.maps('track-source');
      });

      it('should fallback to context.source', function() {
        test.maps('track-context-source');
      });
    });

    describe('page', function() {
      it('should map basic page', function() {
        test.maps('page-basic');
      });
      it('should map named page', function() {
        test.maps('page-name');
      });
    });
  });

  describe('.track()', function() {
    var track = helpers.track();

    it('should track successfully', function(done) {
      var event = librato.mapper.clean(track.event());
      test
        .set(settings)
        .track(track)
        .sends({
          gauges: [{
            name: event,
            value: 1,
            measure_time: time(track.timestamp()),
            source: event
          }]
        })
        .expects(200)
        .end(done);
    });

    it('defaults to reporting a 1', function() {
      var result = librato.mapper.track(track);
      result.value.should.equal(1);
    });

    it('allows reporting zeroes', function() {
      var result = librato.mapper.track.call(librato, helpers.track({
        properties: {
          value: 0
        }
      }));
      result.value.should.equal(0);
    });

    it('should error on invalid keys', function(done) {
      test
        .set({ token: 'x' })
        .track({ event: 'some-event' })
        .error('cannot POST /v1/metrics (401)', done);
    });
  });

  describe('.page()', function() {
    var page = helpers.page();

    it('should send page successfully', function(done) {
      var event = librato.mapper.clean(page.track(page.fullName()).event());
      test
        .set(settings)
        .page(page)
        .sends({
          gauges: [{
            name: event,
            value: 1,
            measure_time: time(page.timestamp()),
            source: event
          }]
        })
        .expects(200)
        .end(done);
    });

    it('should error on invalid keys', function(done) {
      test
        .set({ token: 'x' })
        .page({ name: 'some-page' })
        .error('cannot POST /v1/metrics (401)', done);
    });
  });
});
