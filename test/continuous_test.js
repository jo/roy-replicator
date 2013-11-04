'use strict';

var helper = require('./test_helper.js');
var roy = require('../roy.js');

exports.continuous = {
  setUp: helper.setUp,

  'basic continuous replication': function(test) {
    test.expect(1);
    var source = this.source;
    var target = this.target;

    var replication = roy.replicate({
      source: source,
      target: target,
      continuous: true
    });

    target.changes({ feed: 'longpoll' }, function(err, resp) {
      test.equal(resp.results.length, 1, 'correct # of docs have changed');
      replication.cancel();
      test.done();
    });

    helper.createDocs(source, 1);
  },
};
