'use strict';

var helper = require('./helper.js');

exports.checkpoint = helper.test({
  'basic checkpoint': function(test) {
    var options = this.options;
    var roy = this.roy;

    helper.createDocs(options.source, 3, function() {
      roy.replicate(options, function(err, response) {
        test.ok(!err, 'no error should have been occured');
        test.ok(response.ok, 'replication was ok');
        test.equal(response.history[0].docs_read, 3, 'correct # changed docs read on first replication');
        test.equal(response.history[0].docs_written, 3, 'correct # docs written');
        roy.replicate(options, function(err, response) {
          test.ok(!err, 'no error should have been occured');
          test.ok(response.ok, 'replication was ok');
          test.ok(response.no_changes, 'replication had no changes');
          test.done();
        });
      });
    });
  },

  'checkpoint with many updates': function(test) {
    var options = this.options;
    var roy = this.roy;

    var doc = { _id: 'mydoc', count: 0 };

    helper.request.post(options.source.id(), { body: doc }, function(err, _, response) {
      doc._rev = response.rev;
      doc.count++;
      roy.replicate(options, function(err, response) {
        test.ok(!err, 'no error should have been occured');
        test.ok(response.ok, 'replication was ok');
        helper.request.post(options.source.id(), { body: doc }, function(err, _, response) {
          doc._rev = response.rev;
          doc.count++;
          helper.request.post(options.source.id(), { body: doc }, function() {
            roy.replicate(options, function(err, response) {
              test.ok(!err, 'no error should have been occured');
              test.ok(response.ok, 'replication was ok');
              test.equal(response.history[0].docs_written, 1, 'correct # docs written');
              helper.request.get(options.target.id() + '/_all_docs', function(err, _, response) {
                test.equal(response.rows.length, 1, 'correct # docs exist');
                test.done();
              });
            });
          });
        });
      });
    });
  },

  'checkpoint after deletion': function(test) {
    var options = this.options;
    var roy = this.roy;

    helper.createDocs(options.source, 1, function() {
      roy.replicate(options, function() {
        helper.request.del(options.source.id(), function() {
          helper.request.put(options.source.id(), function() {
            helper.request.post(options.source.id(), { body: { _id: 'another', i: 2 } }, function() {
              roy.replicate(options, function(err, response) {
                test.ok(!err, 'no error should have been occured');
                test.ok(response.ok, 'replication was ok');
                test.equal(response.history[0].docs_written, 1, 'correct # of docs written');
                helper.request.get(options.target.id() + '/_all_docs', function(err, _, response) {
                  test.equal(response.rows.length, 2, 'correct # of docs exist');
                  test.done();
                });
              });
            });
          });
        });
      });
    });
  }
});
