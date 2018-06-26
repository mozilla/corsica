const socketio = require('socket.io');


function start(corsica) {
  const io = socketio.listen(corsica.server);
  corsica.server.go();

  // io.set('log level', 2);
  for (const key in corsica.config) {
    var val = corsica.config[key];
    var match = /socketio_(.*)/.exec(key);
    if (match) {
      const socketKey = match[1].replace('_', ' ');
      console.log('[websockets]', 'setting', socketKey, '=', val);
      io.set(socketKey, val);
    }
  }

  io.sockets.on('connection', async socket => {

    await corsica.sendMessage('client.connected', { _sid: socket.id });

    socket.on('msg', async data => {
      if (data.message === undefined) {
        data.message = {};
      }
      data.message._sid = socket.id;
      try {
        const message = await corsica.sendMessage(data.name, data.message)
        socket.emit('resolve', {
          clientId: data.clientId,
          message: message,
        });
      } catch (err) {
        socket.emit('reject', {
          clientId: data.clientId,
          message: err
        });
      }
    });

    socket.on('disconnect', async () => {
      await corsica.sendMessage('client.disconnected', { _sid: socket.id });
    });
  });

  return io;
}

module.exports = {
  start: start,
};
