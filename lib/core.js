var path = require('path');

var socketio = require('socket.io');

var config = require('./config');
var server = require('./server');
var websockets = require('./websockets');


function Corsica() {
  this.dirname = path.normalize(__dirname + '/../');
  this.config = config;

  this.start = function() {
    this.server = server.start(this);
    this.websockets = websockets.start(this);
  };
}

var core = new Corsica();

module.exports = {
  start: function() {
    var core = new Corsica();
    core.start();
    return core;
  }
};
