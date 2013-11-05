'use strict';

var helper = require('./test_helper.js');
var roy = require('../roy.js');

exports.basic = {
  setUp: helper.setUp,

  'basic replication': function(test) {
    test.expect(4);

    var source = this.source;
    var target = this.target;

    helper.createDocs(source, 3, function() {
      roy.replicate({ source: source, target: target }, function(err, resp) {
        test.ok(!err, 'no error should have been occured');
        test.ok(resp.ok, 'resp should be ok');
        test.equal(resp.docs_written, 3, 'correct # docs written');
        target.list(function(err, result) {
          test.equal(result.rows.length, 3, 'correct # docs exist');
          test.done();
        });
      });
    });
  },

  'target database contains documents': function(test) {
    test.expect(4);

    var source = this.source;
    var target = this.target;

    helper.createDocs(source, 3, function() {
      helper.createDocs(target, 3, function() {
        roy.replicate({ source: source, target: target }, function(err, resp) {
          test.ok(!err, 'no error should have been occured');
          test.ok(resp.ok, 'resp should be ok');
          test.equal(resp.docs_written, 0, 'no docs written');
          target.list(function(err, result) {
            test.equal(result.rows.length, 3, 'correct # docs exist');
            test.done();
          });
        });
      });
    });
  }
};
