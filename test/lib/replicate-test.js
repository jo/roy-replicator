'use strict';

var helper = require('./helper');
var replicate = require('../../lib/replicate');

exports.replicate = {
  setUp: helper.setUp,
  tearDown: helper.tearDown,

  'basics': function(test) {
    replicate(this.options, function(err, response) {
      test.ok(!err, 'no error should have been occured');
      test.ok(response.ok, 'response should be ok');
      test.done();
    });
  }

  // TODO: add more tests
};
