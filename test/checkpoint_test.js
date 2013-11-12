'use strict';

var helper = require('./test_helper.js');

exports.checkpoint = helper.test({
  'basic checkpoint': function(test) {
    var source = this.source;
    var target = this.target;
    var roy = this.roy;

    helper.createDocs(source, 3, function() {
      roy.replicate({ source: source, target: target }, function(err, response) {
        test.ok(!err, 'no error should have been occured');
        test.ok(response.ok, 'replication was ok');
        test.equal(response.history[0].docs_read, 3, 'correct # changed docs read on first replication');
        test.equal(response.history[0].docs_written, 3, 'correct # docs written');
        roy.replicate({ source: source, target: target }, function(err, response) {
          test.ok(!err, 'no error should have been occured');
          test.ok(response.ok, 'replication was ok');
          test.ok(response.no_changes, 'replication had no changes');
          test.done();
        });
      });
    });
  },

  'checkpoint with many updates': function(test) {
    var source = this.source;
    var target = this.target;
    var roy = this.roy;

    var doc = { _id: 'mydoc', count: 0 };
    source.insert(doc, function(err, response) {
      doc._rev = response.rev;
      doc.count++;
      roy.replicate({ source: source, target: target }, function(err,
      response) {
        test.ok(!err, 'no error should have been occured');
        test.ok(response.ok, 'replication was ok');
        source.insert(doc, function(err, response) {
          doc._rev = response.rev;
          doc.count++;
          source.insert(doc, function() {
            roy.replicate({ source: source, target: target }, function(err, response) {
              test.ok(!err, 'no error should have been occured');
              test.ok(response.ok, 'replication was ok');
              // FIXME
              // test.equal(response.history[0].docs_written, 1, 'correct # docs written');
              target.list(function(err, response) {
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
    var source = this.source;
    var target = this.target;
    var roy = this.roy;

    helper.createDocs(source, 1, function() {
      roy.replicate({ source: source, target: target }, function() {
        helper.db.destroy(source.config.db, function() {
          helper.db.create(source.config.db, function() {
            source.insert({ _id: 'another', i: 2 }, function() {
              roy.replicate({ source: source, target: target }, function(err, response) {
                test.ok(!err, 'no error should have been occured');
                test.ok(response.ok, 'replication was ok');
                test.equal(response.history[0].docs_written, 1, 'correct # of docs written');
                target.list(function(err, response) {
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
