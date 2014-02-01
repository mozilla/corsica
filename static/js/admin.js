
console.log('Waiting for connection to server...');

socket.on('connect', function() {
  init();
});

socket.on('disconnect', function () {
  console.log('Disconnected from server.');
});

function init() {
  console.log('Connection to server established.');
  sendMessage('settings.getAll', function (r) {
    console.log('f');
  });
}
