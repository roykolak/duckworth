var https = require('https'),
    http = require('http');

Request = {
  get: function(options, callback) {
    http.get(options, function(res) {
      res.setEncoding('utf8');
      res.on('data', function(chunk) {
        callback(chunk);
      });
    }).on('error', function(e) {
      console.error(e);
    });
  },

  secureGet: function(options, callback, endCallback) {
    https.get(options, function(res) {
      res.setEncoding('utf8');
      res.on('data', function(chunk) {
        console.log('data');
        callback(chunk);
      });
    }).on('error', function(e) {
      console.error(e);
    }).on('end', function(e) {
      console.log('end');
      endCallback();
    }).on('close', function(e) {
      console.log('close');
    });
  },

  post: function(options, payload, callback) {
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
  }
};

// Array Remove - By John Resig (MIT Licensed)
 Array.prototype.remove = function(from, to) {
   var rest = this.slice((to || from) + 1 || this.length);
   this.length = from < 0 ? this.length + from : from;
   return this.push.apply(this, rest);
};

