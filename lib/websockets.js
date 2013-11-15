var socketio = require('socket.io');

var utils = require('./utils');


function start(core) {
  var io = socketio.listen(core.server);
  core.server.go();
  io.set('log level', 2);
  io.sockets.on('connection', function(socket){

    socket.on('getName', function(cb) {
      console.log('getName');
      cb(utils.getName());
    });

  });

  return io;
}

module.exports = {
  start: start,
};
