Observers = {
  items: [],
  add: function(item) {
    this.items.push(item);
  },
  match: function(message, room) {
    if(message.userId != me.id) {
      this.items.forEach(function(item) {
        if(message.body.match(item.matcher)) {
          item.action(message, room);
        }
      });
    }
  }
}
