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

Corsica.prototype.sendMessage = async function(name, message = {}) {
  var listeners = this.listeners[name] || [];

  listeners = listeners.concat(this.listeners['*'] || []);
  
  let msg = message;
  for (const listener of listeners) {
    msg = await listener(msg);
  }
  this.websockets.sockets.emit(name, msg);
  return msg;
};

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

Corsica.prototype.on = function(name, cb) {
  this.listeners[name] = this.listeners[name] || [];
  this.listeners[name].push(cb);
};

Corsica.prototype.loadPlugins = function() {
  function checkError(name, e) {
    if (e.code && e.code === 'MODULE_NOT_FOUND') {
      return true;
    } else {
      if(e.stack) {
        console.error('Error loading module "{0}".'.format(name));
        console.info(e.stack);
      } else {
        console.error('Error loading module "{0}": {1}.'.format(name, e));
      }
      return false;
    }
  }

  // For every listed plugin,
  this.config.plugins.forEach(function(name, i) {
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
  }.bind(this));
};

module.exports = {
  start: function() {
    var core = new Corsica();
    core.start();
    return core;
  }
};
