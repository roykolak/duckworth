require('./config');
require('./helpers');
require('./request');
require('./bot');

var xml2js = require('xml2js'),
    exec = require('child_process').exec;

var duckworth = new Bot(config.key, config.group, config.room);
duckworth.start();

duckworth.addTask({
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
      duckworth.speak("The time is now " + convertToStandardTime(time.getHours()) + ' o\'clock.', room);
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
  matcher: new RegExp('chipotle', 'i'),
  action: function(message, room) {
    room.speak('I must say that Chipotle is an excellent suggestion. Aces full Sirs.');
  }
});

duckworth.addObserver({
  matcher: new RegExp(/#\d+/),
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

duckworth.addResponse({
  help:'announce "something"',
  matcher: new RegExp('announce', 'i'),
  action: function(message, room) {
    var sayThis = message.body.match(/"(?:[^\\"]+|\\.)*"/)[0];
    exec('say ' + sayThis);
  }
});

//duckworth.addResponse({
  //help:'set alarm for "14:00"',
  //matcher: new RegExp('set alarm for', 'i'),
  //action: function(message, room) {
    //var alarm = message.body.match(/"(?:[^\\"]+|\\.)*"/)[0].replace(/"/g,'');
    //duckworth.addAlarm({
      //user: message.userId,
      //time: new Date(new Date().toLocaleDateString() + ' ' + alarm)
    //});
    //room.speak("Go about your business; I shall alert you then Sir.");
  //}
//});

duckworth.addResponse({
  help:'lockdown',
  matcher: new RegExp('lockdown', 'i'),
  action: function(message, room) {
    room.lock();
    room.speak('Perimeter secured Sir.');
  }
});

duckworth.addResponse({
  help:'disarm',
  matcher: new RegExp('disarm', 'i'),
  action: function(message, room) {
    room.unlock();
    room.speak('Standing down Sir.');
  }
});

duckworth.addResponse({
  help:'topic "new topic"',
  matcher: new RegExp('topic', 'i'),
  action: function(message, room) {
    var topic = message.body.match(/"(?:[^\\"]+|\\.)*"/)[0].replace(/"/g,'');
    room.update({topic: topic});
  }
});

duckworth.addResponse({
  help: 'back me up',
  matcher: new RegExp('back me up', 'i'),
  action: function(message, room) {
    room.speak('Excuse my interjection, but I must say that is a valid and exquisite point.');
  }
});

duckworth.addResponse({
  help:"coin toss",
  matcher: new RegExp('coin toss', 'i'),
  action: function(message, room) {
    var side = (Math.floor(Math.random()*2) == 1 ? 'Heads' : 'Tails');
    room.speak(side + ' is the result Sir.');
  }
});

duckworth.addResponse({
  help: 'forecast "Chicago"',
  matcher: new RegExp('forecast', 'i'),
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

duckworth.addResponse({
  help: 'build status',
  matcher: new RegExp('build status', 'i'),
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

duckworth.addResponse({
  help:'stock "GOOG"',
  matcher: new RegExp('stock', 'i'),
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

duckworth.addResponse({
  help:"",
  matcher: new RegExp('hello', 'i'),
  action: function(message, room) {
    room.speak("Hello sir, how many I be of service?");
  }
});

duckworth.addResponse({
  help: "",
  matcher: new RegExp('thanks', 'i'),
  action: function(message, room) {
    room.speak("My duty is to serve you sir.");
  }
});
