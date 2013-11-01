/*
 * Roy
 * https://github.com/jo/roy
 *
 * Replication Algorithm (and comments) taken from
 * https://github.com/couchbaselabs/TouchDB-iOS/wiki/Replication-Algorithm
 * by Jens Alfke
 *
 * Copyright (c) 2013 Johannes J. Schmidt
 * Licensed under the MIT license.
 */

'use strict';

var crypto = require('crypto');
var nano = require('nano');
var async= require('async');

exports.replicate = function replicate(options, callback) {
  options.batch_size = options.batch_size || 1000;

  // Reference to the changes feed, to allow to cancel in continuous mode
  var changes;

  if (!callback) {
    callback = function() {};
  }

  // Get a unique identifier from the source database (which may just be its URL).
  // Use this identifier to generate the doc ID of a special (_local,
  // non-replicated) document of the target database, to look up a stored value:
  // the last source sequence ID (also called a “checkpoint”) that was read and
  // processed by the previous replication. (It’s OK if this value is missing for
  // some reason; it’s just an optimization.)
  function getCheckpointDoc(callback) {
    var identifier = crypto
      .createHash('md5')
      .update(options.source.config.url)
      .update('/')
      .update(options.source.config.db)
      .digest("hex");
    var id = '_local/' + encodeURIComponent(identifier);

    options.target.get(id, function(err, doc) {
      doc = doc || {
        _id: id,
        checkpoint: 0
      };
      callback(null, doc);
    });
  }

  // Fetch the source database’s _changes feed, starting just past the last source
  // sequence ID (if any). Use the “?style=all_docs” URL parameter so that
  // conflicting revisions will be included. In continuous replication you should
  // use the “?feed=longpoll” or “?feed=continuous” mode and leave the algorithm
  // running indefinitely to process changes as they occur. Filtered replication
  // will specify the name of a filter function in this URL request.
  function getChanges(checkpointDoc, callback) {
    var changesOptions = {
      since: checkpointDoc.checkpoint,
      limit: options.batch_size
    };
    if (options.doc_ids) {
      changesOptions.doc_ids = options.doc_ids;
    }
    if (options.filter) {
      changesOptions.filter = options.filter;
    }
    if (options.query_params) {
      changesOptions.query_params = options.query_params;
    }
    if (options.firstRunComplete) {
      changesOptions.feed = 'longpoll';
    }
    changes = options.source.changes(changesOptions, callback);
  }

  // Collect a group of document/revision ID pairs from the _changes feed and
  // send them to the target database’s _revs_diff. The result will contain the
  // subset of those revisions that are not in the target database.
  function getRevsDiff(changes, callback) {
    var diffs = changes.results.reduce(function(memo, result) {
      memo[result.id] = result.changes.map(function(change) { return change.rev; });
      return memo;
    }, {});

    nano(options.target.config.url).request({
      db: options.target.config.db,
      path: '_revs_diff',
      method: 'POST',
      body: diffs
    }, callback);
  }

  // GET each such revision from the source database. Use the ?revs=true URL
  // parameter to include its list of parent revisions, so the target database
  // can update its revision tree. Use “?attachments=true” so the revision data
  // will include attachment bodies. Also use the “?atts_since” query parameter
  // to pass a list of revisions that the target already has, so the source can
  // optimize by not including the bodies of attachments already known to the
  // target.
  //
  // Performance:
  //
  // From my [Jens Alfke] limited testing, the performance bottleneck in the
  // current algorithm seems to be in fetching the new revisions from the
  // source. I think this is due to the overhead of handling many separate HTTP
  // requests.  It should be possible to speed up replication by introducing a
  // new API call that fetches revisions in bulk. (The _all_docs call can fetch
  // a list of revisions, but currently can’t be told to include revision
  // histories.)
  //
  // A limited case of the above-mentioned bulk-get optimization is possible
  // with the current API: revisions of generation 1 (revision ID starts with
  // “1-”) can be fetched in bulk via _all_docs, because by definition they have
  // no revision histories. Unfortunately _all_docs can’t include attachment
  // bodies, so if it returns a document whose JSON indicates it has
  // attachments, those will have to be fetched separately. Nonetheless, this
  // optimization can help significantly, and is currently implemented in
  // TouchDB.
  function getRevisions(missingRevs, callback) {
    var ids = Object.keys(missingRevs);
    var generationOneIds = ids.filter(function(id) {
      var missing = missingRevs[id].missing;
      return missing.length === 1 && parseInt(missing[0], 10) === 1;
    });
    var otherIds = ids.filter(function(id) {
      var missing = missingRevs[id].missing;
      return missing.length > 1 || parseInt(missing[0], 10) > 1;
    });
    
    // TODO: get generation one revisions and the other revisions should be done
    // paralell.
    getGenerationOneRevisions(generationOneIds, function(err, generationOneDocs) {
      async.map(otherIds, function(id, next) {
        var revs = missingRevs[id].missing;
        var knownRevs = [];
        async.mapSeries(revs, function(rev, cb) {
          options.source.get(id, {
            rev: rev,
            revs: true,
            attachments: true,
            atts_since: knownRevs
          }, cb);
          knownRevs.push(rev);
        }, next);
      }, function(err, docs) {
        // concat and flatten result
        callback(err, generationOneDocs.concat.apply(generationOneDocs, docs));
      });
    });
  }

  function getGenerationOneRevisions(ids, callback) {
    if (!ids.length) {
      return callback(null, []);
    }
    
    options.source.fetch({
      keys: ids
    }, {
      include_docs: true
    }, function(err, docs) {
      docs = docs.rows.map(function(row) { return row.doc; });

      // fetch attachments
      async.map(docs, function(doc, next) {
        if (!doc._attachments || !Object.keys(doc._attachments).length) {
          return next(null, doc);
        }

        // TODO: an optimisation would be to only fetch the attachments via
        // standalone attachments api and then encode them base64 and construct
        // the attachment stub
        options.source.get(doc._id, {
          attachments: true
        }, next);
      }, callback);
    });
  }

  // Collect a group of revisions fetched by the previous step, and store them
  // into the target database using the _bulk_docs API, with the new_edits:false
  // JSON property to preserve their revision IDs.
  function saveRevisions(docs, callback) {
    options.target.bulk({
      docs: docs,
      new_edits: false
    }, callback);
  }

  // After a group of revisions is stored, save a checkpoint: update the last
  // source sequence ID value in the target database. It should be the latest
  // sequence ID for which its revision and all prior to it have been added to
  // the target. (Even if some revisions are rejected by a target validation
  // handler, they still count as ‘added’ for this purpose.)
  function storeCheckpoint(changes, checkpointDoc, callback) {
    checkpointDoc.checkpoint = changes.last_seq;
    options.target.insert(checkpointDoc, callback);
  }

  getCheckpointDoc(function(err, checkpointDoc) {
    if (err) {
     return callback(err);
    }
    getChanges(checkpointDoc, function(err, changes) {
      if (err) {
       return callback(err);
      }
      getRevsDiff(changes, function(err, missingRevs) {
        if (err) {
         return callback(err);
        }
        getRevisions(missingRevs, function(err, docs) {
          if (err) {
           return callback(err);
          }
          saveRevisions(docs, function(err) {
            if (err) {
             return callback(err);
            }
            storeCheckpoint(changes, checkpointDoc, function(err) {
              if (err) {
               return callback(err);
              }
              if (changes.results.length === options.batch_size) {
                return replicate(options, callback);
              }

              if (options.continuous) {
                options.firstRunComplete = true;
                callback(null, {
                  ok: true
                });
                return replicate(options, callback);
              }

              callback(null, {
                ok: true
              });
            });
          });
        });
      });
    });
  });

  return {
    cancel: function() {
      changes.abort();
    }
  };
};
