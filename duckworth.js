require('./config');
require('./helpers');
require('./bot');

var xml2js = require('xml2js'),
    exec = require('child_process').exec;

var duckworth = new Bot(config.key, config.group);
duckworth.start();

duckworth.addPerformer({
  action: function(room) {
    function convertToStandardTime(militaryHours) {
      if(militaryHours === 0) {
        return 12;
      } else {
        return (militaryHours > 12 ? militaryHours - 12 : militaryHours);
      }
    }

    var time = new Date();
    if(time.getMinutes() === 0) {
      room.speak("The time is now " + convertToStandardTime(time.getHours()) + ' o\'clock.', room);
    }
  }
});

duckworth.addObserver({
  matcher: /oh no/i,
  action: function(message, room) {
    room.speak('http://www.x-entertainment.com/pics/kool1.jpg');
  }
});

duckworth.addObserver({
  matcher: /chipotle/i,
  action: function(message, room) {
    room.speak('I must say that Chipotle is an excellent suggestion. Aces full Sirs.');
  }
});

duckworth.addObserver({
  matcher: /#\d+/,
  action: function(message, room) {
    var ticket = message.body.match(/#(\d+)/)[1],
        requestParams = {
          host: 'projects.research',
          path:'/issues/' + ticket + '.json?key=' + config.redmineKey
        };

    Request.get(requestParams, function(data) {
      var issue = JSON.parse(data).issue;
      room.speak(ticket + ': ' + issue.subject + ' [' + issue.project.name + ']');
      room.speak('http://projects.research/issues/' + ticket);
    });
  }
});

duckworth.addResponder({
  help:'say "something"',
  matcher: /say/i,
  action: function(message, room) {
    var sayThis = message.body.match(/"(?:[^\\"]+|\\.)*"/)[0];
    exec('say ' + sayThis);
  }
});

duckworth.addResponder({
  help:'lockdown',
  matcher: /lockdown/i,
  action: function(message, room) {
    room.lock();
    room.speak('Perimeter secured Sir.');
  }
});

duckworth.addResponder({
  help:'disarm',
  matcher: /disarm/i,
  action: function(message, room) {
    room.unlock();
    room.speak('Standing down Sir.');
  }
});

duckworth.addResponder({
  help:'topic "new topic"',
  matcher: /topic/i,
  action: function(message, room) {
    var topic = message.body.match(/"(?:[^\\"]+|\\.)*"/)[0].replace(/"/g,'');
    room.update({topic: topic});
  }
});

duckworth.addResponder({
  help: 'back me up',
  matcher: /back me up/i,
  action: function(message, room) {
    room.speak('Excuse my interjection, but I must say that is a valid and exquisite point.');
  }
});

duckworth.addResponder({
  help:"coin toss",
  matcher: /coin toss/i,
  action: function(message, room) {
    var side = (Math.floor(Math.random()*2) == 1 ? 'Heads' : 'Tails');
    room.speak(side + ' is the result Sir.');
  }
});

duckworth.addResponder({
  help: 'forecast "Chicago"',
  matcher: /forecast/i,
  action:function(message, room) {
    var city = message.body.match(/"(?:[^\\"]+|\\.)*"/)[0].replace(/"/g,'');
    Request.get({host: 'www.google.com', path:'/ig/api?weather=' + city}, function(data) {
      var forecast = "",
          parser = new xml2js.Parser();
      parser.addListener('end', function(result) {
        result.weather.forecast_conditions.forEach(function(day) {
          forecast += day.day_of_week['@'].data + ": ";
          forecast += day.low['@'].data + "/" + day.high['@'].data + " with ";
          forecast += day.condition['@'].data + "\n\n";
        });
        room.paste(forecast);
      });
      parser.parseString(data);
    });
  }
});

duckworth.addResponder({
  help: 'build status',
  matcher: /build status/i,
  action:function(message, room) {
    var results = {builder1:false, builder2:true},
        status = '';

    function done() {
      if(results.builder1 && results.builder2) {
        room.paste(status);
      }
    }

    function parseResults(data) {
      var json = JSON.parse(data);
      json.jobs.forEach(function(job) {
        status += job.name + ': ' + (job.color == 'blue' ? 'Passing' : 'Failing') + "\n";
      });
      done();
    }

    Request.get({host: 'builder.research', path: '/api/json'}, function(data) {
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

duckworth.addResponder({
  help:'stock "GOOG"',
  matcher: /stock/i,
  action: function(message, room) {
    var stock = message.body.match(/"(?:[^\\"]+|\\.)*"/)[0].replace(/"/g,'');
    Request.get({host:'www.google.com', path:'/ig/api?stock=' + stock}, function(data) {
      var quote = '',
          parser = new xml2js.Parser();
      parser.addListener('end', function(result) {
        quote = result.finance.company['@'].data + '\n' + result.finance.last['@'].data;
        room.speak(quote);
      });
      parser.parseString(data);
    });
  }
});

duckworth.addResponder({
  help:"",
  matcher: /hello/i,
  action: function(message, room) {
    room.speak("Hello sir, how many I be of service?");
  }
});

duckworth.addResponder({
  help: "",
  matcher: /thanks/i,
  action: function(message, room) {
    room.speak("My duty is to serve you sir.");
  }
});
