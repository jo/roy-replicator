/*
 * Roy Replicator
 * https://github.com/jo/roy-replicator
 *
 * Locate Changed Documents
 * - Listen to changes feed
 * - Calculate revision difference
 *
 * Copyright (c) 2013 Johannes J. Schmidt
 * Licensed under the MIT license.
 */

'use strict';

// TODO: support continuous mode.
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

  // `style=all_docs` query parameter instructs source to include all revision
  // leaves for each document’s event in output.
  var changesOptions = {
    style: 'all_docs'
  };

  // Reading whole feed with single shot may be not resource optimal solution and it
  // is recommended to process feed by `config.batch_size` chunks.
  // However, there is no specific recommendation on chunks size since it heavily depended
  // from available resources: large chunks requires more memory while they are reduces I/O
  // operations and vice versa.
  if (config.batch_size) {
    changesOptions.limit = config.batch_size;
  }

  // If startup checkpoint was found during replication logs comparison, the `since`
  // query parameter is passed with this value. In case of full replication it
  // is omitted.
  if (state.end_last_seq || state.start_last_seq) {
    changesOptions.since = state.end_last_seq || state.start_last_seq;
  }

  // The `feed` parameter defines type of response from changes feed: for continuous
  // replication it has value `continuous`, otherwise is omitted.
  // For continuous replication the `heartbeat` parameter defines heartbeat period in
  // milliseconds. The recommended value by default is 10000 (10 seconds). 
  // Note, that changes feed output format is different for `feed=normal` and
  // `feed=continuous`.
  if (options.continuous) {
    changesOptions.feed = 'continuous';
    changesOptions.heartbeat = config.heartbeat;
  }

  // Filter parameter are specified in case of using filter function on server side.
  if (options.filter) {
    changesOptions.filter = options.filter;
  }

  if (options.query_params) {
    changesOptions.query_params = options.query_params;
  }

  if (options.doc_ids) {
    changesOptions.doc_ids = options.doc_ids;
  }

  // Read changes feed of source by using GET /{db}/_changes request.
  options.source.changes(changesOptions, function(err, response) {
    if (err) {
      return callback(err);
    }

    state.end_last_seq = response.last_seq;

    if (!response.results.length) {
      state.changedDocs = [];

      return callback(null, {
        ok: true,
        changedDocs: state.changedDocs
      });
    }

    // Amount of checked revisions on source
    state.missing_checked = response.results.reduce(function(sum, result) {
      return sum + result.changes.length;
    }, state.missing_checked);

    // Form JSON mapping object for document ID and related leaf revisions:
    var revs = response.results.reduce(function(memo, result) {
      memo[result.id] = result.changes.map(function(change) { return change.rev; });
      return memo;
    }, {});

    options.target.revsDiff(revs, function(err, changedDocs) {
      if (err) {
        return callback(err);
      }

      state.changedDocs = changedDocs;

      // Amount of checked revisions on source
      state.missing_found = Object.keys(changedDocs).reduce(function(sum, key) {
        return sum + changedDocs[key].missing.length;
      }, state.missing_found);

      callback(null, {
        ok: true,
        changedDocs: state.changedDocs
      });
    });
  });
};
