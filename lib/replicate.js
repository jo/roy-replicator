/*
 * Roy Replicator
 * https://github.com/jo/roy-replicator
 *
 * Replicate
 * - Locate changed documents
 * - Fetch changed documents
 * - Upload changed documents
 * - Ensure full commit
 * - Record replication checkpoint
 *
 * Copyright (c) 2013 Johannes J. Schmidt
 * Licensed under the MIT license.
 */

'use strict';

var locateChangedDocuments = require('./replicate/locate-changed-documents');
var replicateDocuments = require('./replicate/replicate-documents');
var ensureFullCommit = require('./replicate/ensure-full-commit');
var recordReplicationCheckpoint = require('./replicate/record-replication-checkpoint');

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

  // Replicate until there are no more docs to replicate.
  var replicatedOnce = false;
  var lastMissingChecked = state.missing_checked;
  function replicate() {
    function run(action, next) {
      action(options, config, state, next);
    }

    async.eachSeries([
      locateChangedDocuments,
      replicateDocuments,
      ensureFullCommit,
      recordReplicationCheckpoint
    ], run, function(err) {
      if (err) {
        return callback(err);
      }

      if (replicatedOnce && !state.missing_checked) {
        return callback(null, {
          ok: true,
          no_changes: !state.missing_checked
        });
      }

      if (replicatedOnce && lastMissingChecked === state.missing_checked) {
        return callback(null, {
          ok: true,
          session_id: state.session_id,
          source_last_seq: state.end_last_seq,
          replication_id_version: state.id_version,
          history: [
            {
              session_id: state.session_id,
              start_time: state.start_time,
              end_time: new Date(),
              start_last_seq: state.start_last_seq,
              end_last_seq: state.end_last_seq,
              recorded_seq: state.recorded_seq,
              missing_checked: state.missing_checked,
              missing_found: state.missing_found,
              docs_read: state.docs_read,
              docs_written: state.docs_written,
              doc_write_failures: state.doc_write_failures
            }
          ]
        });
      }

      replicatedOnce = true;
      lastMissingChecked = state.missing_checked;
      replicate();
    });
  }

  replicate();
};
