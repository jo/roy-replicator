/*
 * Roy
 * https://github.com/jo/roy
 *
 * Copyright (c) 2013 Johannes J. Schmidt
 * Licensed under the MIT license.
 */

'use strict';

var crypto = require('crypto');
var nano = require('nano');
var async= require('async');

function getIdentifier(db) {
  return crypto
    .createHash('md5')
    .update(db.config.url)
    .update('/')
    .update(db.config.db)
    .digest("hex");
}

// TODO:
// * do it in batches
// * fetch revisions of generation 1 via all_docs
exports.replicate = function(options, callback) {
  var checkpointDocId = '_local/' + encodeURIComponent(getIdentifier(options.source));

  options.target.get(checkpointDocId, function(err, checkpointDoc) {
    checkpointDoc = checkpointDoc || {
      _id: checkpointDocId,
      checkpoint: 0
    };

    options.source.changes({
      since: checkpointDoc.checkpoint
    }, function(err, changes) {
      var diffs = changes.results.reduce(function(memo, result) {
        memo[result.id] = result.changes.map(function(change) { return change.rev; });
        return memo;
      }, {});

      nano(options.target.config.url).request({
        db: options.target.config.db,
        path: '_revs_diff',
        method: 'POST',
        body: diffs
      }, function(err, missingRevs) {
        // TODO: make paralell requests for each id
        // and seriell for each rev of that id
        // to correctly set atts_since
        var revs = Object.keys(missingRevs).reduce(function(memo, id) {
          missingRevs[id].missing.reduce(function(m, rev) {
            m.push({
              rev: rev,
              id: id
            });
            return m;
          }, memo);
          return memo;
        }, []);
        
        async.map(revs, function(rev, next) {
          options.source.get(rev.id, {
            rev: rev.rev,
            revs: true,
            attachments: true,
            atts_since: [] // TODO
          }, next);
        }, function(err, docs) {
          options.target.bulk({ docs: docs }, { new_edits: false }, function(err, result) {
            checkpointDoc.checkpoint = changes.last_seq;
            options.target.insert(checkpointDoc, function(err, resp) {
              callback(null, {
                ok: true
              });
            });
          });
        });
      });
    });
  });
};
