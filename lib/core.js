var socketio = require('socket.io');

var config = require('./config');
var server = require('./server');
var websockets = require('./websockets');


function Corsica() {
  this.config = config;
  this.server = server.start(this);
  this.websockets = websockets.start(this);
}


module.exports = {
  start: function() {
    return new Corsica();
  }
};
