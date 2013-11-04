'use strict';

var helper = require('./test_helper.js');
var roy = require('../roy.js');

exports.cancel = {
  setUp: helper.setUp,

  'cancel replication': function(test) {
    test.expect(1);
    var source = this.source;
    var target = this.target;

    var replication = roy.replicate({
      source: source,
      target: target,
      continuous: true
    });

    target.changes({ feed: 'longpoll' }, function(err, resp) {
      replication.cancel();
      var changes = target.changes({ feed: 'longpoll', since: resp.last_seq }, function() {
        test.ok(false, 'no change should have been emitted');
      });
      helper.createDocs(source, 1, function() {
        // This setTimeout is needed to ensure no further changes come through
        setTimeout(function() {
          changes.abort();
          test.ok(true, 'no change should have been emitted');
          test.done();
        }, 300);
      });
    });

    helper.createDocs(source, 1);
  }
};
