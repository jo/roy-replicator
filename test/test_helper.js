'use strict';

var couch = process.env.COUCH || 'http://localhost:5984';

var roy = require('../roy.js');
var nano = require('nano')(couch);
var async = require('async');

exports.db = nano.db;

function setUp(done) {
  var db = this.db;
  var sourceName = this.source.config.db;
  var targetName = this.target.config.db;

  async.each([sourceName, targetName], db.destroy, function() {
    // removing this timeout cause flickering tests :(
    setTimeout(function() {
      async.each([sourceName, targetName], db.create, function() {
        done();
      });
    }, 100);
  });
};

exports.roy = require('../roy.js');

var roy = require('../roy.js');
var nativeRoy = {
  replicate: function(options, callback) {
    var replicationOptions = {};

    if (options.create_target) {
      replicationOptions.create_target = options.create_target;
    }
    if (options.continuous) {
      replicationOptions.continuous = options.continuous;
    }
    if (options.filter) {
      replicationOptions.filter = options.filter;
    }
    if (options.query_params) {
      replicationOptions.query_params = options.query_params;
    }
    if (options.doc_ids) {
      replicationOptions.doc_ids = options.doc_ids;
    }

    nano.db.replicate(options.source, options.target, replicationOptions, callback);

    return {
      cancel: function(callback) {
        replicationOptions.cancel = true;
        nano.db.replicate(options.source, options.target, replicationOptions, callback);
      }
    };
  }
};
exports.test = function(tests) {
  var db = nano.db;
  var sourceName = 'roy-source';
  var targetName = 'roy-target';
  var source = db.use(sourceName);
  var target = db.use(targetName);

  var test = {
    setUp: setUp.bind({
      db: db,
      source: source,
      target: target
    })
  };

  Object.keys(tests).forEach(function(name) {
    test[name + ' (native)'] = tests[name].bind({
      roy: nativeRoy,
      db: db,
      source: source,
      target: target
    });
    test[name + ' (roy)'] = tests[name].bind({
      roy: roy,
      db: db,
      source: source,
      target: target
    });
  });

  return test;
};

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

