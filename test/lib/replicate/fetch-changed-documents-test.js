'use strict';

var helper = require('../helper');
var fetchChangedDocuments = require('../../../lib/replicate/fetch-changed-documents');

exports.fetchChangedDocuments = {
  setUp: helper.setUp,
  tearDown: helper.tearDown,

  'basics': function(test) {
    fetchChangedDocuments(this.options, function(err, response) {
      test.ok(!err, 'no error should have been occured');
      test.ok(response.ok, 'response should be ok');
      test.equal(typeof response.docs, 'object', 'docs should be an object');
      test.deepEqual(response.docs, {}, 'docs should be empty');
      test.done();
    });
  },

  'with one doc': {
    setUp: function(done) {
      var doc = this.doc = {
        _id: 'mydoc',
        foo: 'bar'
      };

      helper.request.put(this.dbs[0] + '/' + doc._id, { body: doc }, function(err, resp, body) {
        doc._rev = body.rev;
        done();
      });
    },

    'single revision': function(test) {
      var doc = this.doc;
      var changedDocs = { 'mydoc': { missing: [ doc._rev ] } };

      fetchChangedDocuments(this.options, {}, { changedDocs: changedDocs }, function(err, response) {
        test.ok(!err, 'no error should have been occured');
        test.ok(response.ok, 'response should be ok');
        test.equal(typeof response.docs, 'object', 'docs should be an object');
        test.equal(response.docs.length, 1, 'docs should have correct # of docs');

        var doc = response.docs[0];
        test.equal(doc._id, doc._id, 'response should include doc id');
        test.equal(doc.foo, doc.foo, 'response should include doc foo');
        test.equal(doc._rev, doc._rev, 'response should include doc rev');
        test.equal(typeof doc._revisions, 'object', '_revisions should be included');
        test.equal(doc._revisions.start, 1, 'start should be 1');
        test.equal(typeof doc._revisions.ids, 'object', 'ids should be included');
        test.equal(doc._revisions.ids.length, 1, 'ids should have one entry');
        test.equal(doc._revisions.ids[0], doc._rev.replace(/^1-/, ''), 'ids should include doc rev');

        test.done();
      });
    },

    'two revisions': function(test) {
      var options = this.options;

      var doc = this.doc;
      var rev1 = doc._rev;
      var changedDocs = { 'mydoc': { missing: [ rev1, doc._rev ] } };

      doc.foo = 'baz';
      helper.request.put(this.dbs[0] + '/' + doc._id, { body: doc }, function(err, resp, body) {
        doc._rev = body.rev;
        fetchChangedDocuments(options, {}, { changedDocs: changedDocs }, function(err, response) {
          test.ok(!err, 'no error should have been occured');
          test.ok(response.ok, 'response should be ok');

          var doc = response.docs[0];
          test.equal(doc._revisions.start, 2, 'start should be 1');
          test.equal(typeof doc._revisions.ids, 'object', 'ids should be included');
          test.equal(doc._revisions.ids.length, 2, 'ids should have one entry');
          test.equal(doc._revisions.ids[0], doc._rev.replace(/^2-/, ''), 'ids should include docs second rev');
          test.equal(doc._revisions.ids[1], rev1.replace(/^1-/, ''), 'ids should include docs first rev');
          test.done();
        });
      });
    }
  }
};
