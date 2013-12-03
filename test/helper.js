'use strict';

var couch = process.env.COUCH || 'http://localhost:5984';

var roy = require('../roy.js')();
var adapter = require('roy-request');
var request = require('request').defaults({ jar: false, json: true });
var async = require('async');

exports.async = async;
exports.request = request;

// Test agains the native CouchDB replicator
var nativeRoy = {
  id: function() {
    return 'native-roy';
  },
  
  replicate: function(options, callback) {
    var replicationOptions = {
      source: options.source.id(),
      target: options.target.id()
    };

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

    var req = request.post({
      url: couch + '/_replicate',
      body: replicationOptions
    }, function(err, resp, body) {
      if (err) {
        return callback(err);
      }

      if (resp.statusCode === 200) {
        return callback(null, body);
      }

      callback(body);
    });

    return {
      cancel: function(callback) {
        req.abort();
        callback();
      }
    };
  }
};

var replicators = {
  roy: roy,
  native: nativeRoy
};

exports.test = function(types, tests) {
  if (!tests) {
    tests = types;
    types = ['native', 'roy'];
  }
  if (typeof types === 'string') {
    types = [types];
  }

  var options = {};
  var dbs = [
    couch + '/roy-test-source',
    couch + '/roy-test-target'
  ];

  var test = {
    setUp: function(done) {
      async.map(dbs, request.del, function() {
        async.map(dbs, request.put, function() {
          async.map(dbs, adapter, function(err, apis) {
            options.source = apis[0];
            options.target = apis[1];

            done();
          });
        });
      });
    },
    tearDown: function(done) {
      async.map(dbs, request.del, done);
    }
  };

  function addTests(object, tests) {
    Object.keys(tests).forEach(function(name) {
      if (typeof tests[name] === 'object') {
        object[name] = {};
        return addTests(object[name], tests[name]);
      }

      types.forEach(function(type) {
        var key = name;

        if (types.length > 1) {
          key += ' (' + type + ')';
        }

        object[key] = tests[name].bind({
          type: type,
          roy: replicators[type],
          dbs: dbs,
          options: options
        });
      });
    });
  }

  addTests(test, tests);

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

  request.post({
    url: db.id() + '/_bulk_docs',
    body: { docs: docs }
  }, callback);
};
