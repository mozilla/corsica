var path = require('path');

var Promise = require('es6-promise').Promise;
var request = require('request');

var utils = require('./utils');
var config = require('./config');
var server = require('./server');
var websockets = require('./websockets');


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

  this.loadPlugins();
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

  function loadPlugin(name) {
    var plugin;
    // Local Plugin
    try {
      plugin = require('../plugins/' + name);
      console.log('Loaded local plugin "{0}".'.format(name));
      return plugin;
    } catch(e) {}

    // Unprefixed npm plugin
    try {
      plugin = require(name);
      console.log('Loaded npm plugin "{0}".'.format(name));
    } catch(e) {}

    console.log('Could not load plugin "{0}" from any sources.'.format(name));
    return null;
  }

  var pluginsToLoad = [];
  var namesSeen = {};

  var requireFails = [];

  this.config.plugins.forEach(function(name) {
    var plugin = loadPlugin(name);
    if (plugin === null) {
      return;
    }
    if (typeof plugin === 'function') {
      plugin = {init: plugin};
    }

    (plugin.requires || []).forEach(function(requirement) {
      if (!namesSeen[requirement]) {
        requireFails.push('Plugin "{0}" requires "{1}", but it is not loaded.'
                          .format(name, requirement));
      }
    });

    pluginsToLoad.push(plugin);
    namesSeen[name] = true;
  });

  if (requireFails.length) {
    requireFails.forEach(console.error);
    process.exit(1);
  }

  pluginsToLoad.forEach(function(plugin) {
    plugin.init(this);
  }.bind(this));
};

module.exports = {
  start: function() {
    var core = new Corsica();
    core.start();
    return core;
  }
};
