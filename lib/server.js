var fs = require('fs');
var http = require('http');
var path = require('path');

var express = require('express');

var utils = require('./utils');

var server;
var app = express();
var core;

app.use(express.compress());
app.use(express.static('static'));
app.use(express.json());

var promiseModule;
app.use('/promise.js', function(req, res) {
  var filePath = path.join(app.get('dirname'), 'node_modules/promisesaplus/promise.js');
  if (typeof promiseModule === 'undefined') {
    fs.readFile(filePath, function(err, file) {
      if (err) {
        res.status(404).send();
      }
      promiseModule = file;
      res.send(promiseModule);
    });
  } else {
    res.send(promiseModule);
  }
});


app.all('/api/:msg', function(req, res) {
  var data = res;

  core.sendMessage(req.params.msg, req.body)
    .then(function(result) {
      res.send(JSON.stringify(result));
    });
});


function start(core_) {
  core = core_;
  app.set('dirname', core.dirname);
  app.set('port', core.config.PORT);
  server = http.createServer(app);
  server.go = go;

  return server;
}

function go() {
  server.listen(app.get('port'), function() {
    console.log('Listening on https://0.0.0.0:{0}'.format(app.get('port')));
  });
}


module.exports = {
  start: start,
  server: server,
};
