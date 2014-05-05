var path = require('path');

var Promise = require('es6-promise').Promise;
var request = require('request');

var utils = require('./utils');
var config = require('./config');
var server = require('./server');
var websockets = require('./websockets');
var loader = require('./loader');


function Corsica() {
  this.dirname = path.normalize(__dirname + '/../');
  this.config = config;
  this.utils = utils;
  this.request = request;

  this.listeners = {};

  this.start = function() {
    this.server = server.start(this);
    this.websockets = websockets.start(this);
  };

  var plugins = loader.getPlugins();

  plugins.forEach(function(plugin) {
    plugin.init(this);
  }.bind(this));
}

Corsica.prototype.sendMessage = function(name, message) {
  message = message || {};
  var listeners = this.listeners[name] || [];

  return listeners
    .reduce(function(memo, listener) {
      return memo.then(listener);
    }, Promise.resolve(message))

    .then(function(msg) {
      this.websockets.sockets.emit(name, msg);
      return msg;
    }.bind(this))

    .catch(function(err) {
      console.error(err.stack || err);
      // Rethrow
      throw err;
    });
};

Corsica.prototype.on = function(name, cb) {
  this.listeners[name] = this.listeners[name] || [];
  this.listeners[name].push(cb);
};

module.exports = {
  start: function() {
    var core = new Corsica();
    core.start();
    return core;
  }
};
