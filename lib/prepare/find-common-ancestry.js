/*
 * Roy Replicator
 * https://github.com/jo/roy-replicator
 *
 * Find out Common Ancestry
 * - Retrieve replication logs
 * - Compare replication logs
 *
 * Copyright (c) 2013 Johannes J. Schmidt
 * Licensed under the MIT license.
 */

'use strict';

var async = require('async');

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

  function getReplicationDoc(db, next) {
    db.get('_local/' + state.id, function(err, doc) {
      // its not an error if doc does not exist
      if (err && err.error === 'not_found') {
        return next(null, null);
      }
      next(err, doc);
    });
  }

  function compare(source, target) {
    if (!source || !target) {
      return null;
    }

    // Compare session_id values for the chronological last session - if they
    // match, source and target has common replication history and it seems
    // to be valid.
    // Use `source_last_seq` value for startup checkpoint.
    if (source.session_id === target.session_id) {
      return source.source_last_seq;
    }

    // In case of mismatch, iterate over history collection to search the
    // latest (chronologically) common session_id for source and target.
    // Use value of `recorded_seq` field as startup checkpoint.
    var histories = source.history.filter(function(sourceHistory) {
      var targetHistories = target.history.filter(function(targetHistory) {
        return targetHistory.session_id === sourceHistory.session_id;
      });

      return targetHistories.length;
    });
    
    if (!histories.length) {
      return null;
    }

    return histories[0].recorded_seq;
  }

  async.map([options.source, options.target], getReplicationDoc, function(err, response) {
    if (err) {
      return callback(err);
    }

    state.replicationDocs = {
      source: response[0],
      target: response[1]
    };
    state.start_last_seq = compare(response[0], response[1]);

    callback(null, {
      ok: true,
      start_last_seq: state.start_last_seq
    });
  });
};
