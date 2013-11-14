'use strict';

var helper = require('./helper.js');

exports.cancel = helper.test({
  // TODO... implement continuous replication
  // 
  // 'cancel replication': function(test) {
  //   var options = this.options;

  //   var replication = this.roy.replicate({
  //     source: options.source,
  //     target: options.target,
  //     continuous: true
  //   });

  //   helper.request.get(options.target.id() + '/_changes', { qs: { feed: 'longpoll' } }, function(err, resp) {
  //     replication.cancel(function() {
  //       var changes = helper.request.get(options.target.id() + '/_changes', {
  //         qs: {
  //           feed: 'longpoll',
  //           since: resp.last_seq
  //         }
  //       }, function() {
  //         test.ok(false, 'no change should have been emitted');
  //       });
  //       helper.createDocs(options.source, 1, function() {
  //         // This setTimeout is needed to ensure no further changes come through
  //         setTimeout(function() {
  //           changes.abort();
  //           test.ok(true, 'no change should have been emitted');
  //           test.done();
  //         }, 300);
  //       });
  //     });
  //   });

  //   helper.createDocs(options.source, 1);
  // }
});
