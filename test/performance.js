'use strict';

var helper = require('./helper.js');

var number = 1000;

exports.performance = helper.test({
  'simple generation one docs': function(test) {
    var options = this.options;
    var roy = this.roy;
    var type = this.type;

    helper.createDocs(options.source, number, function() {
      var start = new Date();
      roy.replicate(options, function(err, response) {
        var end = new Date();
        var duration = end - start;
        console.log('docs per second (' + type + '): ', Math.round(number / (duration / 1000)));
        test.ok(!err, 'no error should have been occured');
        test.ok(response.ok, 'response should be ok');
        test.done();
      });
    });
  }
});
