var path = require('path');

var socketio = require('socket.io');
var promises = require('promisesaplus');

var config = require('./config');
var server = require('./server');
var websockets = require('./websockets');


function Corsica() {
  this.dirname = path.normalize(__dirname + '/../');
  this.config = config;

  this.listeners = {};

  this.start = function() {
    this.server = server.start(this);
    this.websockets = websockets.start(this);
  };

  this.loadPlugins();
}

Corsica.prototype.sendMessage = function(name, message) {
  var listeners = this.listeners[name] || [];
  var i = 0;
  var top_p = promises();

  function next(msg) {
    if (i >= listeners.length) {
      top_p.fulfill(msg);
      return;
    }
    var p = promises();
    listeners[i](msg, p);
    i++;
    p.then(
      function fulfilled(msg) {
        next(msg);
      },
      function rejected(err) {
        console.log(err);
        top_p.reject(msg);
      }
    );
  }

  next(message);

  top_p.then(
    function fulfilled(msg) {
      this.websockets.sockets.emit(name, msg);
    }.bind(this)
  ).then(null, function(err) {
    console.log(err);
  });

  return top_p;
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
      console.error('Error loading module "{0}": {1}.'.format(name, e));
      return false;
    }
  }

  // For every listed plugin, 
  this.config.plugins.forEach(function(name, i) {
    try {
      require('../plugins/' + name)(this);
      console.log('Loaded local plugin "{0}".'.format(name));
    } catch(e) {
      if (checkError(e, name)) {
        try {
          require(name)(this);
          console.log('Loaded npm plugin "{0}".'.format(name));
        } catch(e) {
          if (checkError(e, name)) {
            console.error('Could not load plugin "{0}".'.format(name));
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
