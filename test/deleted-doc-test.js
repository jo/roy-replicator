'use strict';

var helper = require('./helper.js');

exports['deleted docs'] = helper.test({
  'replicate a deleted doc': function(test) {
    var options = this.options;
    var roy = this.roy;

    var doc = { _id: '3', i: 3, _deleted: true };

    helper.createDocs(options.source, 2, function() {
      helper.request.post(options.source.id(), { body: doc }, function() {
        roy.replicate(options, function(err, resp) {
          test.ok(!err, 'no error should have been occured');
          test.ok(resp.ok, 'replication was ok');
          test.equal(resp.history[0].docs_written, 3, 'correct # of docs were written');
          helper.request.get(options.source.id() + '/_all_docs', function(err, _, resp) {
            test.equal(resp.rows.length, 2, 'correct # of docs exist');
            test.done();
          });
        });
      });
    });
  }
});
