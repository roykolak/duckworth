require('./actions/observers');
require('./actions/responders');
require('./actions/performers');

Bot = function Bot(apiKey, group) {
  var client = require("ranger").createClient(group, apiKey);
  client.me(function(user) { me = user; }); // me is global

  return {
    start: function() {
      client.rooms(function(rooms) {
        rooms.forEach(function(room) {
          room.join(function() {
            setInterval(function() {
              Performers.match(room);
            }, 50000);

            room.listen(function(message) {
              if(message.body !== null) {
                Responders.match(message, room);
                Observers.match(message, room);
              }
            });
          });
        });
      });
    },

    addResponder: function(responder) {
      Responders.add(responder);
    },

    addObserver: function(observer) {
      Observers.add(observer);
    },

    addPerformer: function(performer) {
      Performers.add(performer);
    }
  };
};
