var http = require('http');

var express = require('express');

var utils = require('./utils');

var server;
var app = express();

function start(core) {
  app.set('port', core.config.web.port);
  server = http.createServer(app);

  server.listen(app.get('port'), function() {
    console.log('Listening on https://0.0.0.0:{0}'.format(app.get('port')));
  });
}

module.exports = {
  start: start,
  server: server,
};
