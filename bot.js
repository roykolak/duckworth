Bot = function Bot(apiKey, group, roomToJoin) {
  var tasks = [], responses = [], observers = [];
  var client;

  function assembleHelp() {
    var message = '';
    responses.forEach(function(response) {
      message += response.help + '\n';
    });
    return message;
  }

  return {
    start: function() {
      client = require("ranger").createClient(group, apiKey);

      var self = this;
      client.rooms(function(rooms) {
        rooms.forEach(function(room) {
          room.join(function() {
            setInterval(function() {
              self.matchTask(room);
            }, 50000);

            room.listen(function(message) {
              if(message.body.length !== 0) {
                self.matchMessage(message, room);
                self.matchObserver(message, room);
              }
            });
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
          room.paste(assembleHelp());
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
    }
  };
}
