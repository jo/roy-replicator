'use strict';

var helper = require('./helper.js');

exports.response = helper.test({
  'no changes': function(test) {
    this.roy.replicate(this.options, function(err, response) {
      test.ok(!err, 'no error should have been occured');
      test.ok(response.ok, 'response should be ok');
      test.ok(response.no_changes, 'response should have no changes');
      test.done();
    });
  },

  'one change': function(test) {
    var options = this.options;
    var roy = this.roy;

    helper.createDocs(options.source, 1, function() {
      roy.replicate(options, function(err, response) {
        test.ok(!err, 'no error should have been occured');
        test.ok(response.ok, 'response should be ok');
        test.equal(typeof response.session_id, 'string', 'resp should have a "session_id" of type string');
        test.equal(typeof response.replication_id_version, 'number', 'response should have a "replication_id_version" of type number');
        test.equal(typeof response.history, 'object', 'response should have a "history" of type object');
        test.equal(response.history.length, 1, '"history" should have length of "1"');
        var result = response.history[0];
        test.equal(parseInt(result.end_last_seq, 10), 1, '"end_last_seq" should be "1"');
        test.equal(parseInt(result.recorded_seq, 10), 1, '"recorded_seq" should be "1"');
        test.equal(typeof result.missing_checked, 'number', 'result should have a "missing_checked" of type number');
        test.equal(result.missing_checked, 1, '"missing_checked" should be "1"');
        test.equal(typeof result.missing_found, 'number', 'result should have a "missing_found" of type number');
        test.equal(result.missing_found, 1, '"missing_found" should be "1"');
        test.equal(typeof result.docs_read, 'number', 'result should have a "docs_read" of type number');
        test.equal(result.docs_read, 1, '"docs_read" should be "1"');
        test.equal(typeof result.docs_written, 'number', 'result should have a "docs_written" of type number');
        test.equal(result.docs_written, 1, '"docs_written" should be "1"');
        test.equal(typeof result.doc_write_failures, 'number', 'result should have a "doc_write_failures" of type number');
        test.equal(result.doc_write_failures, 0, '"doc_write_failures" should be "0"');
        test.done();
      });
    });
  }
});

exports.basics = helper.test({
  'no changes': function(test) {
    var options = this.options;
    var roy = this.roy;

    helper.createDocs(options.source, 3, function() {
      roy.replicate(options, function(err, response) {
        test.ok(!err, 'no error should have been occured');
        test.ok(response.ok, 'response should be ok');
        test.equal(response.history[0].docs_written, 3, 'correct # docs written');
        helper.request.get(options.source.id() + '/_all_docs', function(err, _, result) {
          test.equal(result.rows.length, 3, 'correct # docs exist');
          test.done();
        });
      });
    });
  },

  'target database contains documents': function(test) {
    var options = this.options;
    var roy = this.roy;

    helper.createDocs(options.source, 3, function() {
      helper.createDocs(options.target, 3, function() {
        roy.replicate(options, function(err, response) {
          test.ok(!err, 'no error should have been occured');
          test.ok(response.ok, 'resp should be ok');
          test.equal(response.history[0].docs_written, 0, 'no docs written');
          helper.request.get(options.source.id() + '/_all_docs', function(err, _, result) {
            test.equal(result.rows.length, 3, 'correct # docs exist');
            test.done();
          });
        });
      });
    });
  }
});
