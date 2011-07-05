var request = require('./requests'),
    sys = require('sys'),
    xml2js = require('xml2js'),
    child;

module.exports = function Bot(apiKey, group, roomToJoin) {
  var auth = 'Basic ' + new Buffer(apiKey + ':X').toString('base64');
  var tasks = [], responses = [], observers = [];

  function buildOptions(config) {
    var options = {
      host: config.host || (group + '.campfirenow.com'),
      headers: { authorization: auth }
    };
    options.path = config.path;
    return options;
  }

  var url = {
    joinRoom: function(room) {
      return buildOptions({path: '/room/' + room.id + '/join.json'});
    },
    getRooms: buildOptions({path:'/rooms.json'}),
    stream: function(room) {
      return buildOptions({host:'streaming.campfirenow.com', path:'/room/' + room.id + '/live.json'});
    },
    postMessage: function(room) {
      return buildOptions({path: '/room/' + room.id + '/speak.json'});
    }
  };

  return {
    start: function() {
      var self = this;

      request.secureGet(url.getRooms, function (data) {
        var room = JSON.parse(data).rooms[roomToJoin];
        setInterval(function() {
          self.matchTask(room);
        }, 45000);

        request.post(url.joinRoom(room), null, function(data) {
          request.secureGet(url.stream(room), function(data) {
            // https://github.com/tristandunn/node-campfire/
            if (data.trim() === '') {
              return;
            }

            data = data.split("\r");

            for (var i = 0; i < data.length; ++i) {
              if (data[i].trim() !== '') {
                try {
                  self.matchMessage(JSON.parse(data[i]), room);
                  self.matchObserver(JSON.parse(data[i]), room);
                } catch(e) {}
              }
            }
          });
        });
      });
    },

    addResponse: function(response) {
      responses.push(response);
    },

    addObserver: function(observer) {
      observers.push(observer);
    },

    addTask: function(task) {
      tasks.push(task);
    },

    matchMessage: function(message, room) {
      if(message.body.match(/duckworth:/i)) {
        var hit = false;
        responses.forEach(function(response) {
          if(message.body.match(response.matcher) && hit === false) {
            hit = true;
            response.action(message, room);
            return;
          }
        });

        if(message.body.match(/help/i)) {
          var help = '';
          responses.forEach(function(response) {
            help += response.help + '\n';
          });
          this.speak(help, room, 'PasteMessage');
        }
      }
    },

    matchObserver: function(message, room) {
      observers.forEach(function(observer) {
        if(message.body.match(observer.matcher)) {
          observer.action(message, room);
        }
      });
    },

    matchTask: function(room) {
      tasks.forEach(function(task) {
        task.action(room);
      });
    },

    speak: function(text, room, type) {
      var message = JSON.stringify({message:{type:type || 'TextMessage', body:text}});
      request.post(url.postMessage(room), message, function(data) {});
    }
  };
}
