/*
 * Roy
 * https://github.com/jo/roy
 *
 * Node implementation of CouchDB replicator.
 * For educational purposes only.
 *
 * Copyright (c) 2013 Johannes J. Schmidt
 * Licensed under the MIT license.
 */

'use strict';

var prepare = require('./lib/prepare');
var replicate = require('./lib/replicate');

var uuid = require('./deps/uuid'); 

module.exports = function(config) {
  config = config || {};


  // ID for this replicator
  config.id = config.id || uuid();

  // Batch size for changes feed processing
  config.batch_size = config.batch_size || 100;

  // Maximal concurrent requests
  config.max_requests = config.max_requests || 4;

  // Heartbeat for changes feed in continues mode
  config.heartbeat = config.heartbeat || 10000;


  return {
    id: function() {
      return config.id;
    },

    replicate: function(options, callback) {
      options = options || {};
      callback = callback || function() {};

      // TODO: check couchdb error messages for missing source and target
      if (!options.source) {
        throw('Need a source');
      }
      if (!options.target) {
        throw('Need a target');
      }


      // Replication state object
      var state = {
        session_id: uuid(),
        start_time: new Date(),
        missing_checked: 0,
        missing_found: 0,
        docs_read: 0,
        docs_written: 0,
        doc_write_failures: 0
      };


      // Run preparations, then replicate until done.
      prepare(options, config, state, function(err) {
        if (err) {
          return callback(err);
        }

        replicate(options, config, state, callback);
      });
      

      // Promise allows to cancel continuous replication.
      return {
        cancel: function(callback) {
          // TODO: cancel active requests
          if (typeof callback === 'function') {
            callback();
          }
        }
      };
    }
  };
};
