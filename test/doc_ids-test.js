'use strict';

var helper = require('./helper.js');

exports.doc_ids = helper.test({
  'basic doc ids': function(test) {
    var options = this.options;
    var roy = this.roy;

    helper.createDocs(options.source, 4, function() {
      roy.replicate({
        source: options.source,
        target: options.target,
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
