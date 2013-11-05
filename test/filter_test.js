'use strict';

var helper = require('./test_helper.js');
var roy = require('../roy.js');

exports.filter = {
  setUp: helper.setUp,

  'basic filter': function(test) {
    test.expect(2);

    var source = this.source;
    var target = this.target;

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
          test.ok(resp.ok, 'replication was ok');
          test.equal(resp.docs_written, 2, 'correct # of docs were written');
          test.done();
        });
      });
    });
  }
};
