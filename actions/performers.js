Performers = {
  items : [],
  add: function(item) {
    this.items.push(item);
  },
  match: function(room) {
    this.items.forEach(function(item) {
      item.action(room);
    });
  }
};
