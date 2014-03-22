/* global socket:true */
/* Socket.IO connections */
var socket = io.connect('/');

(function() {
  var listeners = [];
  var originalSocketEmit = socket.$emit;

  socket.$emit = function() {
    var args = Array.prototype.slice.call(arguments);
    originalSocketEmit.apply(socket, args);
    listeners.forEach(function (list) {
      list.apply(socket, args);
    });
  };

  socket.onAnyMessage = function(cb){
    listeners.push(cb);
  };
})();

var sendMessage = (function () {
  var messageReciepts = {};
  var nextId = 0;

  socket.on('resolve', function (data) {
    var clientId = data.clientId;
    var message = data.message;
    messageReciepts[clientId].resolve(message);
  });

  socket.on('reject', function (data) {
    var clientId = data.clientId;
    var message = data.message;
    messageReciepts[clientId].reject(message);
  });

  return function (name, message) {
    return new Promise(function(resolve, reject) {
      var clientId = nextId++;
      messageReciepts[clientId] = {resolve: resolve, reject: reject};
      socket.emit('msg', {
        clientId: clientId,
        name: name,
        message: message,
      });
    });
  };
})();

