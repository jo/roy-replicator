'use strict';

var helper = require('./test_helper.js');
var roy = require('../roy.js');

exports['deleted docs'] = {
  setUp: helper.setUp,

  'replicate a deleted doc': function(test) {
    test.expect(4);

    var source = this.source;
    var target = this.target;

    helper.createDocs(source, 2, function() {
      source.insert({ _id: '3', i: 3, _deleted: true }, function() {
        roy.replicate({
          source: source,
          target: target
        }, function(err, resp) {
          test.ok(!err, 'no error should have been occured');
          test.ok(resp.ok, 'replication was ok');
          test.equal(resp.docs_written, 3, 'correct # of docs were written');
          source.list(function(err, resp) {
            test.equal(resp.rows.length, 2, 'correct # of docs exist');
            test.done();
          });
        });
      });
    });
  }
};
