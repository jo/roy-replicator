'use strict';

var helper = require('../helper');
var recordReplicationCheckpoint = require('../../../lib/replicate/record-replication-checkpoint');

exports.uploadDocuments = {
  setUp: helper.setUp,
  tearDown: helper.tearDown,

  'basics': function(test) {
    var state = {};

    recordReplicationCheckpoint(this.options, {}, state, function(err, response) {
      test.ok(!err, 'no error should have been occured');
      test.ok(response.ok, 'response should be ok');
      test.done();
    });
  }
  
  // TODO: add more tests
};
