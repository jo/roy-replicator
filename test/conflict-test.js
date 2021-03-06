'use strict';

var helper = require('./helper.js');

function putAfter(db, doc, prevRev, callback){
  doc._revisions = {
    start: +doc._rev.split('-')[0],
    ids: [
      doc._rev.split('-')[1],
      prevRev.split('-')[1]
    ]
  };

  helper.request.post(db.id(), {
    qs: { 
      new_edits: false
    },
    body: doc
  }, callback);
}

exports.conflict = helper.test({
  'some conflicts': function(test) {
    var options = this.options;
    var roy = this.roy;

    var doc = {
      _id: "foo",
      _rev: "1-a",
      value: "generic"
    };

    helper.request.post(options.source.id(), { qs: { new_edits: false }, body: doc }, function() {
      helper.request.post(options.target.id(), { qs: { new_edits: false }, body: doc }, function() {
        putAfter(options.target, { _id: "foo", _rev: "2-b", value: "target" }, "1-a", function() {
          putAfter(options.source, { _id: "foo", _rev: "2-c", value: "whatever" }, "1-a", function() {
            putAfter(options.source, { _id: "foo", _rev: "3-c", value: "source" }, "2-c", function() {
              helper.request.get(options.source.id() + '/foo', function(err, _, doc) {
                test.equal(doc.value, "source", "source has correct value (get)");
                helper.request.get(options.target.id() + '/foo', function(err, _, doc) {
                  test.equal(doc.value, "target", "target has correct value (get)");
                  roy.replicate(options, function() {
                    roy.replicate(options, function() {
                      helper.request.get(options.source.id() + '/foo', function(err, _, doc) {
                        test.equal(doc.value, "source", "source has correct value (get after replication)");
                        helper.request.get(options.target.id() + '/foo', function(err, _, doc) {
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
    var options = this.options;
    var roy = this.roy;

    var doc = {
      _id: "test",
      test: "Remote 1"
    };
    var winningRev;

    helper.request.post(options.target.id(), { body: doc }, function(err, _, resp) {
      doc._rev = resp.rev;
      roy.replicate({ source: options.target, target: options.source }, function() {
        doc.test = "Local 1";
        helper.request.post(options.source.id(), { body: doc }, function() {
          doc.test = "Remote 2";
          helper.request.post(options.target.id(), { body: doc }, function(err, _, resp) {
            doc._rev = resp.rev;
            doc.test = "Remote 3";
            helper.request.post(options.target.id(), { body: doc }, function(err, _, resp) {
              winningRev = resp.rev;
              roy.replicate(options, function() {
                roy.replicate({ source: options.target, target: options.source }, function() {
                  helper.request.get(options.target.id() + '/test', function(err, _, targetDoc) {
                    helper.request.get(options.source.id() + '/test', function(err, _, localDoc) {
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

  // TODO: fix it.

  // 'conflicts are handled correctly': function(test) {
  //   test.expect(11);

  //   var source = this.source;
  //   var target = this.target;

  //   var docs1 = [
  //     { _id: "0", integer: 0 },
  //     { _id: "1", integer: 1 },
  //     { _id: "2", integer: 2 },
  //     { _id: "3", integer: 3 }
  //   ];

  //   var docs2 = [
  //     { _id: "2", integer: 11 },
  //     { _id: "3", integer: 12 }
  //   ];

  //   source.bulk({ docs: docs1 }, function(err, info) {
  //     docs2[0]._rev = info[2].rev;
  //     docs2[1]._rev = info[3].rev;
  //     source.insert(docs2[0], docs2[0]._id, function() {
  //       source.insert(docs2[1], docs2[1]._id, function(err, info) {
  //         var rev2 = info.rev;
  //         helper.roy.replicate({ source: source, target: target }, function() {
  //           // update remote once, local twice, then replicate from
  //           // remote to local so the remote losing conflict is later in the tree
  //           source.insert({ _id: "3", _rev: rev2, integer: 20 }, '3', function(err, resp) {
  //             var rev3Doc = { _id: "3", _rev: resp.rev, integer: 30 };
  //             source.insert(rev3Doc, '3', function(err, resp) {
  //               var rev4local = resp.rev;
  //               var rev4Doc = {_id: "3", _rev: rev2, integer: 100 };
  //               target.insert(rev4Doc, '3', function(err, resp) {
  //                 var remoterev = resp.rev;
  //                 helper.roy.replicate({ source: target, target: source }, function() {
  //                   source.changes({
  //                     include_docs: true,
  //                     conflicts: true
  //                   }, function(err, changes) {
  //                     test.ok(changes, "got changes");
  //                     test.ok(changes.results, "changes has results array");
  //                     test.equal(changes.results.length, 4, "should get only 4 changes");
  //                     var ch = changes.results[3];
  //                     test.equal(ch.id, "3");
  //                     test.equal(ch.changes.length, 2, "Should include both conflicting revisions");
  //                     test.equal(ch.doc.integer, 30, "Includes correct value of the doc");
  //                     test.equal(ch.doc._rev, rev4local, "Includes correct revision of the doc");
  //                     test.deepEqual(ch.changes, [{rev:rev4local}, {rev:remoterev}], "Includes correct changes array");
  //                     test.ok(ch.doc._conflicts, "Includes conflicts");
  //                     test.equal(ch.doc._conflicts.length, 1, "Should have 1 conflict");
  //                     test.equal(ch.doc._conflicts[0], remoterev, "Conflict should be remote rev");
  //                     test.done();
  //                   });
  //                 });
  //               });
  //             });
  //           });
  //         });
  //       });
  //     });
  //   });
  // },

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
  //     helper.roy.replicate({ source: source, target: target }, function(err, result) {
  //       test.ok(result.ok, 'replication was ok');
  //       // in this situation, all the conflicting revisions should be read and
  //       // written to the target database (this is consistent with CouchDB)
  //       test.equal(result.docs_written, 4, 'correct # docs written');
  //       test.equal(result.docs_read, 4, 'correct # docs read');
  //       test.done();
  //     });
  //   });
  // }
});
