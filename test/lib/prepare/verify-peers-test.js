'use strict';

var helper = require('../helper');
var verifyPeers = require('../../../lib/prepare/verify-peers');

exports.verifyPeers = {
  setUp: helper.setUp,
  tearDown: helper.tearDown,

  'both source and target exist': function(test) {
    verifyPeers(this.options, function(err, response) {
      test.ok(!err, 'no error should have been occured');
      test.ok(response.ok, 'response should be ok');
      test.done();
    });
  },

  'source does not exist': function(test) {
    var options = this.options;

    helper.request.del(this.dbs[0], function() {
      verifyPeers(options, function(err, response) {
        test.ok(err, 'an error should have been occured');
        test.equal(err.error, 'db_not_found', 'error should be db_not_found');
        test.equal(response, undefined, 'response should be undefined');
        test.done();
      });
    });
  },
  
  'source exists but target does not exist': {
    setUp: function(done) {
      helper.request.del(this.dbs[1], done);
    },

    'without create_target': function(test) {
      verifyPeers(this.options, function(err, response) {
        test.ok(err, 'an error should have been occured');
        test.equal(err.error, 'db_not_found', 'error should be db_not_found');
        test.equal(response, undefined, 'response should be undefined');
        test.done();
      });
    },

    'create_target: true': function(test) {
      var options = {
        source: this.options.source,
        target: this.options.target,
        create_target: true
      };

      verifyPeers(options, function(err, response) {
        test.ok(!err, 'no error should have been occured');
        test.ok(response.ok, 'response should be ok');
        test.done();
      });
    }
  }
};
