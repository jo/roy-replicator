/*
 * Roy
 * https://github.com/jo/roy
 *
 * Get Peers Information
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

  function info(db, next) {
    db.info(next);
  }

  async.map([options.source, options.target], info, function(err, response) {
    if (err) {
      return callback(err);
    }

    callback(null, {
      ok: true,
      source: response[0],
      target: response[1]
    });
  });
};
