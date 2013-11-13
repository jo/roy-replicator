# Roy
Node implementation of the CouchDB replicator, based on
[nano](https://github.com/dscape/nano).

## Usage
```js
var nano = require('nano')('http://localhost:5984');
var roy = require('roy');

roy.replicate({
  source: nano.db.use('my-source'),
  target: nano.db.use('my-target')
}, function(err, resp) {
  // Oh Pris!
});
```

## Goals
* gain deeper understanding of CouchDB replication
* 100% CouchDB compatibility
* be as fast as CouchDB
* only depend on nano (or api compatible CouchDB client)
* develop code which can be ported to the browser

## Resources
* [Jens Alfkes description of the replication algorithm](https://github.com/couchbaselabs/TouchDB-iOS/wiki/Replication-Algorithm)
* [CouchDB Replication Protocol on Data Protocols](http://www.dataprotocols.org/en/latest/couchdb_replication.html)
* [RCouchs Replication Algorithm in pseudo code](https://github.com/refuge/rcouch/wiki/Replication-Algorithm)
* [CouchDB Replication Protocol by Alexander Shorin](http://kxepal.iriscouch.com/docs/dev/replication/protocol.html)

## License
Copyright (c) 2013 Johannes J. Schmidt, TF

Licensed under the MIT license.
