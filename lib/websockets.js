var socketio = require('socket.io');

var utils = require('./utils');


function start(core) {
  var io = socketio.listen(core.server);
  core.server.go();
  io.set('log level', 2);
  io.sockets.on('connection', function(socket){

    socket.on('msg', function(data) {
      core.sendMessage(data.name, data.message)
        .then(function(message) {
          socket.emit('resolve', {
            clientId: data.clientId,
            message: message,
          });

        }, function(err) {
          socket.emit('reject', {
            clientId: data.clientId,
            message: err
          });
        });
    });

  });

  return io;
}

module.exports = {
  start: start,
};
