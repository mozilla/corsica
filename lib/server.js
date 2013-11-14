var fs = require('fs');
var http = require('http');
var path = require('path');

var express = require('express');

var utils = require('./utils');

var server;
var app = express();

app.use(express.static('static'));

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


function start(core) {

  app.set('dirname', core.dirname);
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
