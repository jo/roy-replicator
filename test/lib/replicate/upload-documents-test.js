'use strict';

var couch = process.env.COUCH || 'http://localhost:5984';

var adapter = require('roy-request');
var uploadDocuments = require('../../../lib/replicate/upload-documents');

var async = require('async');
var request = require('request').defaults({ jar: false, json: true });

exports.uploadDocuments = {
  setUp: function(done) {
    var dbs = this.dbs = [
      couch + '/roy-test-source',
      couch + '/roy-test-target'
    ];
    var that = this;

    async.map(dbs, request.del, function() {
      async.map(dbs, request.put, function() {
        async.map(dbs, adapter, function(err, apis) {
          that.options = {
            source: apis[0],
            target: apis[1]
          };

          done();
        });
      });
    });
  },

  tearDown: function(done) {
    async.map(this.dbs, request.del, done);
  },

  'basics': function(test) {
    uploadDocuments(this.options, function(err, response) {
      test.ok(!err, 'no error should have been occured');
      test.ok(response.ok, 'response should be ok');
      test.done();
    });
  },

  'one doc': function(test) {
    var doc = {
      _id: 'mydoc',
      _rev: '1-asd',
      foo: 'bar',
      _revisions: {
        start: 1,
        ids: ['asd']
      }
    };

    uploadDocuments(this.options, {}, { docs: [ doc ] }, function(err, response) {
      test.ok(!err, 'no error should have been occured');
      test.ok(response.ok, 'response should be ok');
      test.done();
    });
  }

  // TODO: add more tests
};
