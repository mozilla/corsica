const fs = require('fs');
const http = require('http');
const path = require('path');

const express = require('express');
const helmet = require('helmet');
const express_enforces_ssl = require('express-enforces-ssl');

const utils = require('./utils');

let server;
const app = express();
let core;

const staticPath = path.resolve(path.join(path.dirname(__filename), '..', 'static'));


app.use(helmet.hidePoweredBy());
app.use(express.compress());
app.use(express.json());


app.options('/api/:msg', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Max-Age', '1000');
  res.end();
});

app.post('/api/:msg', async (req, res) => {
  const result = await core.sendMessage(req.params.msg, req.body);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(result));
});

function start(core_) {
  core = core_;

  if (core.config.force_https) {
    console.log("Forcing HTTPS. Setting HSTS to " + core.config.hsts_time + " seconds");
    app.enable('trust proxy');
    app.use(helmet.hsts({ maxAge: core.config.hsts_time }));
    app.use(express_enforces_ssl());
  }

  app.use(express.static(staticPath));

  app.set('port', core.config.PORT);
  server = http.createServer(app);
  server.go = go;
  return server;
}

function go() {
  const port = app.get('port');
  server.listen(port, () => {
    console.log(`Listening on http://0.0.0.0:${port}`);
  });
}

module.exports = {
  start: start,
  server: server,
  expressApp: app
};
