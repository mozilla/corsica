const path = require('path');

const request = require('request');

const utils = require('./utils');
const config = require('./config');
const server = require('./server');
const websockets = require('./websockets');
const http = require('./http');


class Corsica {
  constructor() {
    this.dirname = path.normalize(__dirname + '/../');
    this.config = config;
    this.utils = utils;
    this.request = request;
    http.init(this);
    this.http = http;

    this.listeners = {};

    this.loadPlugins();
  }

  start() {
    this.server = server.start(this);
    this.websockets = websockets.start(this);
  }

  async sendMessage(name, message = {}) {
    let listeners = this.listeners[name] || [];
    listeners = listeners.concat(this.listeners['*'] || []);

    for (const listener of listeners) {
      message = await listener(message);
    }

    this.websockets.sockets.emit(name, message);
    return message;
  }

  serveRoute(name, handler) {
    if (name[0] === '/') {
      throw new Error('plugin paths must not begin with `/`: ' + name);
    }
    if (name.length === 0) {
      throw new Error('route name must not be empty');
    }
    console.log('registering plugin route at /' + name);
    server.expressApp.use('/' + name, handler);
  }

  on(name, cb) {
    this.listeners[name] = this.listeners[name] || [];
    this.listeners[name].push(cb);
  }

  loadPlugins() {
    function checkError(name, e) {
      if (e.code && e.code === 'MODULE_NOT_FOUND') {
        return true;
      } else {
        if (e.stack) {
          console.error(`Error loading module "${name}".`);
          console.info(e.stack);
        } else {
          console.error('Error loading module "${name}": ${e}.');
        }
        return false;
      }
    }

    for (const name of this.config.plugins) {
      try {
        require(`../plugins/${name}`)(this);
        console.log(`Loaded local plugin ${name}.`);
      } catch (e) {
        if (checkError(name, e)) {
          console.error(`Could not load plugin "${name}" from any sources`);
          console.error(e.stack || e);

        } else {
          try {
            require(name)(this);
            console.log(`Loaded NPM plugin "${name}"`);
          } catch (e) {
            if (checkError(name, e)) {
              console.error(`Could not load plugin "${name}" from any sources`);
              console.error(e.stack || e);
            }
          }
        }
      }
    }
  }
}

module.exports = {
  start() {
    const core = new Corsica();
    core.start();
    return core;
  }
};
