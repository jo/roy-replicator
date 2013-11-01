'use strict';

var couch = process.env.COUCH || 'http://localhost:5984';
var nano = require('nano')(couch);
var roy = require('../roy.js');
var async = require('async');

function createDocs(db, n, callback) {
  var docs = [];
  for (var i = 0; i < n; i++) {
    docs.push({
      _id: i.toString(),
      i: i
    });
  }
  db.bulk({ docs: docs }, callback);
}

exports['replicate'] = {
  setUp: function(done) {
    var db = this.db = nano.db;

    var sourceName = 'roy-source';
    var targetName = 'roy-target';

    this.source = db.use(sourceName);
    this.target = db.use(targetName);

    async.each([sourceName, targetName], db.destroy, function() {
      async.each([sourceName, targetName], db.create, function() {
        done();
      });
    });
  },

  'basic replication': function(test) {
    test.expect(3);
    var source = this.source;
    var target = this.target;
    var db = this.db;

    createDocs(source, 3, function() {
      roy.replicate({
        source: source,
        target: target
      }, function(err, resp) {
        test.ok(!err, 'no error should have been occured');
        test.ok(resp.ok, 'resp should be ok');
        db.get(source.config.db, function(err, sourceInfo) {
          db.get(target.config.db, function(err, targetInfo) {
            test.equal(sourceInfo.doc_count, targetInfo.doc_count, 'source and target have the same docs count');
            test.done();
          });
        });
      });
    });
  },

  'continuous replication': function(test) {
    test.expect(2);
    var source = this.source;
    var target = this.target;

    var replication = roy.replicate({
      source: source,
      target: target,
      continuous: true
    }, function(err, resp) {
      test.ok(!err, 'no error should have been occured');
      test.ok(resp.ok, 'resp should be ok');
      replication.cancel();
      test.done();
    });

    createDocs(source, 1);
  },
};
