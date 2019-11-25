var fs = require('fs');
var http = require('http');
var path = require('path');

var express = require('express');
var helmet = require('helmet');
var express_enforces_ssl = require('express-enforces-ssl');

var utils = require('./utils');

var server;
var app = express();
var core;

var staticPath = path.resolve(path.join(path.dirname(__filename), '..', 'static'));


app.use(helmet.hidePoweredBy());
app.use(express.compress());
app.use(express.json());


app.options('/api/:msg', function (req, res) {
  console.log('options', req.params.msg);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Max-Age', '1000');
  res.end();
});

app.post('/api/:msg', function (req, res) {
  var data = res;

  core.sendMessage(req.params.msg, req.body)
    .then(function (result) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(result));
    });
});

function start(core_) {
  core = core_;

  if (core.config.force_https) {
    console.log("Forcing HTTPS. Setting HSTS to " + core.config.hsts_time + " seconds");
    app.enable('trust proxy');
    app.use(helmet.hsts({maxAge: core.config.hsts_time}));
    app.use(express_enforces_ssl());
  }

  app.use(express.static(staticPath));

  app.set('port', core.config.PORT);
  server = http.createServer(app);
  server.go = go;
  return server;
}

function go() {
  server.listen(app.get('port'), function() {
    console.log('Listening on http://0.0.0.0:{0}'.format(app.get('port')));
  });
}


module.exports = {
  start: start,
  server: server,
  expressApp: app
};
