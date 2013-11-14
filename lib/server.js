var http = require('http');

var express = require('express');
var socketio = require('socket.io');

var config = require('./config');
var utils = require('./utils');


var app = express();
app.set('port', config.web.port);

function start() {
  var server = http.createServer(app);
  server.listen(app.get('port'), function() {
    console.log('Listening on https://0.0.0.0:{0}'.format(app.get('port')));
  });
}

module.exports = {
  start: start,
};
