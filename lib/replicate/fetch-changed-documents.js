/*
 * Roy Replicator
 * https://github.com/jo/roy-replicator
 *
 * Fetch Changed Documents
 *
 * Copyright (c) 2013 Johannes J. Schmidt
 * Licensed under the MIT license.
 */

'use strict';

var async = require('async');

// Fetch all document leaf revisions from source that are missed at target.
// Use previously calculated revisions difference which defined all missed documents and their
// revisions.
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

  state.docs = [];
  state.docs_read = state.docs_read || 0;

  // only process if we have changed docs
  if (!state.changedDocs) {
    return callback(null, {
      ok: true,
      docs: state.docs
    });
  }

  var missingRevs = state.changedDocs;
  var ids = Object.keys(missingRevs);

  // abort on empty changed docs
  if (!ids.length) {
    return callback(null, {
      ok: true,
      docs: state.docs
    });
  }

  // To fetch the document make `GET /{db}/{docid}` request with the following
  // query parameters:
  //
  // `revs=true`: Instructs the source to include list of all known revisions into
  // the document at _revisions field. This information is needed to synchronize
  // document’s ancestors history between source and target.
  //
  // The open_revs query parameter contains value as JSON array with list of
  // leaf revisions that are need to be fetched. If specified revision
  // exists, document is returned for this revision. Otherwise, source
  // returns object with single field missing with missed revision as
  // value. In case when document contains attachments source returns
  // information only for those ones that had been changed (added or updated)
  // since specified revision values. If attachment was deleted, document
  // has stub information for him.
  // 
  // `latest=true` ensures that source will return latest document
  // revision regardless which one was specified in `open_revs` query
  // parameter. This parameter solves race condition problem when
  // requested document may be changed in between this step and handling
  // related event on changes feed.
  function fetch(id, next) {
    options.source.get(id, {
      revs: true,
      attachments: true,
      latest: true,
      open_revs: JSON.stringify(state.changedDocs[id].missing)
    }, next);
  }


  function fetchSingleDocuments(ids, next) {
    if (!ids.length) {
      return next(null);
    }

    async.mapLimit(ids, config.max_requests || 4, fetch, function(err, body) {
      if (err) {
        return next(err);
      }

      var docs = body.reduce(function(memo, arr) {
        return arr.reduce(function(m, d) {
          if (d.ok) {
            m.push(d.ok);
          }
          return m;
        }, memo);
      }, []);

      state.docs = state.docs.concat(docs);
      state.docs_read += docs.length;

      next(null);
    });
  }

  // A limited case of the above-mentioned bulk-get optimization is possible
  // with the current API: revisions of generation 1 (revision ID starts with
  // “1-”) can be fetched in bulk via _all_docs, because by definition they have
  // no revision histories. Unfortunately _all_docs can’t include attachment
  // bodies, so if it returns a document whose JSON indicates it has
  // attachments, those will have to be fetched separately. Nonetheless, this
  // optimization can help significantly, and is currently implemented in
  // TouchDB.
  function fetchGenerationOne(ids, next) {
    if (!ids.length) {
      return next(null);
    }

    options.source.allDocs({
      keys: ids,
      include_docs: true
    }, function(err, result) {
      if (err) {
        return next(err);
      }

      // Collect documents which have to be fetched again using single fetch.
      // Those are documents which
      // * are deleted
      // * have attachments
      // * or have changed since the current batch
      var docs = result.rows.reduce(function(memo, row) {
        var outstanding = row.value.deleted ||
          (row.doc._attachments && Object.keys(row.doc._attachments).length > 0) ||
          parseInt(row.doc._rev, 10) > 1;
        
        if (outstanding) {
          memo.outstandingIds.push(row.id);
          return memo;
        }

        row.doc._revisions = {
          start: 1,
          ids: [
            row.doc._rev.split('-')[1]
          ]
        };
        memo.completedDocs.push(row.doc);

        return memo;
      }, { completedDocs: [], outstandingIds: [] });

      state.docs = state.docs.concat(docs.completedDocs);
      state.docs_read += docs.completedDocs.length;

      if (!docs.outstandingIds.length) {
        return next(null);
      }

      fetchSingleDocuments(docs.outstandingIds, next);
    });
  }



  // TODO: think about fetching revisions and attachments via multipart/related request
  //       or fetch attachments via standalone attachments api

  var generationOneIds = ids.filter(function(id) {
    var missing = missingRevs[id].missing;
    return missing.length === 1 && parseInt(missing[0], 10) === 1;
  });

  fetchGenerationOne(generationOneIds, function(err) {
    if (err) {
      return callback(err);
    }

    var otherIds = ids.filter(function(id) {
      var missing = missingRevs[id].missing;
      return missing.length > 1 || parseInt(missing[0], 10) > 1;
    });

    fetchSingleDocuments(otherIds, function(err) {
      if (err) {
        return callback(err);
      }

      // only process if we have docs to upload
      if (!state.docs || !state.docs.length) {
        return callback(null, {
          ok: true,
          docs: []
        });
      }

      callback(null, {
        ok: true,
        docs: state.docs
      });
    });
  });
};
