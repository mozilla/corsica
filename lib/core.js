var socketio = require('socket.io');

var config = require('./config');
var server = require('./server');


function start() {
  server.start();
}

module.exports = {
  start: start,
};
