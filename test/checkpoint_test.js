'use strict';

var helper = require('./test_helper.js');
var roy = require('../roy.js');

exports.checkpoint = {
  setUp: helper.setUp,

  'basic checkpoint': function(test) {
    test.expect(6);

    var source = this.source;
    var target = this.target;

    helper.createDocs(source, 3, function() {
      roy.replicate({ source: source, target: target }, function(err, resp) {
        test.ok(resp.ok, 'replication was ok');
        test.equal(resp.docs_read, 3, 'correct # changed docs read on first replication');
        test.equal(resp.docs_written, 3, 'correct # docs written');
        roy.replicate({ source: source, target: target }, function(err, resp) {
          test.ok(resp.ok, 'replication was ok');
          test.equal(resp.docs_read, 0, 'no docs read on second replication');
          test.equal(resp.docs_written, 0, 'no docs written on second replication');
          test.done();
        });
      });
    });
  },

  'checkpoint with many updates': function(test) {
    test.expect(3);

    var source = this.source;
    var target = this.target;

    var doc = { _id: 'mydoc', count: 0 };
    source.insert(doc, function(err, resp) {
      doc._rev = resp.rev;
      doc.count++;
      roy.replicate({ source: source, target: target }, function(err, resp) {
        test.ok(resp.ok, 'replication was ok');
        source.insert(doc, function(err, resp) {
          doc._rev = resp.rev;
          doc.count++;
          source.insert(doc, function() {
            roy.replicate({ source: source, target: target }, function(err, resp) {
              test.ok(resp.ok, 'replication was ok');
              test.equal(resp.docs_written, 1, 'correct # docs written');
              test.done();
            });
          });
        });
      });
    });
  }
};
