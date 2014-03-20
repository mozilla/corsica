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

    corsica.sendMessage('client.connected', {_sid: socket.id});

    socket.on('msg', function(data) {
      if (data.message === undefined) {
        data.message = {};
      }
      data.message._sid = socket.id;
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

    socket.on('disconnect', function() {
      corsica.sendMessage('client.disconnected', {_sid: socket.id});
    });

  });

  return io;
}

module.exports = {
  start: start,
};
