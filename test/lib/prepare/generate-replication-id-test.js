'use strict';

var helper = require('../helper');
var generateReplicationId = require('../../../lib/prepare/generate-replication-id');

exports.generateReplicationId = {
  setUp: helper.setUp,
  tearDown: helper.tearDown,

  'basics': function(test) {
    var state = {};

    generateReplicationId(this.options, { id: 'my-replicator' }, state, function(err, response) {
      test.ok(!err, 'no error should have been occured');
      test.ok(response.ok, 'response should be ok');
      test.equal(response.version, 3, 'version should be 3');
      test.equal(typeof response.id, 'string', 'response should be ok');
      test.equal(state.id_version, 3, 'state should be populated with id_version');
      test.equal(state.id, response.id, 'state should populated with id');
      test.done();
    });
  },

  'identical replications on the same replicator should have identical ids': function(test) {
    var options = this.options;

    generateReplicationId(options, { id: 'my-replicator' }, function(err, one) {
      generateReplicationId(options, { id: 'my-replicator' }, function(err, other) {
        test.equal(one.id, other.id, 'ids should be equal');
        test.done();
      });
    });
  },

  'identical replications on different replicators should have different ids': function(test) {
    var options = this.options;

    generateReplicationId(options, { id: 'one-replicator' }, function(err, one) {
      generateReplicationId(options, { id: 'other-replicator' }, function(err, other) {
        test.notEqual(one.id, other.id, 'ids should differ');
        test.done();
      });
    });
  },

  'different replication sources and targets on identical replicators should have different ids': function(test) {
    var options = this.options;

    generateReplicationId(options, { id: 'my-replicator' }, function(err, one) {
      generateReplicationId({ source: options.target, target: options.source }, { id: 'my-replicator' }, function(err, other) {
        test.notEqual(one.id, other.id, 'ids should differ');
        test.done();
      });
    });
  },

  'filters on identical replicators': {
    setUp: function(done) {
      var that = this;

      var ddoc = {
        _id: '_design/mydoc',
        filters: {
          one: 'function(doc) { return doc.type === "one"; }',
          two: 'function(doc) { return doc.type === "one"; }',
          other: 'function(doc) { return doc.type === "other"; }'
        }
      };

      helper.request.put(that.dbs[0] + '/' + encodeURIComponent(ddoc._id), { body: ddoc }, done);
    },

    'missing ddoc': function(test) {
      var options = {
        source: this.options.source,
        target: this.options.target,
        filter: 'unknown/myfilter' 
      };

      generateReplicationId(options, { id: 'my-replicator' }, function(err) {
        test.ok(err, 'an error should have been occured');
        test.equal(err.error, 'not_found', 'error should be not_found');
        test.done();
      });
    },

    'missing filter': function(test) {
      var options = {
        source: this.options.source,
        target: this.options.target,
        filter: 'mydoc/unknown' 
      };
      
      generateReplicationId(options, { id: 'my-replicator' }, function(err) {
        test.ok(err, 'an error should have been occured');
        test.equal(err.error, 'not_found', 'error should be not_found');
        test.done();
      });
    },

    'same replication filters should have identical ids': function(test) {
      var options = {
        source: this.options.source,
        target: this.options.target,
        filter: 'mydoc/one' 
      };

      generateReplicationId(options, { id: 'my-replicator' }, function(err, one) {
        generateReplicationId(options, { id: 'my-replicator' }, function(err, other) {
          test.equal(one.id, other.id, 'ids should be identical');
          test.done();
        });
      });
    },

    'identical replication filter codes should have identical ids': function(test) {
      var options = {
        source: this.options.source,
        target: this.options.target,
        filter: 'mydoc/one' 
      };

      generateReplicationId(options, { id: 'my-replicator' }, function(err, one) {
        options.filter = 'mydoc/two';
        generateReplicationId(options, { id: 'my-replicator' }, function(err, other) {
          test.equal(one.id, other.id, 'ids should be identical');
          test.done();
        });
      });
    },

    'different replication filter codes should have different ids': function(test) {
      var options = {
        source: this.options.source,
        target: this.options.target,
        filter: 'mydoc/one' 
      };

      generateReplicationId(options, { id: 'my-replicator' }, function(err, one) {
        options.filter = 'mydoc/other';
        generateReplicationId(options, { id: 'my-replicator' }, function(err, other) {
          test.notEqual(one.id, other.id, 'ids should differ');
          test.done();
        });
      });
    }
  },

  'different replication query_params on identical replicators should have different ids': function(test) {
    var options = {
      source: this.options.source,
      target: this.options.target
    };

    generateReplicationId(options, { id: 'my-replicator' }, function(err, one) {
      options.query_params = { foo: 'bar' };
      generateReplicationId(options, { id: 'my-replicator' }, function(err, other) {
        test.notEqual(one.id, other.id, 'ids should differ');
        test.done();
      });
    });
  },

  'different replication doc_ids on identical replicators should have different ids': function(test) {
    var options = {
      source: this.options.source,
      target: this.options.target
    };

    generateReplicationId(options, { id: 'my-replicator' }, function(err, one) {
      options.doc_ids = ['mydoc'];
      generateReplicationId(options, { id: 'my-replicator' }, function(err, other) {
        test.notEqual(one.id, other.id, 'ids should differ');
        test.done();
      });
    });
  }
};
