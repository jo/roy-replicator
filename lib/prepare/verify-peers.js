/*
 * Roy Replicator
 * https://github.com/jo/roy-replicator
 *
 * Verify Peers
 *
 * Copyright (c) 2013 Johannes J. Schmidt
 * Licensed under the MIT license.
 */

'use strict';

var async = require('async');

// Ensure that both source and target exists via (parallel) HEAD requests.
// If source does not exist, abort with an `db_not_found` error.
// In case target does not exist, create the target if `options.create_target` is
// set, otherwise abort with an `db_not_found` error.
module.exports = function(options, config, state, callback) {
  if (typeof config === 'function') {
    callback = config;
    config = {};
    state = {};
  }
  if (typeof state === 'function') {
    callback = state;
    state = {};
  }

  function exist(db, next) {
    db.exists(next);
  }

  async.map([options.source, options.target], exist, function(err, response) {
    if (err) {
      return callback(err);
    }

    var sourceExists = response[0].ok;
    if (!sourceExists) {
      return callback({
        error: 'db_not_found',
        reason: 'could not open source'
      });
    }

    var targetExists = response[1].ok;
    if (!targetExists) {
      if (options.create_target) {
        return options.target.create(function(err) {
          if (err) {
            return callback(err);
          }
          
          callback(null, { ok: true });
        });
      } else {
        return callback({
          error: 'db_not_found',
          reason: 'could not open target'
        });
      }
    }

    callback(null, { ok: true });
  });
};
