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
}

Corsica.prototype.sendMessage = function(name, message) {
  var listeners = this.listeners[name] || [];
  var i = 0;
  var top_p = promises();

  console.log(listeners);

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
      this.websockets.emit(name, msg);
    }
  );

  return top_p;
};

Corsica.prototype.on = function(name, cb) {
  this.listeners[name] = this.listeners[name] || [];
  this.listeners[name].push(cb);
};

var core = new Corsica();

module.exports = {
  start: function() {
    var core = new Corsica();
    core.start();
    return core;
  }
};
