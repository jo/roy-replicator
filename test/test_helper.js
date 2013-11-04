'use strict';

var couch = process.env.COUCH || 'http://localhost:5984';

var nano = require('nano')(couch);
var async = require('async');

exports.createDocs = function(db, n, callback) {
  var docs = [];
  for (var i = 0; i < n; i++) {
    docs.push({
      _id: i.toString(),
      i: i
    });
  }
  db.bulk({ docs: docs }, callback);
};

exports.setUp = function(done) {
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
};

