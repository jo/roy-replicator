/*
 * Roy Replicator
 * https://github.com/jo/roy-replicator
 *
 * Ensure Full Commit
 *
 * Copyright (c) 2013 Johannes J. Schmidt
 * Licensed under the MIT license.
 */

'use strict';

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

  // TODO: only process if we have uploaded docs

  options.target.ensureFullCommit(function(err) {
    if (err) {
      return callback(err);
    }

    callback(null, {
      ok: true
    });
  });
};
