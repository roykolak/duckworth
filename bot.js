// Array Remove - By John Resig (MIT Licensed)
 Array.prototype.remove = function(from, to) {
   var rest = this.slice((to || from) + 1 || this.length);
   this.length = from < 0 ? this.length + from : from;
   return this.push.apply(this, rest);
};

Bot = function Bot(apiKey, group, roomToJoin) {
  var tasks = [], responses = [], observers = [], alarms = [];
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

            //setInterval(function() {
              //self.matchAlarm(room);
            //}, 30000);

            room.listen(function(message) {
              if(message.body !== null) {
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

    addAlarm: function(alarm) {
      alarms.push(alarm);
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
    },

    matchAlarm: function(room) {
      var expiredAlaramIndices = [];
      var time = new Date();

      var hour = time.getHours(),
          minute = time.getMinutes();

      alarms.forEach(function(alarm, index) {
        if(hour == alarm.time.getHours() && minute == alarm.time.getMinutes()) {
          client.user(alarm.user, function(user) {
            room.speak(user.name + ' this is your alarm Sir.');
            expiredAlaramIndices.push(index);
            console.log(expiredAlaramIndices);
          });
        }
      });

      console.log('before:');
      console.log(alarms);
      console.log(expiredAlaramIndices);
      for(var i = expiredAlaramIndices.length; i > 0; i--) {
        alarms.remove(expiredAlarmsIndices[i]);
      }
      console.log('after:');
      console.log(alarms);
    }
};
}
