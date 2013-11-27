/*
 * Roy
 * https://github.com/jo/roy
 *
 * Prepare
 * - Verify peers
 * - Get peers information
 * - Generate replication ID
 * - Find out common ancestry
 *
 * Copyright (c) 2013 Johannes J. Schmidt
 * Licensed under the MIT license.
 */

'use strict';

var verifyPeers = require('./prepare/verify-peers');
var getPeersInformaton = require('./prepare/get-peers-information');
var generateReplicationId = require('./prepare/generate-replication-id');
var findCommonAncestry = require('./prepare/find-common-ancestry');

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

  function run(action, next) {
    action(options, config, state, next);
  }

  async.eachSeries([
    verifyPeers,
    getPeersInformaton,
    generateReplicationId,
    findCommonAncestry,
  ], run, function(err) {
    if (err) {
      return callback(err);
    }

    callback(null, {
      ok: true
    });
  });
};
