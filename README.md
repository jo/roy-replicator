Roy
===
Node implementation of the CouchDB replication protocol.

Usage
-----
```js
var adapter = require('roy-request');
var roy = require('roy');

roy.replicate({
  source: adapter('http://localhost:5984/my-source'),
  target: adapter('http://localhost:5984/my-target')
}, function(err, resp) {
  // Oh Pris!
});
```

This should also be possible (but I haven't tested yet):
```js
var adapter = require('pouchdb');
```

Goals
-----
<img src=https://raw.github.com/jo/roy/d3d01e8a6b2e62410e3285fa4e9bdf3425c79bb8/test/fixtures/roy.jpg>

* Gain deeper understanding of CouchDB replication
* Good readability and testability
* CouchDB replicator compatibility
* Be nearly as fast as CouchDB
* Small browserified footprint
* PouchDB compatibility (replace `roy-request` with `pouchdb`)

Resources
---------
* [CouchDB Replication Protocol by Alexander Shorin](http://kxepal.iriscouch.com/docs/dev/replication/protocol.html)
* [Jens Alfkes description of the replication algorithm](https://github.com/couchbaselabs/TouchDB-iOS/wiki/Replication-Algorithm)
* [CouchDB Replication Protocol on Data Protocols](http://www.dataprotocols.org/en/latest/couchdb_replication.html)
* [RCouchs Replication Algorithm in pseudo code](https://github.com/refuge/rcouch/wiki/Replication-Algorithm)

Development
-----------
* Lint the code with `npm run jshint`.
* Run the tests with `npm test`
* Browserify with `npm run build`

License
-------
Copyright (c) 2013 Johannes J. Schmidt, TF

Licensed under the MIT license.
