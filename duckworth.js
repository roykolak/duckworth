require('./config');
var Bot = require('./bot'),
    xml2js = require('xml2js'),
    request = require('./requests'),
    exec = require('child_process').exec;

var duckworth = new Bot(config.key, config.group, config.room);
duckworth.start();


duckworth.addResponse({
  help:'announce "something"',
  matcher: new RegExp('announce', 'i'),
  action: function(message, room) {
    var sayThis = message.body.match(/"(?:[^\\"]+|\\.)*"/)[0];
    exec('say ' + sayThis);
  }
});

duckworth.addResponse({
  help:"coin toss",
  matcher: new RegExp('coin toss', 'i'),
  action: function(message, room) {
    var side = (Math.floor(Math.random()*2) == 1 ? 'Heads' : 'Tails');
    duckworth.speak(side + ' is the result Sir.', room);
  }
});

duckworth.addResponse({
  help: 'forecast "Chicago"',
  matcher: new RegExp('forecast', 'i'),
  action:function(message, room) {
    var city = message.body.match(/"(?:[^\\"]+|\\.)*"/)[0].replace(/"/g,'');
    request.get({host: 'www.google.com', path:'/ig/api?weather=' + city}, function(data) {
      var forecast = "",
          parser = new xml2js.Parser();
      parser.addListener('end', function(result) {
        result.weather.forecast_conditions.forEach(function(day) {
          forecast += day.day_of_week['@'].data + ": ";
          forecast += day.low['@'].data + "/" + day.high['@'].data + " with ";
          forecast += day.condition['@'].data + "\n\n";
        });
        duckworth.speak(forecast, room, 'PasteMessage');
      });
      parser.parseString(data);
    });
  }
});

duckworth.addResponse({
  help: 'build status',
  matcher: new RegExp('build status', 'i'),
  action:function(message, room) {
    var results = {builder1:false, builder2:true},
        status = '';

    function done() {
      if(results.builder1 && results.builder2) {
        duckworth.speak(status, room, 'PasteMessage');
      }
    }

    function parseResults(data) {
      var json = JSON.parse(data);
      json.jobs.forEach(function(job) {
        status += job.name + ': ' + (job.color == 'blue' ? 'Passing' : 'Failing') + "\n";
      });
      done();
    }

    request.get({host: 'builder.research', path: '/api/json'}, function(data) {
      results.builder1 = true;
      parseResults(data);
    });

    // Why doesn't this work?
    //request.get({host: 'usglvdt088', port:'8080', path: '/api/json'}, function(data) {
      //results.builder2 = true;
      //parseResults(data);
    //});
  }
});

duckworth.addResponse({
  help:'stock "GOOG"',
  matcher: new RegExp('stock', 'i'),
  action: function(message, room) {
    var stock = message.body.match(/"(?:[^\\"]+|\\.)*"/)[0].replace(/"/g,'');
    request.get({host:'www.google.com', path:'/ig/api?stock=' + stock}, function(data) {
      var quote = '',
          parser = new xml2js.Parser();
      parser.addListener('end', function(result) {
        quote = result.finance.company['@'].data + '\n' + result.finance.last['@'].data;
        duckworth.speak(quote, room, 'PasteMessage');
      });
      parser.parseString(data);
    });
  }
});

duckworth.addResponse({
  help:"",
  matcher: new RegExp('hello', 'i'),
  action: function(message, room) {
    duckworth.speak("Hello sir, how many I be of service?", room);
  }
});

duckworth.addResponse({
  help: "",
  matcher: new RegExp('thanks', 'i'),
  action: function(message, room) {
    duckworth.speak("My duty is to serve you sir.", room);
  }
});
