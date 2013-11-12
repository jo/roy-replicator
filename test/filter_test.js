'use strict';

var helper = require('./test_helper.js');

exports.filter = helper.test({
  'basic filter': function(test) {
    var source = this.source;
    var target = this.target;
    var roy = this.roy;

    var ddoc = {
      _id: '_design/myfilter',
      filters: {
        even: 'function(doc) { return doc.i % 2 === 0; }'
      }
    };
    source.insert(ddoc, function() {
      helper.createDocs(source, 4, function() {
        roy.replicate({
          source: source,
          target: target,
          filter: 'myfilter/even'
        }, function(err, resp) {
          test.ok(!err, 'no error should have been occured');
          test.ok(resp.ok, 'replication was ok');
          test.equal(resp.history[0].docs_written, 2, 'correct # of docs were written');
          test.done();
        });
      });
    });
  }
});
