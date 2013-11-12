'use strict';

var helper = require('./test_helper.js');

exports.doc_ids = helper.test({
  'basic doc ids': function(test) {
    var source = this.source;
    var target = this.target;
    var roy = this.roy;

    helper.createDocs(source, 4, function() {
      roy.replicate({
        source: source,
        target: target,
        doc_ids: ['1', '2']
      }, function(err, resp) {
        test.ok(!err, 'no error should have been occured');
        test.ok(resp.ok, 'replication was ok');
        test.equal(resp.history[0].docs_written, 2, 'correct # of docs were written');
        test.done();
      });
    });
  }
});
