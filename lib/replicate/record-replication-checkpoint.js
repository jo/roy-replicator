/*
 * Roy Replicator
 * https://github.com/jo/roy-replicator
 *
 * Record Replication Checkpoint
 *
 * Copyright (c) 2013 Johannes J. Schmidt
 * Licensed under the MIT license.
 */

'use strict';

var async = require('async');

// Since batch of changes was uploaded and committed successfully, replicator
// updates replication log both on source and target recording current
// replication state.
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

  var history = {
    session_id: state.session_id,
    start_time: state.start_time,
    end_time: new Date(),
    missing_checked: state.missing_checked,
    missing_found: state.missing_found,
    docs_read: state.docs ? state.docs.length : 0,
    // TODO: at the moment we expect every read doc was also written
    docs_written: state.docs ? state.docs.length : 0,
    // TODO: at the moment we do not count write failures
    doc_write_failures: 0,
    start_last_seq: state.start_last_seq,
    recorded_seq: state.end_last_seq,
    end_last_seq: state.end_last_seq
  };

  state.replicationDocs = state.replicationDocs || {};
  if (!state.replicationDocs.source) {
    state.replicationDocs.source = {
      _id: '_local/' + state.id,
      replication_id_version: state.id_version
    };
  }
  if (!state.replicationDocs.target) {
    state.replicationDocs.target = {
      _id: '_local/' + state.id,
      replication_id_version: state.id_version
    };
  }

  function saveReplicationDoc(ep, next) {
    ep.doc.session_id = history.session_id;
    ep.doc.source_last_seq = history.recorded_seq;
    ep.doc.history = ep.doc.history || [];
    ep.doc.history.unshift(history);

    ep.db.put(ep.doc, function(err, doc) {
      // its not an error if doc does not exist
      if (err && err.error === 'not_found') {
        return next(null, null);
      }
      next(err, doc);
    });
  }

  async.map([
    { db: options.source, doc: state.replicationDocs.source },
    { db: options.target, doc: state.replicationDocs.target }
  ], saveReplicationDoc, function(err, response) {
    if (err) {
      return callback(err);
    }

    state.recorded_seq = state.end_last_seq;

    state.replicationDocs.source._rev = response[0].rev;
    state.replicationDocs.target._rev = response[1].rev;

    callback(null, {
      ok: true,
      replicationDocs: state.replicationDocs
    });
  });
};
