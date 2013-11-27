'use strict';

var helper = require('../helper');
var ensureFullCommit = require('../../../lib/replicate/ensure-full-commit');

exports.ensureFullCommit = {
  setUp: helper.setUp,
  tearDown: helper.tearDown,

  'basics': function(test) {
    ensureFullCommit(this.options, function(err, response) {
      test.ok(!err, 'no error should have been occured');
      test.ok(response.ok, 'response should be ok');
      test.done();
    });
  }
};
