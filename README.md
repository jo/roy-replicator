# roy [![Build Status](https://secure.travis-ci.org/jo/roy.png?branch=master)](http://travis-ci.org/jo/roy)

Replicate like a king.

Node implementation of CouchDB replicator, based on nano.

Just for educational purposes.

## Getting Started
Install the module with: `npm install roy`

```javascript
var roy = require('roy');
var nano = require('nano')('http://localhost:5984');
roy.replicate({
  source: nano.db.use('my-source'),
  target: nano.db.use('my-target')
}, function(err, resp) {
  console.log('WOOT!');
});
```

## License
Copyright (c) 2013 Johannes J. Schmidt  
Licensed under the MIT license.
