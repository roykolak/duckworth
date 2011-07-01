var https = require('https'),
    http = require('http');

  exports.get = function(options, callback) {
    http.get(options, function(res) {
      res.setEncoding('utf8');
      res.on('data', function(chunk) {
        callback(chunk);
      });
    }).on('error', function(e) {
      console.error(e);
    });
  };

  exports.secureGet = function(options, callback) {
    https.get(options, function(res) {
      res.setEncoding('utf8');
      res.on('data', function(chunk) {
        callback(chunk);
      });
    }).on('error', function(e) {
      console.error(e);
    });
  };

  exports.post = function(options, payload, callback) {
    options.method = 'POST';
    options.headers['content-length'] = (payload === null ? 0 : payload.length);
    options.headers['content-type'] = 'application/json';
    var req = https.request(options, function(res) {
      res.setEncoding('utf8');
      res.on('data', function(chunk) {
        callback(chunk);
      });
    }).on('error', function(e) {
      console.log(e);
    });
    if(payload !== null) {
      req.write(payload);
    }
    req.end();
  };
