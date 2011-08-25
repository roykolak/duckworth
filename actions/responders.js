Responders = {
  items: [],
  add: function(item) {
    this.items.push(item);
  },
  match: function(message, room) {
    if(message.body.match(/duckworth:/i)) {
      var hit = false;
      this.items.forEach(function(item) {
        if(message.body.match(item.matcher) && hit === false) {
          hit = true;
          item.action(message, room);
          return;
        }
      });

      if(message.body.match(/help/i)) {
        var help = '';
        this.items.forEach(function(item) {
          help += item.help + '\n';
        });
        room.paste(help);
      }
    }
  }
};
