/*
 * Roy Replicator
 * https://github.com/jo/roy-replicator
 *
 * Generate Replication ID
 *
 * Copyright (c) 2013 Johannes J. Schmidt
 * Licensed under the MIT license.
 */

'use strict';

var Crypto = require('../../deps/md5');

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

  var id = [];

  function getFilter(callback) {
    if (!options.filter) {
      return callback(null, null);
    }

    var ddocName = options.filter.split('/', 1)[0];

    options.source.get('_design/' + ddocName, function(err, ddoc) {
      if (err) {
        return callback(err);
      }

      var filterName = options.filter.split('/', 2)[1];
      if (!ddoc.filters || !ddoc.filters[filterName]) {
        return callback({ error: 'not_found', reason: 'missing json key: ' + filterName });
      }

      callback(null, ddoc.filters[filterName]);
    });
  }

  id.push(config.id);
  id.push(options.source.id());
  id.push(options.target.id());

  getFilter(function(err, filter) {
    if (err) {
      return callback(err);
    }

    if (filter) {
      id.push(filter);
    }

    if (options.query_params) {
      id.push(JSON.stringify(options.query_params));
    }

    if (options.doc_ids) {
      id.push(JSON.stringify(options.doc_ids));
    }

    state.id_version = 3;
    state.id = Crypto.MD5(id.join(''));

    callback(null, {
      ok: true,
      version: state.id_version,
      id: state.id
    });
  });
};
