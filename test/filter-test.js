'use strict';

var helper = require('./helper.js');

exports.filter = helper.test({
  'basic filter': function(test) {
    var options = this.options;
    var roy = this.roy;

    var ddoc = {
      _id: '_design/myfilter',
      filters: {
        even: 'function(doc) { return doc.i % 2 === 0; }'
      }
    };

    helper.request.post(options.source.id(), { body: ddoc }, function() {
      helper.createDocs(options.source, 4, function() {
        roy.replicate({
          source: options.source,
          target: options.target,
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
