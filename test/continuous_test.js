'use strict';

var helper = require('./test_helper.js');

exports.continuous = helper.test({
  // TODO: fix for roy
  //
  // 'basic continuous replication': function(test) {
  //   var source = this.source;
  //   var target = this.target;

  //   var replication = this.roy.replicate({
  //     source: source,
  //     target: target,
  //     continuous: true
  //   });

  //   target.changes({ feed: 'longpoll' }, function(err, resp) {
  //     test.equal(resp.results.length, 1, 'correct # of docs have changed');
  //     replication.cancel();
  //     test.done();
  //   });

  //   helper.createDocs(source, 1);
  // }
});
