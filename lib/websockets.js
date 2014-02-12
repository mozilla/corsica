var socketio = require('socket.io');

var utils = require('./utils');


function start(corsica) {
  var io = socketio.listen(corsica.server);
  corsica.server.go();

  io.set('log level', 2);
  for (var key in corsica.config) {
    var val = corsica.config[key];
    var match = /socketio_(.*)/.exec(key);
    if (match) {
      var socketKey = match[1].replace('_', ' ');
      console.log('[websockets]', 'setting', socketKey, '=', val);
      io.set(socketKey, val);
    }
  }

  io.sockets.on('connection', function(socket){

    socket.on('msg', function(data) {
      corsica.sendMessage(data.name, data.message)
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
