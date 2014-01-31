/*
 * Roy Replicator
 * https://github.com/jo/roy-replicator
 *
 * Replicate Documents
 *
 * Copyright (c) 2013 Johannes J. Schmidt
 * Licensed under the MIT license.
 */

'use strict';

var async = require('async');

// Fetch all document leaf revisions from source that are missed at target.
// Use previously calculated revisions difference which defined all missed documents and their
// revisions.
// Then upload previously fetched documents.
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

  // only process if we have changed docs
  if (!state.changedDocs) {
    state.docs = [];

    return callback(null, {
      ok: true,
      docs: state.docs
    });
  }

  var ids = Object.keys(state.changedDocs);

  // abort on empty changed docs
  if (!ids.length) {
    state.docs = [];

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
      open_revs: JSON.stringify(state.changedDocs[id].missing),
      attachments: true,
      latest: true
    }, next);
  }

  // To upload multiple documents with single shot, send a `POST /{db}/_bulk_docs`
  // request to target with payload as JSON object contained
  // next mandatory fields:
  //
  // `docs` (array of objects): list of document objects to update on target.
  // These documents must contain `_revisions` field that holds list of its full
  // revision history to let target create leaf revision that correctly
  // preserve the documents ancestry.
  //
  // `new_edits` (boolean): special flag that instructs target to store
  // documents with specified revision value as-is without
  // generating new one. Always false.

  // The request may also contain an `X-Couch-Full-Commit` header that controls
  // CouchDB commit policy.
  function upload(body, next) {
    var docs = body.reduce(function(memo, arr) {
      return arr.reduce(function(m, d) {
        if (d.ok) {
          m.push(d.ok);
        }
        return m;
      }, memo);
    }, []);

    options.target.bulkDocs({
      new_edits: false,
      docs: docs
    }, next);
  }

  // TODO: upload attachments separately

  // TODO: think about fetching revisions and attachments via multipart/related request
  //       or fetch attachments via standalone attachments api
  // TODO: optimize by fetching  generation one documents in one go via bulk docs api.

  async.mapLimit(ids, config.max_requests || 100, fetch, function(err, docs) {
    if (err) {
      return callback(err);
    }

    state.docs = docs;
    state.docs_read += docs.length;

    // only process if we have docs to upload
    if (!state.docs || !state.docs.length) {
      return callback(null, {
        ok: true,
        docs: []
      });
    }

    var uploadedDocs = state.docs;
    upload(uploadedDocs, function(err) {
      if (err) {
        return callback(err);
      }

      state.uploadedDocs = state.docs;

      // TODO: check if upload was successful
      state.docs_written += uploadedDocs.length;

      // TODO: count doc_write_failures

      callback(null, {
        ok: true,
        docs: state.docs,
        uploadedDocs: state.uploadedDocs
      });
    });
  });
};
