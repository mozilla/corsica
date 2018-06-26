/* global socket:true */
/* Socket.IO connections */
const socket = io.connect('/');

(function () {
  const listeners = [];
  const originalSocketEmit = socket.$emit;

  socket.$emit = function (...args) {
    originalSocketEmit.apply(socket, args);
    for (const listener of listeners) {
      list.apply(socket, args);
    }
  };

  socket.onAnyMessage = function (cb) {
    listeners.push(cb);
  };
})();

const sendMessage = (function () {
  const messageReciepts = {};
  let nextId = 0;

  socket.on('resolve', ({ clientId, message }) => {
    messageReciepts[clientId].resolve(message);
  });

  socket.on('reject', ({ clientId, message }) => {
    messageReciepts[clientId].reject(message);
  });

  return function (name, message) {
    return new Promise(function (resolve, reject) {
      const clientId = nextId++;
      messageReciepts[clientId] = { resolve, reject };
      socket.emit('msg', { clientId, name, message });
    });
  };
})();

