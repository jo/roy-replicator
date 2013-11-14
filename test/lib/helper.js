'use strict';

var couch = process.env.COUCH || 'http://localhost:5984';

var async = require('async');
var request = require('request').defaults({ jar: false, json: true });
var adapter = require('roy-request');

exports.async = async;
exports.request = request;
exports.adapter = adapter;

exports.setUp = function(done) {
  var options = this.options = {};
  var dbs = this.dbs = [
    couch + '/roy-test-source',
    couch + '/roy-test-target'
  ];

  async.map(dbs, request.del, function() {
    async.map(dbs, request.put, function() {
      async.map(dbs, adapter, function(err, apis) {
        options.source = apis[0];
        options.target = apis[1];

        done();
      });
    });
  });
};

exports.tearDown = function(done) {
  async.map(this.dbs, request.del, done);
};

