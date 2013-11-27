;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
*
*  MD5 (Message-Digest Algorithm)
*
*  For original source see http://www.webtoolkit.info/
*  Download: 15.02.2009 from http://www.webtoolkit.info/javascript-md5.html
*
*  Licensed under CC-BY 2.0 License
*  (http://creativecommons.org/licenses/by/2.0/uk/)
*
**/

var Crypto = {};

(function() {
  Crypto.MD5 = function(string) {

    function RotateLeft(lValue, iShiftBits) {
      return (lValue<<iShiftBits) | (lValue>>>(32-iShiftBits));
    }

    function AddUnsigned(lX,lY) {
      var lX4,lY4,lX8,lY8,lResult;
      lX8 = (lX & 0x80000000);
      lY8 = (lY & 0x80000000);
      lX4 = (lX & 0x40000000);
      lY4 = (lY & 0x40000000);
      lResult = (lX & 0x3FFFFFFF)+(lY & 0x3FFFFFFF);
      if (lX4 & lY4) {
        return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
      }
      if (lX4 | lY4) {
        if (lResult & 0x40000000) {
          return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
        } else {
          return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
        }
      } else {
        return (lResult ^ lX8 ^ lY8);
      }
    }

    function F(x,y,z) { return (x & y) | ((~x) & z); }
    function G(x,y,z) { return (x & z) | (y & (~z)); }
    function H(x,y,z) { return (x ^ y ^ z); }
    function I(x,y,z) { return (y ^ (x | (~z))); }

    function FF(a,b,c,d,x,s,ac) {
      a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
      return AddUnsigned(RotateLeft(a, s), b);
    };

    function GG(a,b,c,d,x,s,ac) {
      a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
      return AddUnsigned(RotateLeft(a, s), b);
    };

    function HH(a,b,c,d,x,s,ac) {
      a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
      return AddUnsigned(RotateLeft(a, s), b);
    };

    function II(a,b,c,d,x,s,ac) {
      a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
      return AddUnsigned(RotateLeft(a, s), b);
    };

    function ConvertToWordArray(string) {
      var lWordCount;
      var lMessageLength = string.length;
      var lNumberOfWords_temp1=lMessageLength + 8;
      var lNumberOfWords_temp2=(lNumberOfWords_temp1-(lNumberOfWords_temp1 % 64))/64;
      var lNumberOfWords = (lNumberOfWords_temp2+1)*16;
      var lWordArray=Array(lNumberOfWords-1);
      var lBytePosition = 0;
      var lByteCount = 0;
      while ( lByteCount < lMessageLength ) {
        lWordCount = (lByteCount-(lByteCount % 4))/4;
        lBytePosition = (lByteCount % 4)*8;
        lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount)<<lBytePosition));
        lByteCount++;
      }
      lWordCount = (lByteCount-(lByteCount % 4))/4;
      lBytePosition = (lByteCount % 4)*8;
      lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80<<lBytePosition);
      lWordArray[lNumberOfWords-2] = lMessageLength<<3;
      lWordArray[lNumberOfWords-1] = lMessageLength>>>29;
      return lWordArray;
    };

    function WordToHex(lValue) {
      var WordToHexValue="",WordToHexValue_temp="",lByte,lCount;
      for (lCount = 0;lCount<=3;lCount++) {
        lByte = (lValue>>>(lCount*8)) & 255;
        WordToHexValue_temp = "0" + lByte.toString(16);
        WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length-2,2);
      }
      return WordToHexValue;
    };

    //**	function Utf8Encode(string) removed. Aready defined in pidcrypt_utils.js

    var x=Array();
    var k,AA,BB,CC,DD,a,b,c,d;
    var S11=7, S12=12, S13=17, S14=22;
    var S21=5, S22=9 , S23=14, S24=20;
    var S31=4, S32=11, S33=16, S34=23;
    var S41=6, S42=10, S43=15, S44=21;

    //	string = Utf8Encode(string); #function call removed

    x = ConvertToWordArray(string);

    a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;

    for (k=0;k<x.length;k+=16) {
      AA=a; BB=b; CC=c; DD=d;
      a=FF(a,b,c,d,x[k+0], S11,0xD76AA478);
      d=FF(d,a,b,c,x[k+1], S12,0xE8C7B756);
      c=FF(c,d,a,b,x[k+2], S13,0x242070DB);
      b=FF(b,c,d,a,x[k+3], S14,0xC1BDCEEE);
      a=FF(a,b,c,d,x[k+4], S11,0xF57C0FAF);
      d=FF(d,a,b,c,x[k+5], S12,0x4787C62A);
      c=FF(c,d,a,b,x[k+6], S13,0xA8304613);
      b=FF(b,c,d,a,x[k+7], S14,0xFD469501);
      a=FF(a,b,c,d,x[k+8], S11,0x698098D8);
      d=FF(d,a,b,c,x[k+9], S12,0x8B44F7AF);
      c=FF(c,d,a,b,x[k+10],S13,0xFFFF5BB1);
      b=FF(b,c,d,a,x[k+11],S14,0x895CD7BE);
      a=FF(a,b,c,d,x[k+12],S11,0x6B901122);
      d=FF(d,a,b,c,x[k+13],S12,0xFD987193);
      c=FF(c,d,a,b,x[k+14],S13,0xA679438E);
      b=FF(b,c,d,a,x[k+15],S14,0x49B40821);
      a=GG(a,b,c,d,x[k+1], S21,0xF61E2562);
      d=GG(d,a,b,c,x[k+6], S22,0xC040B340);
      c=GG(c,d,a,b,x[k+11],S23,0x265E5A51);
      b=GG(b,c,d,a,x[k+0], S24,0xE9B6C7AA);
      a=GG(a,b,c,d,x[k+5], S21,0xD62F105D);
      d=GG(d,a,b,c,x[k+10],S22,0x2441453);
      c=GG(c,d,a,b,x[k+15],S23,0xD8A1E681);
      b=GG(b,c,d,a,x[k+4], S24,0xE7D3FBC8);
      a=GG(a,b,c,d,x[k+9], S21,0x21E1CDE6);
      d=GG(d,a,b,c,x[k+14],S22,0xC33707D6);
      c=GG(c,d,a,b,x[k+3], S23,0xF4D50D87);
      b=GG(b,c,d,a,x[k+8], S24,0x455A14ED);
      a=GG(a,b,c,d,x[k+13],S21,0xA9E3E905);
      d=GG(d,a,b,c,x[k+2], S22,0xFCEFA3F8);
      c=GG(c,d,a,b,x[k+7], S23,0x676F02D9);
      b=GG(b,c,d,a,x[k+12],S24,0x8D2A4C8A);
      a=HH(a,b,c,d,x[k+5], S31,0xFFFA3942);
      d=HH(d,a,b,c,x[k+8], S32,0x8771F681);
      c=HH(c,d,a,b,x[k+11],S33,0x6D9D6122);
      b=HH(b,c,d,a,x[k+14],S34,0xFDE5380C);
      a=HH(a,b,c,d,x[k+1], S31,0xA4BEEA44);
      d=HH(d,a,b,c,x[k+4], S32,0x4BDECFA9);
      c=HH(c,d,a,b,x[k+7], S33,0xF6BB4B60);
      b=HH(b,c,d,a,x[k+10],S34,0xBEBFBC70);
      a=HH(a,b,c,d,x[k+13],S31,0x289B7EC6);
      d=HH(d,a,b,c,x[k+0], S32,0xEAA127FA);
      c=HH(c,d,a,b,x[k+3], S33,0xD4EF3085);
      b=HH(b,c,d,a,x[k+6], S34,0x4881D05);
      a=HH(a,b,c,d,x[k+9], S31,0xD9D4D039);
      d=HH(d,a,b,c,x[k+12],S32,0xE6DB99E5);
      c=HH(c,d,a,b,x[k+15],S33,0x1FA27CF8);
      b=HH(b,c,d,a,x[k+2], S34,0xC4AC5665);
      a=II(a,b,c,d,x[k+0], S41,0xF4292244);
      d=II(d,a,b,c,x[k+7], S42,0x432AFF97);
      c=II(c,d,a,b,x[k+14],S43,0xAB9423A7);
      b=II(b,c,d,a,x[k+5], S44,0xFC93A039);
      a=II(a,b,c,d,x[k+12],S41,0x655B59C3);
      d=II(d,a,b,c,x[k+3], S42,0x8F0CCC92);
      c=II(c,d,a,b,x[k+10],S43,0xFFEFF47D);
      b=II(b,c,d,a,x[k+1], S44,0x85845DD1);
      a=II(a,b,c,d,x[k+8], S41,0x6FA87E4F);
      d=II(d,a,b,c,x[k+15],S42,0xFE2CE6E0);
      c=II(c,d,a,b,x[k+6], S43,0xA3014314);
      b=II(b,c,d,a,x[k+13],S44,0x4E0811A1);
      a=II(a,b,c,d,x[k+4], S41,0xF7537E82);
      d=II(d,a,b,c,x[k+11],S42,0xBD3AF235);
      c=II(c,d,a,b,x[k+2], S43,0x2AD7D2BB);
      b=II(b,c,d,a,x[k+9], S44,0xEB86D391);
      a=AddUnsigned(a,AA);
      b=AddUnsigned(b,BB);
      c=AddUnsigned(c,CC);
      d=AddUnsigned(d,DD);
    }
    var temp = WordToHex(a)+WordToHex(b)+WordToHex(c)+WordToHex(d);
    return temp.toLowerCase();
  }
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Crypto;
}
},{}],2:[function(require,module,exports){
// BEGIN Math.uuid.js

/*!
Math.uuid.js (v1.4)
http://www.broofa.com
mailto:robert@broofa.com

Copyright (c) 2010 Robert Kieffer
Dual licensed under the MIT and GPL licenses.
*/

/*
 * Generate a random uuid.
 *
 * USAGE: Math.uuid(length, radix)
 *   length - the desired number of characters
 *   radix  - the number of allowable values for each character.
 *
 * EXAMPLES:
 *   // No arguments  - returns RFC4122, version 4 ID
 *   >>> Math.uuid()
 *   "92329D39-6F5C-4520-ABFC-AAB64544E172"
 *
 *   // One argument - returns ID of the specified length
 *   >>> Math.uuid(15)     // 15 character ID (default base=62)
 *   "VcydxgltxrVZSTV"
 *
 *   // Two arguments - returns ID of the specified length, and radix. (Radix must be <= 62)
 *   >>> Math.uuid(8, 2)  // 8 character ID (base=2)
 *   "01001010"
 *   >>> Math.uuid(8, 10) // 8 character ID (base=10)
 *   "47473046"
 *   >>> Math.uuid(8, 16) // 8 character ID (base=16)
 *   "098F4D35"
 */
var uuid;

(function() {

  var CHARS = (
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
    'abcdefghijklmnopqrstuvwxyz'
    ).split('');

  uuid = function uuid_inner(len, radix) {
    var chars = CHARS;
    var uuidInner = [];
    var i;

    radix = radix || chars.length;

    if (len) {
      // Compact form
      for (i = 0; i < len; i++) uuidInner[i] = chars[0 | Math.random()*radix];
    } else {
      // rfc4122, version 4 form
      var r;

      // rfc4122 requires these characters
      uuidInner[8] = uuidInner[13] = uuidInner[18] = uuidInner[23] = '-';
      uuidInner[14] = '4';

      // Fill in random data.  At i==19 set the high bits of clock sequence as
      // per rfc4122, sec. 4.1.5
      for (i = 0; i < 36; i++) {
        if (!uuidInner[i]) {
          r = 0 | Math.random()*16;
          uuidInner[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
        }
      }
    }

    return uuidInner.join('');
  };

})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = uuid;
}

},{}],3:[function(require,module,exports){
/*
 * Roy Replicator
 * https://github.com/jo/roy-replicator
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

},{"./prepare/find-common-ancestry":4,"./prepare/generate-replication-id":5,"./prepare/get-peers-information":6,"./prepare/verify-peers":7,"async":14}],4:[function(require,module,exports){
/*
 * Roy Replicator
 * https://github.com/jo/roy-replicator
 *
 * Find out Common Ancestry
 * - Retrieve replication logs
 * - Compare replication logs
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

  function getReplicationDoc(db, next) {
    db.get('_local/' + state.id, function(err, doc) {
      // its not an error if doc does not exist
      if (err && err.error === 'not_found') {
        return next(null, null);
      }
      next(err, doc);
    });
  }

  function compare(source, target) {
    if (!source || !target) {
      return null;
    }

    // Compare session_id values for the chronological last session - if they
    // match, source and target has common replication history and it seems
    // to be valid.
    // Use `source_last_seq` value for startup checkpoint.
    if (source.session_id === target.session_id) {
      return source.source_last_seq;
    }

    // In case of mismatch, iterate over history collection to search the
    // latest (chronologically) common session_id for source and target.
    // Use value of `recorded_seq` field as startup checkpoint.
    // TODO: I think this should be optimized.
    var histories = source.history.filter(function(sourceHistory) {
      var targetHistories = target.history.filter(function(targetHistory) {
        return targetHistory.session_id === sourceHistory.session_id;
      });

      return targetHistories.length;
    });
    
    if (!histories.length) {
      return null;
    }

    return histories[0].recorded_seq;
  }

  async.map([options.source, options.target], getReplicationDoc, function(err, response) {
    if (err) {
      return callback(err);
    }

    state.replicationDocs = {
      source: response[0],
      target: response[1]
    };
    state.start_last_seq = compare(response[0], response[1]);

    callback(null, {
      ok: true,
      start_last_seq: state.start_last_seq
    });
  });
};

},{"async":14}],5:[function(require,module,exports){
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

},{"../../deps/md5":1}],6:[function(require,module,exports){
/*
 * Roy Replicator
 * https://github.com/jo/roy-replicator
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

},{"async":14}],7:[function(require,module,exports){
/*
 * Roy Replicator
 * https://github.com/jo/roy-replicator
 *
 * Verify Peers
 *
 * Copyright (c) 2013 Johannes J. Schmidt
 * Licensed under the MIT license.
 */

'use strict';

var async = require('async');

// Ensure that both source and target exists via (parallel) HEAD requests.
// If source does not exist, abort with an `db_not_found` error.
// In case target does not exist, create the target if `options.create_target` is
// set, otherwise abort with an `db_not_found` error.
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

  function exist(db, next) {
    db.exists(next);
  }

  async.map([options.source, options.target], exist, function(err, response) {
    if (err) {
      return callback(err);
    }

    var sourceExists = response[0].ok;
    if (!sourceExists) {
      return callback({
        error: 'db_not_found',
        reason: 'could not open source'
      });
    }

    var targetExists = response[1].ok;
    if (!targetExists) {
      if (options.create_target) {
        return options.target.create(function(err) {
          if (err) {
            return callback(err);
          }
          
          callback(null, { ok: true });
        });
      } else {
        return callback({
          error: 'db_not_found',
          reason: 'could not open target'
        });
      }
    }

    callback(null, { ok: true });
  });
};

},{"async":14}],8:[function(require,module,exports){
/*
 * Roy Replicator
 * https://github.com/jo/roy-replicator
 *
 * Replicate
 * - Locate changed documents
 * - Fetch changed documents
 * - Upload changed documents
 * - Ensure full commit
 * - Record replication checkpoint
 *
 * Copyright (c) 2013 Johannes J. Schmidt
 * Licensed under the MIT license.
 */

'use strict';

var locateChangedDocuments = require('./replicate/locate-changed-documents');
var fetchChangedDocuments = require('./replicate/fetch-changed-documents');
var uploadDocuments = require('./replicate/upload-documents');
var ensureFullCommit = require('./replicate/ensure-full-commit');
var recordReplicationCheckpoint = require('./replicate/record-replication-checkpoint');

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

  // Replicate until there are no more docs to replicate.
  var replicatedOnce = false;
  var lastMissingChecked = state.missing_checked;
  function replicate() {
    function run(action, next) {
      action(options, config, state, next);
    }

    async.eachSeries([
      locateChangedDocuments,
      fetchChangedDocuments,
      uploadDocuments,
      ensureFullCommit,
      recordReplicationCheckpoint
    ], run, function(err) {
      if (err) {
        return callback(err);
      }

      if (replicatedOnce && !state.missing_checked) {
        return callback(null, {
          ok: true,
          no_changes: !state.missing_checked
        });
      }

      if (replicatedOnce && lastMissingChecked === state.missing_checked) {
        return callback(null, {
          ok: true,
          session_id: state.session_id,
          source_last_seq: state.end_last_seq,
          replication_id_version: state.id_version,
          history: [
            {
              session_id: state.session_id,
              start_time: state.start_time,
              end_time: new Date(),
              start_last_seq: state.start_last_seq,
              end_last_seq: state.end_last_seq,
              recorded_seq: state.recorded_seq,
              missing_checked: state.missing_checked,
              missing_found: state.missing_found,
              docs_read: state.docs_read,
              docs_written: state.docs_written,
              doc_write_failures: state.doc_write_failures
            }
          ]
        });
      }

      replicatedOnce = true;
      lastMissingChecked = state.missing_checked;
      replicate();
    });
  }

  replicate();
};

},{"./replicate/ensure-full-commit":9,"./replicate/fetch-changed-documents":10,"./replicate/locate-changed-documents":11,"./replicate/record-replication-checkpoint":12,"./replicate/upload-documents":13,"async":14}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
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

  // TODO: think about fetching revisions and attachments via multipart/related request
  //       or fetch attachments via standalone attachments api
  // TODO: optimize by fetching  generation one documents in one go via bulk docs api.

  async.mapLimit(ids, config.max_requests || 100, fetch, function(err, docs) {
    if (err) {
      return callback(err);
    }

    state.docs = docs;
    state.docs_read += docs.length;

    callback(null, {
      ok: true,
      docs: state.docs
    });
  });
};

},{"async":14}],11:[function(require,module,exports){
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

},{}],12:[function(require,module,exports){
/*
 * Roy Replicator
 * https://github.com/jo/roy-replicator
 *
 * Record Replication Checkpoint
 *
 * Copyright (c) 2013 Johannes J. Schmidt
 * Licensed under the MIT license.
 */

'use strict';

var async = require('async');

// Since batch of changes was uploaded and committed successfully, replicator
// updates replication log both on source and target recording current
// replication state.
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

  var history = {
    session_id: state.session_id,
    start_time: state.start_time,
    end_time: new Date(),
    missing_checked: state.missing_checked,
    missing_found: state.missing_found,
    docs_read: state.docs ? state.docs.length : 0,
    // TODO: at the moment we expect every read doc was also written
    docs_written: state.docs ? state.docs.length : 0,
    // TODO: at the moment we do not count write failures
    doc_write_failures: 0,
    start_last_seq: state.start_last_seq,
    recorded_seq: state.end_last_seq,
    end_last_seq: state.end_last_seq
  };

  state.replicationDocs = state.replicationDocs || {};
  if (!state.replicationDocs.source) {
    state.replicationDocs.source = {
      _id: '_local/' + state.id,
      replication_id_version: state.id_version
    };
  }
  if (!state.replicationDocs.target) {
    state.replicationDocs.target = {
      _id: '_local/' + state.id,
      replication_id_version: state.id_version
    };
  }

  function saveReplicationDoc(ep, next) {
    ep.doc.session_id = history.session_id;
    ep.doc.source_last_seq = history.recorded_seq;
    ep.doc.history = ep.doc.history || [];
    ep.doc.history.unshift(history);

    ep.db.put(ep.doc, function(err, doc) {
      // its not an error if doc does not exist
      if (err && err.error === 'not_found') {
        return next(null, null);
      }
      next(err, doc);
    });
  }

  async.map([
    { db: options.source, doc: state.replicationDocs.source },
    { db: options.target, doc: state.replicationDocs.target }
  ], saveReplicationDoc, function(err, response) {
    if (err) {
      return callback(err);
    }

    state.recorded_seq = state.end_last_seq;

    state.replicationDocs.source._rev = response[0].rev;
    state.replicationDocs.target._rev = response[1].rev;

    callback(null, {
      ok: true,
      replicationDocs: state.replicationDocs
    });
  });
};

},{"async":14}],13:[function(require,module,exports){
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

},{}],14:[function(require,module,exports){
var process=require("__browserify_process");/*global setImmediate: false, setTimeout: false, console: false */
(function () {

    var async = {};

    // global on the server, window in the browser
    var root, previous_async;

    root = this;
    if (root != null) {
      previous_async = root.async;
    }

    async.noConflict = function () {
        root.async = previous_async;
        return async;
    };

    function only_once(fn) {
        var called = false;
        return function() {
            if (called) throw new Error("Callback was already called.");
            called = true;
            fn.apply(root, arguments);
        }
    }

    //// cross-browser compatiblity functions ////

    var _each = function (arr, iterator) {
        if (arr.forEach) {
            return arr.forEach(iterator);
        }
        for (var i = 0; i < arr.length; i += 1) {
            iterator(arr[i], i, arr);
        }
    };

    var _map = function (arr, iterator) {
        if (arr.map) {
            return arr.map(iterator);
        }
        var results = [];
        _each(arr, function (x, i, a) {
            results.push(iterator(x, i, a));
        });
        return results;
    };

    var _reduce = function (arr, iterator, memo) {
        if (arr.reduce) {
            return arr.reduce(iterator, memo);
        }
        _each(arr, function (x, i, a) {
            memo = iterator(memo, x, i, a);
        });
        return memo;
    };

    var _keys = function (obj) {
        if (Object.keys) {
            return Object.keys(obj);
        }
        var keys = [];
        for (var k in obj) {
            if (obj.hasOwnProperty(k)) {
                keys.push(k);
            }
        }
        return keys;
    };

    //// exported async module functions ////

    //// nextTick implementation with browser-compatible fallback ////
    if (typeof process === 'undefined' || !(process.nextTick)) {
        if (typeof setImmediate === 'function') {
            async.nextTick = function (fn) {
                // not a direct alias for IE10 compatibility
                setImmediate(fn);
            };
            async.setImmediate = async.nextTick;
        }
        else {
            async.nextTick = function (fn) {
                setTimeout(fn, 0);
            };
            async.setImmediate = async.nextTick;
        }
    }
    else {
        async.nextTick = process.nextTick;
        if (typeof setImmediate !== 'undefined') {
            async.setImmediate = setImmediate;
        }
        else {
            async.setImmediate = async.nextTick;
        }
    }

    async.each = function (arr, iterator, callback) {
        callback = callback || function () {};
        if (!arr.length) {
            return callback();
        }
        var completed = 0;
        _each(arr, function (x) {
            iterator(x, only_once(function (err) {
                if (err) {
                    callback(err);
                    callback = function () {};
                }
                else {
                    completed += 1;
                    if (completed >= arr.length) {
                        callback(null);
                    }
                }
            }));
        });
    };
    async.forEach = async.each;

    async.eachSeries = function (arr, iterator, callback) {
        callback = callback || function () {};
        if (!arr.length) {
            return callback();
        }
        var completed = 0;
        var iterate = function () {
            iterator(arr[completed], function (err) {
                if (err) {
                    callback(err);
                    callback = function () {};
                }
                else {
                    completed += 1;
                    if (completed >= arr.length) {
                        callback(null);
                    }
                    else {
                        iterate();
                    }
                }
            });
        };
        iterate();
    };
    async.forEachSeries = async.eachSeries;

    async.eachLimit = function (arr, limit, iterator, callback) {
        var fn = _eachLimit(limit);
        fn.apply(null, [arr, iterator, callback]);
    };
    async.forEachLimit = async.eachLimit;

    var _eachLimit = function (limit) {

        return function (arr, iterator, callback) {
            callback = callback || function () {};
            if (!arr.length || limit <= 0) {
                return callback();
            }
            var completed = 0;
            var started = 0;
            var running = 0;

            (function replenish () {
                if (completed >= arr.length) {
                    return callback();
                }

                while (running < limit && started < arr.length) {
                    started += 1;
                    running += 1;
                    iterator(arr[started - 1], function (err) {
                        if (err) {
                            callback(err);
                            callback = function () {};
                        }
                        else {
                            completed += 1;
                            running -= 1;
                            if (completed >= arr.length) {
                                callback();
                            }
                            else {
                                replenish();
                            }
                        }
                    });
                }
            })();
        };
    };


    var doParallel = function (fn) {
        return function () {
            var args = Array.prototype.slice.call(arguments);
            return fn.apply(null, [async.each].concat(args));
        };
    };
    var doParallelLimit = function(limit, fn) {
        return function () {
            var args = Array.prototype.slice.call(arguments);
            return fn.apply(null, [_eachLimit(limit)].concat(args));
        };
    };
    var doSeries = function (fn) {
        return function () {
            var args = Array.prototype.slice.call(arguments);
            return fn.apply(null, [async.eachSeries].concat(args));
        };
    };


    var _asyncMap = function (eachfn, arr, iterator, callback) {
        var results = [];
        arr = _map(arr, function (x, i) {
            return {index: i, value: x};
        });
        eachfn(arr, function (x, callback) {
            iterator(x.value, function (err, v) {
                results[x.index] = v;
                callback(err);
            });
        }, function (err) {
            callback(err, results);
        });
    };
    async.map = doParallel(_asyncMap);
    async.mapSeries = doSeries(_asyncMap);
    async.mapLimit = function (arr, limit, iterator, callback) {
        return _mapLimit(limit)(arr, iterator, callback);
    };

    var _mapLimit = function(limit) {
        return doParallelLimit(limit, _asyncMap);
    };

    // reduce only has a series version, as doing reduce in parallel won't
    // work in many situations.
    async.reduce = function (arr, memo, iterator, callback) {
        async.eachSeries(arr, function (x, callback) {
            iterator(memo, x, function (err, v) {
                memo = v;
                callback(err);
            });
        }, function (err) {
            callback(err, memo);
        });
    };
    // inject alias
    async.inject = async.reduce;
    // foldl alias
    async.foldl = async.reduce;

    async.reduceRight = function (arr, memo, iterator, callback) {
        var reversed = _map(arr, function (x) {
            return x;
        }).reverse();
        async.reduce(reversed, memo, iterator, callback);
    };
    // foldr alias
    async.foldr = async.reduceRight;

    var _filter = function (eachfn, arr, iterator, callback) {
        var results = [];
        arr = _map(arr, function (x, i) {
            return {index: i, value: x};
        });
        eachfn(arr, function (x, callback) {
            iterator(x.value, function (v) {
                if (v) {
                    results.push(x);
                }
                callback();
            });
        }, function (err) {
            callback(_map(results.sort(function (a, b) {
                return a.index - b.index;
            }), function (x) {
                return x.value;
            }));
        });
    };
    async.filter = doParallel(_filter);
    async.filterSeries = doSeries(_filter);
    // select alias
    async.select = async.filter;
    async.selectSeries = async.filterSeries;

    var _reject = function (eachfn, arr, iterator, callback) {
        var results = [];
        arr = _map(arr, function (x, i) {
            return {index: i, value: x};
        });
        eachfn(arr, function (x, callback) {
            iterator(x.value, function (v) {
                if (!v) {
                    results.push(x);
                }
                callback();
            });
        }, function (err) {
            callback(_map(results.sort(function (a, b) {
                return a.index - b.index;
            }), function (x) {
                return x.value;
            }));
        });
    };
    async.reject = doParallel(_reject);
    async.rejectSeries = doSeries(_reject);

    var _detect = function (eachfn, arr, iterator, main_callback) {
        eachfn(arr, function (x, callback) {
            iterator(x, function (result) {
                if (result) {
                    main_callback(x);
                    main_callback = function () {};
                }
                else {
                    callback();
                }
            });
        }, function (err) {
            main_callback();
        });
    };
    async.detect = doParallel(_detect);
    async.detectSeries = doSeries(_detect);

    async.some = function (arr, iterator, main_callback) {
        async.each(arr, function (x, callback) {
            iterator(x, function (v) {
                if (v) {
                    main_callback(true);
                    main_callback = function () {};
                }
                callback();
            });
        }, function (err) {
            main_callback(false);
        });
    };
    // any alias
    async.any = async.some;

    async.every = function (arr, iterator, main_callback) {
        async.each(arr, function (x, callback) {
            iterator(x, function (v) {
                if (!v) {
                    main_callback(false);
                    main_callback = function () {};
                }
                callback();
            });
        }, function (err) {
            main_callback(true);
        });
    };
    // all alias
    async.all = async.every;

    async.sortBy = function (arr, iterator, callback) {
        async.map(arr, function (x, callback) {
            iterator(x, function (err, criteria) {
                if (err) {
                    callback(err);
                }
                else {
                    callback(null, {value: x, criteria: criteria});
                }
            });
        }, function (err, results) {
            if (err) {
                return callback(err);
            }
            else {
                var fn = function (left, right) {
                    var a = left.criteria, b = right.criteria;
                    return a < b ? -1 : a > b ? 1 : 0;
                };
                callback(null, _map(results.sort(fn), function (x) {
                    return x.value;
                }));
            }
        });
    };

    async.auto = function (tasks, callback) {
        callback = callback || function () {};
        var keys = _keys(tasks);
        if (!keys.length) {
            return callback(null);
        }

        var results = {};

        var listeners = [];
        var addListener = function (fn) {
            listeners.unshift(fn);
        };
        var removeListener = function (fn) {
            for (var i = 0; i < listeners.length; i += 1) {
                if (listeners[i] === fn) {
                    listeners.splice(i, 1);
                    return;
                }
            }
        };
        var taskComplete = function () {
            _each(listeners.slice(0), function (fn) {
                fn();
            });
        };

        addListener(function () {
            if (_keys(results).length === keys.length) {
                callback(null, results);
                callback = function () {};
            }
        });

        _each(keys, function (k) {
            var task = (tasks[k] instanceof Function) ? [tasks[k]]: tasks[k];
            var taskCallback = function (err) {
                var args = Array.prototype.slice.call(arguments, 1);
                if (args.length <= 1) {
                    args = args[0];
                }
                if (err) {
                    var safeResults = {};
                    _each(_keys(results), function(rkey) {
                        safeResults[rkey] = results[rkey];
                    });
                    safeResults[k] = args;
                    callback(err, safeResults);
                    // stop subsequent errors hitting callback multiple times
                    callback = function () {};
                }
                else {
                    results[k] = args;
                    async.setImmediate(taskComplete);
                }
            };
            var requires = task.slice(0, Math.abs(task.length - 1)) || [];
            var ready = function () {
                return _reduce(requires, function (a, x) {
                    return (a && results.hasOwnProperty(x));
                }, true) && !results.hasOwnProperty(k);
            };
            if (ready()) {
                task[task.length - 1](taskCallback, results);
            }
            else {
                var listener = function () {
                    if (ready()) {
                        removeListener(listener);
                        task[task.length - 1](taskCallback, results);
                    }
                };
                addListener(listener);
            }
        });
    };

    async.waterfall = function (tasks, callback) {
        callback = callback || function () {};
        if (tasks.constructor !== Array) {
          var err = new Error('First argument to waterfall must be an array of functions');
          return callback(err);
        }
        if (!tasks.length) {
            return callback();
        }
        var wrapIterator = function (iterator) {
            return function (err) {
                if (err) {
                    callback.apply(null, arguments);
                    callback = function () {};
                }
                else {
                    var args = Array.prototype.slice.call(arguments, 1);
                    var next = iterator.next();
                    if (next) {
                        args.push(wrapIterator(next));
                    }
                    else {
                        args.push(callback);
                    }
                    async.setImmediate(function () {
                        iterator.apply(null, args);
                    });
                }
            };
        };
        wrapIterator(async.iterator(tasks))();
    };

    var _parallel = function(eachfn, tasks, callback) {
        callback = callback || function () {};
        if (tasks.constructor === Array) {
            eachfn.map(tasks, function (fn, callback) {
                if (fn) {
                    fn(function (err) {
                        var args = Array.prototype.slice.call(arguments, 1);
                        if (args.length <= 1) {
                            args = args[0];
                        }
                        callback.call(null, err, args);
                    });
                }
            }, callback);
        }
        else {
            var results = {};
            eachfn.each(_keys(tasks), function (k, callback) {
                tasks[k](function (err) {
                    var args = Array.prototype.slice.call(arguments, 1);
                    if (args.length <= 1) {
                        args = args[0];
                    }
                    results[k] = args;
                    callback(err);
                });
            }, function (err) {
                callback(err, results);
            });
        }
    };

    async.parallel = function (tasks, callback) {
        _parallel({ map: async.map, each: async.each }, tasks, callback);
    };

    async.parallelLimit = function(tasks, limit, callback) {
        _parallel({ map: _mapLimit(limit), each: _eachLimit(limit) }, tasks, callback);
    };

    async.series = function (tasks, callback) {
        callback = callback || function () {};
        if (tasks.constructor === Array) {
            async.mapSeries(tasks, function (fn, callback) {
                if (fn) {
                    fn(function (err) {
                        var args = Array.prototype.slice.call(arguments, 1);
                        if (args.length <= 1) {
                            args = args[0];
                        }
                        callback.call(null, err, args);
                    });
                }
            }, callback);
        }
        else {
            var results = {};
            async.eachSeries(_keys(tasks), function (k, callback) {
                tasks[k](function (err) {
                    var args = Array.prototype.slice.call(arguments, 1);
                    if (args.length <= 1) {
                        args = args[0];
                    }
                    results[k] = args;
                    callback(err);
                });
            }, function (err) {
                callback(err, results);
            });
        }
    };

    async.iterator = function (tasks) {
        var makeCallback = function (index) {
            var fn = function () {
                if (tasks.length) {
                    tasks[index].apply(null, arguments);
                }
                return fn.next();
            };
            fn.next = function () {
                return (index < tasks.length - 1) ? makeCallback(index + 1): null;
            };
            return fn;
        };
        return makeCallback(0);
    };

    async.apply = function (fn) {
        var args = Array.prototype.slice.call(arguments, 1);
        return function () {
            return fn.apply(
                null, args.concat(Array.prototype.slice.call(arguments))
            );
        };
    };

    var _concat = function (eachfn, arr, fn, callback) {
        var r = [];
        eachfn(arr, function (x, cb) {
            fn(x, function (err, y) {
                r = r.concat(y || []);
                cb(err);
            });
        }, function (err) {
            callback(err, r);
        });
    };
    async.concat = doParallel(_concat);
    async.concatSeries = doSeries(_concat);

    async.whilst = function (test, iterator, callback) {
        if (test()) {
            iterator(function (err) {
                if (err) {
                    return callback(err);
                }
                async.whilst(test, iterator, callback);
            });
        }
        else {
            callback();
        }
    };

    async.doWhilst = function (iterator, test, callback) {
        iterator(function (err) {
            if (err) {
                return callback(err);
            }
            if (test()) {
                async.doWhilst(iterator, test, callback);
            }
            else {
                callback();
            }
        });
    };

    async.until = function (test, iterator, callback) {
        if (!test()) {
            iterator(function (err) {
                if (err) {
                    return callback(err);
                }
                async.until(test, iterator, callback);
            });
        }
        else {
            callback();
        }
    };

    async.doUntil = function (iterator, test, callback) {
        iterator(function (err) {
            if (err) {
                return callback(err);
            }
            if (!test()) {
                async.doUntil(iterator, test, callback);
            }
            else {
                callback();
            }
        });
    };

    async.queue = function (worker, concurrency) {
        if (concurrency === undefined) {
            concurrency = 1;
        }
        function _insert(q, data, pos, callback) {
          if(data.constructor !== Array) {
              data = [data];
          }
          _each(data, function(task) {
              var item = {
                  data: task,
                  callback: typeof callback === 'function' ? callback : null
              };

              if (pos) {
                q.tasks.unshift(item);
              } else {
                q.tasks.push(item);
              }

              if (q.saturated && q.tasks.length === concurrency) {
                  q.saturated();
              }
              async.setImmediate(q.process);
          });
        }

        var workers = 0;
        var q = {
            tasks: [],
            concurrency: concurrency,
            saturated: null,
            empty: null,
            drain: null,
            push: function (data, callback) {
              _insert(q, data, false, callback);
            },
            unshift: function (data, callback) {
              _insert(q, data, true, callback);
            },
            process: function () {
                if (workers < q.concurrency && q.tasks.length) {
                    var task = q.tasks.shift();
                    if (q.empty && q.tasks.length === 0) {
                        q.empty();
                    }
                    workers += 1;
                    var next = function () {
                        workers -= 1;
                        if (task.callback) {
                            task.callback.apply(task, arguments);
                        }
                        if (q.drain && q.tasks.length + workers === 0) {
                            q.drain();
                        }
                        q.process();
                    };
                    var cb = only_once(next);
                    worker(task.data, cb);
                }
            },
            length: function () {
                return q.tasks.length;
            },
            running: function () {
                return workers;
            }
        };
        return q;
    };

    async.cargo = function (worker, payload) {
        var working     = false,
            tasks       = [];

        var cargo = {
            tasks: tasks,
            payload: payload,
            saturated: null,
            empty: null,
            drain: null,
            push: function (data, callback) {
                if(data.constructor !== Array) {
                    data = [data];
                }
                _each(data, function(task) {
                    tasks.push({
                        data: task,
                        callback: typeof callback === 'function' ? callback : null
                    });
                    if (cargo.saturated && tasks.length === payload) {
                        cargo.saturated();
                    }
                });
                async.setImmediate(cargo.process);
            },
            process: function process() {
                if (working) return;
                if (tasks.length === 0) {
                    if(cargo.drain) cargo.drain();
                    return;
                }

                var ts = typeof payload === 'number'
                            ? tasks.splice(0, payload)
                            : tasks.splice(0);

                var ds = _map(ts, function (task) {
                    return task.data;
                });

                if(cargo.empty) cargo.empty();
                working = true;
                worker(ds, function () {
                    working = false;

                    var args = arguments;
                    _each(ts, function (data) {
                        if (data.callback) {
                            data.callback.apply(null, args);
                        }
                    });

                    process();
                });
            },
            length: function () {
                return tasks.length;
            },
            running: function () {
                return working;
            }
        };
        return cargo;
    };

    var _console_fn = function (name) {
        return function (fn) {
            var args = Array.prototype.slice.call(arguments, 1);
            fn.apply(null, args.concat([function (err) {
                var args = Array.prototype.slice.call(arguments, 1);
                if (typeof console !== 'undefined') {
                    if (err) {
                        if (console.error) {
                            console.error(err);
                        }
                    }
                    else if (console[name]) {
                        _each(args, function (x) {
                            console[name](x);
                        });
                    }
                }
            }]));
        };
    };
    async.log = _console_fn('log');
    async.dir = _console_fn('dir');
    /*async.info = _console_fn('info');
    async.warn = _console_fn('warn');
    async.error = _console_fn('error');*/

    async.memoize = function (fn, hasher) {
        var memo = {};
        var queues = {};
        hasher = hasher || function (x) {
            return x;
        };
        var memoized = function () {
            var args = Array.prototype.slice.call(arguments);
            var callback = args.pop();
            var key = hasher.apply(null, args);
            if (key in memo) {
                callback.apply(null, memo[key]);
            }
            else if (key in queues) {
                queues[key].push(callback);
            }
            else {
                queues[key] = [callback];
                fn.apply(null, args.concat([function () {
                    memo[key] = arguments;
                    var q = queues[key];
                    delete queues[key];
                    for (var i = 0, l = q.length; i < l; i++) {
                      q[i].apply(null, arguments);
                    }
                }]));
            }
        };
        memoized.memo = memo;
        memoized.unmemoized = fn;
        return memoized;
    };

    async.unmemoize = function (fn) {
      return function () {
        return (fn.unmemoized || fn).apply(null, arguments);
      };
    };

    async.times = function (count, iterator, callback) {
        var counter = [];
        for (var i = 0; i < count; i++) {
            counter.push(i);
        }
        return async.map(counter, iterator, callback);
    };

    async.timesSeries = function (count, iterator, callback) {
        var counter = [];
        for (var i = 0; i < count; i++) {
            counter.push(i);
        }
        return async.mapSeries(counter, iterator, callback);
    };

    async.compose = function (/* functions... */) {
        var fns = Array.prototype.reverse.call(arguments);
        return function () {
            var that = this;
            var args = Array.prototype.slice.call(arguments);
            var callback = args.pop();
            async.reduce(fns, args, function (newargs, fn, cb) {
                fn.apply(that, newargs.concat([function () {
                    var err = arguments[0];
                    var nextargs = Array.prototype.slice.call(arguments, 1);
                    cb(err, nextargs);
                }]))
            },
            function (err, results) {
                callback.apply(that, [err].concat(results));
            });
        };
    };

    var _applyEach = function (eachfn, fns /*args...*/) {
        var go = function () {
            var that = this;
            var args = Array.prototype.slice.call(arguments);
            var callback = args.pop();
            return eachfn(fns, function (fn, cb) {
                fn.apply(that, args.concat([cb]));
            },
            callback);
        };
        if (arguments.length > 2) {
            var args = Array.prototype.slice.call(arguments, 2);
            return go.apply(this, args);
        }
        else {
            return go;
        }
    };
    async.applyEach = doParallel(_applyEach);
    async.applyEachSeries = doSeries(_applyEach);

    async.forever = function (fn, callback) {
        function next(err) {
            if (err) {
                if (callback) {
                    return callback(err);
                }
                throw err;
            }
            fn(next);
        }
        next();
    };

    // AMD / RequireJS
    if (typeof define !== 'undefined' && define.amd) {
        define([], function () {
            return async;
        });
    }
    // Node.js
    else if (typeof module !== 'undefined' && module.exports) {
        module.exports = async;
    }
    // included directly via <script> tag
    else {
        root.async = async;
    }

}());

},{"__browserify_process":15}],15:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            if (ev.source === window && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],16:[function(require,module,exports){
/*
 * Roy Replicator
 * https://github.com/jo/roy-replicator
 *
 * Node implementation of CouchDB replicator.
 * For educational purposes only.
 *
 * Copyright (c) 2013 Johannes J. Schmidt
 * Licensed under the MIT license.
 */

'use strict';

var prepare = require('./lib/prepare');
var replicate = require('./lib/replicate');

var uuid = require('./deps/uuid'); 

module.exports = function(config) {
  config = config || {};


  // ID for this replicator
  config.id = config.id || uuid();

  // Batch size for changes feed processing
  config.batch_size = config.batch_size || 100;

  // Maximal concurrent requests
  config.max_requests = config.max_requests || 4;

  // Heartbeat for changes feed in continues mode
  config.heartbeat = config.heartbeat || 10000;


  return {
    id: function() {
      return config.id;
    },

    replicate: function(options, callback) {
      options = options || {};
      callback = callback || function() {};

      // TODO: check couchdb error messages for missing source and target
      if (!options.source) {
        throw('Need a source');
      }
      if (!options.target) {
        throw('Need a target');
      }


      // Replication state object
      var state = {
        session_id: uuid(),
        start_time: new Date(),
        missing_checked: 0,
        missing_found: 0,
        docs_read: 0,
        docs_written: 0,
        doc_write_failures: 0
      };


      // Run preparations, then replicate until done.
      prepare(options, config, state, function(err) {
        if (err) {
          return callback(err);
        }

        replicate(options, config, state, callback);
      });
      

      // Promise allows to cancel continuous replication.
      return {
        cancel: function(callback) {
          // TODO: cancel active requests
          if (typeof callback === 'function') {
            callback();
          }
        }
      };
    }
  };
};

},{"./deps/uuid":2,"./lib/prepare":3,"./lib/replicate":8}]},{},[16])
;