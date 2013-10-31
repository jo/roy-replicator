# Roy [![Build Status](https://secure.travis-ci.org/jo/roy.png?branch=master)](http://travis-ci.org/jo/roy)

Node implementation of CouchDB replicator, based on nano.

Just for educational purposes.

```javascript
var nano = require('nano')('http://localhost:5984');
require('roy').replicate({
  source: nano.db.use('my-source'),
  target: nano.db.use('my-target')
}, function(err, resp) {
  console.log('WOOT!');
});
```

## License
Copyright (c) 2013 Johannes J. Schmidt, TF
Licensed under the MIT license.
