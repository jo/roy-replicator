'use strict';

var helper = require('../helper');
var getPeersInformaton = require('../../../lib/prepare/get-peers-information');

exports.getPeersInformaton = {
  setUp: helper.setUp,
  tearDown: helper.tearDown,

  'both source and target exist': function(test) {
    getPeersInformaton(this.options, function(err, response) {
      test.ok(!err, 'no error should have been occured');
      test.ok(response.ok, 'response should be ok');
      test.equal(typeof response.source, 'object', 'source should be an object');
      test.ok('update_seq' in response.source, 'source.update_seq should be present');
      test.equal(typeof response.target, 'object', 'target should be an object');
      test.ok('update_seq' in response.target, 'target.update_seq should be present');
      test.done();
    });
  },

  'source does not exist': {
    setUp: function(done) {
      helper.request.del(this.dbs[1], done);
    },

    'raises not_found error': function(test) {
      getPeersInformaton(this.options, function(err, response) {
        test.ok(err, 'an error should have been occured');
        test.equal(err.error, 'not_found', 'error should be not_found');
        test.equal(response, undefined, 'response should be undefined');
        test.done();
      });
    }
  }
};
