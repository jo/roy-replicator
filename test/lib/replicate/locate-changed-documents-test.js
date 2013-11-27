'use strict';

var helper = require('../helper');
var locateChangedDocuments = require('../../../lib/replicate/locate-changed-documents');

exports.locateChangedDocuments = {
  setUp: helper.setUp,
  tearDown: helper.tearDown,

  'basics': function(test) {
    locateChangedDocuments(this.options, function(err, response) {
      test.ok(!err, 'no error should have been occured');
      test.ok(response.ok, 'response should be ok');
      test.equal(typeof response.changedDocs, 'object', 'docs should be an object');
      test.deepEqual(response.changedDocs, {}, 'docs should be empty');
      test.done();
    });
  },

  'with some docs': {
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

    'single changed doc': function(test) {
      var doc = this.doc;

      locateChangedDocuments(this.options, function(err, response) {
        test.ok(!err, 'no error should have been occured');
        test.ok(response.ok, 'response should be ok');
        test.equal(typeof response.changedDocs, 'object', 'docs should be an object');
        test.deepEqual(response.changedDocs, { 'mydoc': { missing: [ doc._rev ] } }, 'response should contain revision');
        test.done();
      });
    }
  }
};
