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
  }
};
