/* Socket.IO connections */
var socket = io.connect('/');

var sendMessage = (function () {
  var messageReciepts = {};
  var nextId = 0;

  socket.on('resolve', function (data) {
    var clientId = data.clientId;
    var message = data.message;
    console.log('recieved data', data);
    console.log(messageReciepts[clientId].resolve);
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

