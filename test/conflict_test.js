'use strict';

var helper = require('./test_helper.js');
var roy = require('../roy.js');

function putAfter(db, doc, prevRev, callback){
  doc._revisions = {
    start: +doc._rev.split('-')[0],
    ids: [
      doc._rev.split('-')[1],
      prevRev.split('-')[1]
    ]
  };
  db.insert(doc, { new_edits: false }, callback);
}

exports.conflict = {
  setUp: helper.setUp,

  'some conflicts': function(test) {
    test.expect(4);

    var source = this.source;
    var target = this.target;

    var doc = {
      _id: "foo",
      _rev: "1-a",
      value: "generic"
    };
    source.insert(doc, { new_edits: false }, function() {
      target.insert(doc, { new_edits: false }, function() {
        putAfter(target, { _id: "foo", _rev: "2-b", value: "target" }, "1-a", function() {
          putAfter(source, { _id: "foo", _rev: "2-c", value: "whatever" }, "1-a", function() {
            putAfter(source, { _id: "foo", _rev: "3-c", value: "source" }, "2-c", function() {
              source.get("foo", function(err, doc) {
                test.equal(doc.value, "source", "source has correct value (get)");
                target.get("foo", function(err, doc) {
                  test.equal(doc.value, "target", "target has correct value (get)");
                  roy.replicate({ source: source, target: target }, function() {
                    roy.replicate({ source: target, target: source }, function() {
                      source.get("foo", function(err, doc) {
                        test.equal(doc.value, "source", "source has correct value (get after replication)");
                        target.get("foo", function(err, doc) {
                          test.equal(doc.value, "source", "target has correct value (get after replication)");
                          test.done();
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  },

  'remote conflicts': function(test) {
    test.expect(2);

    var source = this.source;
    var target = this.target;

    var doc = {
      _id: "test",
      test: "Remote 1"
    };
    var winningRev;
    target.insert(doc, function(err, resp) {
      doc._rev = resp.rev;
      roy.replicate({ source: target, target: source }, function() {
        doc.test = "Local 1";
        source.insert(doc, function() {
          doc.test = "Remote 2";
          target.insert(doc, function(err, resp) {
            doc._rev = resp.rev;
            doc.test = "Remote 3";
            target.insert(doc, function(err, resp) {
              winningRev = resp.rev;
              roy.replicate({ source: source, target: target }, function() {
                roy.replicate({ source: target, target: source }, function() {
                  target.get('test', { revs_info: true }, function(err, targetDoc) {
                    source.get('test', { revs_info: true }, function(err, localDoc) {
                      test.equal(localDoc._rev, winningRev, "Local chose correct winning revision");
                      test.equal(targetDoc._rev, winningRev, "Remote chose winning revision");
                      test.done();
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  },

  // TODO: fix them.
  //
  // 'multiple remote conflicts': function(test) {
  //   test.expect(3);

  //   var source = this.source;
  //   var target = this.target;

  //   var doc = {
  //     _id: "test",
  //     _rev: '1-a',
  //     value: "test"
  //   };

  //   function createConflicts(db, callback) {
  //     db.insert(doc, { new_edits: false }, function() {
  //       putAfter(db, { _id: 'test', _rev: '2-a', value: 'v1' }, '1-a', function() {
  //         putAfter(db, { _id: 'test', _rev: '2-b', value: 'v2' }, '1-a', function() {
  //           putAfter(db, { _id: 'test', _rev: '2-c', value: 'v3' }, '1-a', callback);
  //         });
  //       });
  //     });
  //   }
  //   
  //   createConflicts(source, function() {
  //     roy.replicate({ source: source, target: target }, function(err, result) {
  //       test.ok(result.ok, 'replication was ok');
  //       // in this situation, all the conflicting revisions should be read and
  //       // written to the target database (this is consistent with CouchDB)
  //       test.equal(result.docs_written, 4, 'correct # docs written');
  //       test.equal(result.docs_read, 4, 'correct # docs read');
  //       test.done();
  //     });
  //   });
  // }
};
