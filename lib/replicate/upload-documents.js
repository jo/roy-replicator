/*
 * Roy Replicator
 * https://github.com/jo/roy-replicator
 *
 * Upload Documents
 * - batch of documents
 * - document with attachments
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

  // only process if we have docs to upload
  if (!state.docs) {
    return callback(null, {
      ok: true
    });
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
  function upload(docs, next) {
    options.target.bulkDocs({
      new_edits: false,
      docs: docs
    }, next);
  }

  // TODO: upload attachments separately

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
      uploadedDocs: state.uploadedDocs
    });
  });
};
