'use strict';

var helper = require('./helper.js');
var fs = require('fs');

exports.attachment = helper.test({
  'single attachment': function(test) {
    var options = this.options;
    var roy = this.roy;

    var filename = __dirname + '/fixtures/roy.jpg';
    var url = options.source.id() + '/mydoc/roy.jpg';
    
    fs.createReadStream(filename).pipe(helper.request.put(url, function() {
      helper.request.get(options.source.id() + '/mydoc', function(err, _, doc) {
        roy.replicate(options, function(err, resp) {
          test.ok(!err, 'no error should have been occured');
          test.ok(resp.ok, 'replication was ok');
          test.equal(resp.history[0].docs_written, 1, 'correct # of docs were written');
          helper.request.get(options.target.id() + '/mydoc', function(err, _, remoteDoc) {
            test.equal(typeof remoteDoc._attachments, 'object', 'remote doc should have attachments property');
            test.equal(typeof remoteDoc._attachments['roy.jpg'], 'object', 'remote doc should have roy.jpg attachment');
            test.equal(remoteDoc._attachments['roy.jpg'].length, doc._attachments['roy.jpg'].length, 'remote doc should have correct length');
            test.done();
          });
        });
      });
    }));
  }
});
