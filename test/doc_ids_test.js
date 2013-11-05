'use strict';

var helper = require('./test_helper.js');
var roy = require('../roy.js');

exports.doc_ids = {
  setUp: helper.setUp,

  'basic doc ids': function(test) {
    test.expect(3);

    var source = this.source;
    var target = this.target;

    helper.createDocs(source, 4, function() {
      roy.replicate({
        source: source,
        target: target,
        doc_ids: ['1', '2']
      }, function(err, resp) {
        test.ok(!err, 'no error should have been occured');
        test.ok(resp.ok, 'replication was ok');
        test.equal(resp.docs_written, 2, 'correct # of docs were written');
        test.done();
      });
    });
  }
};
