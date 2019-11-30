var path = require('path');

var request = require('request');

var utils = require('./utils');
var config = require('./config');
var server = require('./server');
var websockets = require('./websockets');
var http = require('./http');


function Corsica() {
  this.dirname = path.normalize(__dirname + '/../');
  this.config = config;
  this.utils = utils;
  this.request = request;
  http.init(this);
  this.http = http;

  this.listeners = {};

  this.start = function() {
    this.server = server.start(this);
    this.websockets = websockets.start(this);
  };

  this.loadPlugins();
}

/* Pass a message through all matching listeners and send the output to the appropriate client(s)
 */
Corsica.prototype.sendMessage = async function(name, message = {}) {
  let listeners = this.listeners[name] || [];

  listeners = listeners.concat(this.listeners['*'] || []);

  let msg = message;
  for (const listener of listeners) {
    try {
      msg = await listener(msg);
    } catch (e) {
      console.log('error: ', e);
      throw e;
    }
  }
  this.websockets.sockets.emit(name, msg);
  return msg;
};

/* Pass through to express server
 */
Corsica.prototype.serveRoute = function (name, handler) {
  if (name[0] === '/') {
    throw new Error('plugin paths must not begin with `/`: ' + name);
  }
  if (name.length === 0) {
    throw new Error('route name must not be empty');
  }
  console.log('registering plugin route at /' + name);
  server.expressApp.use('/' + name, handler);
};

/* Register a new listener on the Corsica message stream
 */
Corsica.prototype.on = function(name, cb) {
  this.listeners[name] = this.listeners[name] || [];
  this.listeners[name].push(cb);
};

/* Load a new corsica plug in from a javascript module
 */
Corsica.prototype.loadPlugins = function() {
  function checkError(name, e) {
    if (e.code && e.code === 'MODULE_NOT_FOUND') {
      return true; // keep looking
    }
    console.error('Error loading module "{0}".'.format(name));
    console.info(e.stack ? e.stack : e);
    return false; // another error
  }

  // For every listed plugin,
  this.config.plugins.forEach((name, i) => {
    try {
      require('../plugins/' + name)(this);
      console.log('Loaded local plugin "{0}".'.format(name));
    } catch(e) {
      if (checkError(name, e)) {
        try {
          require(name)(this);
          console.log('Loaded npm plugin "{0}".'.format(name));
        } catch(e) {
          if (checkError(name, e)) {
            console.error('Could not load plugin "{0}" from any sources'.format(name, e));
            console.error(e.stack || e);
          }
        }
      }
    }
  });
};

module.exports = {
  start: function() {
    var core = new Corsica();
    core.start();
    return core;
  }
};
