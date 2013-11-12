'use strict';

var helper = require('./test_helper.js');

exports['deleted docs'] = helper.test({
  'replicate a deleted doc': function(test) {
    var source = this.source;
    var target = this.target;
    var roy = this.roy;

    helper.createDocs(source, 2, function() {
      source.insert({ _id: '3', i: 3, _deleted: true }, function() {
        roy.replicate({ source: source, target: target }, function(err, resp) {
          test.ok(!err, 'no error should have been occured');
          test.ok(resp.ok, 'replication was ok');
          test.equal(resp.history[0].docs_written, 3, 'correct # of docs were written');
          source.list(function(err, resp) {
            test.equal(resp.rows.length, 2, 'correct # of docs exist');
            test.done();
          });
        });
      });
    });
  }
});
