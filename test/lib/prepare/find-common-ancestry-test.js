'use strict';

var helper = require('../helper');
var findCommonAncestry = require('../../../lib/prepare/find-common-ancestry');

exports.findCommonAncestry = {
  setUp: helper.setUp,
  tearDown: helper.tearDown,

  'neither source nore target replication docs exist': function(test) {
    findCommonAncestry(this.options, {}, { id: 'my-replication' }, function(err, response) {
      test.ok(!err, 'no error should have been occured');
      test.ok(response.ok, 'response should be ok');
      test.equal(response.last_seq, null, 'last_seq should be null');
      test.done();
    });
  },

  'identical last session': function(test) {
    var options = this.options;

    var doc = {
      _id: '_local/my-replication',
      session_id: '123',
      source_last_seq: 'my-last-seq'
    };

    function putDoc(db, next) {
      helper.request.put(db + '/' + doc._id, { body: doc }, next);
    }

    helper.async.map(this.dbs, putDoc, function() {
      findCommonAncestry(options, {}, { id: 'my-replication' }, function(err, response) {
        test.ok(!err, 'no error should have been occured');
        test.ok(response.ok, 'response should be ok');
        test.equal(response.start_last_seq, doc.source_last_seq, 'start_last_seq should be set to source_last_seq');
        test.done();
      });
    });
  },

  'different last sessions': function(test) {
    var options = this.options;
    var dbs = this.dbs;

    var recordedSeq = 'my-recored-seq';
    var docs = [
      {
        _id: '_local/my-replication',
        session_id: '123',
        history: [
          {
            session_id: 'session-three',
            recorded_seq: 'recored-seq-three'
          },
          {
            session_id: 'session-two',
            recorded_seq: recordedSeq
          },
          {
            session_id: 'session-one',
            recorded_seq: 'recored-seq-one'
          }
        ]
      },
      {
        _id: '_local/my-replication',
        session_id: '234',
        history: [
          {
            session_id: 'session-two',
            recorded_seq: recordedSeq
          },
          {
            session_id: 'session-one',
            recorded_seq: 'recored-seq-one'
          }
        ]
      }
    ];

    function putDoc(db, next) {
      var doc = docs[dbs.indexOf(db)];

      helper.request.put(db + '/' + doc._id, { body: doc }, next);
    }

    helper.async.map(dbs, putDoc, function() {
      findCommonAncestry(options, {}, { id: 'my-replication' }, function(err, response) {
        test.ok(!err, 'no error should have been occured');
        test.ok(response.ok, 'response should be ok');
        test.equal(response.start_last_seq, recordedSeq, 'last_seq should be set to recorded_seq');
        test.done();
      });
    });
  }
};
