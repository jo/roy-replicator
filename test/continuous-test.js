'use strict';

var helper = require('./helper.js');

exports.continuous = helper.test({
  'basic continuous replication': function(test) {
    var replication = this.roy.replicate({
      source: this.options.source,
      target: this.options.target,
      continuous: true
    });

    helper.request.get(this.options.source.id() + '/_changes', { qs: { feed: 'longpoll' } }, function(err, _, resp) {
      test.equal(resp.results.length, 1, 'correct # of docs have changed');
      replication.cancel();
      test.done();
    });

    helper.createDocs(this.options.source, 1);
  }
});
