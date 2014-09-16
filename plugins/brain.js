/* Description:
 *   Stores data for other plugins. Basic key value store.
 *
 * Dependencies:
 *   None
 *
 * Configuration:
 *   STATE_DIR_PATH
 *
 * Author:
 *    lonnen
 */

/* Extend an object with arbitrary other objects in a splat
 *
 * return the original object with updated changes
 */

var fs = require('fs');
var path = require('path');

var Promise = require('es6-promise').Promise;

function extend() {
  var obj = arguments[0];
  var sources = [];
  if (arguments.length > 1) {
    sources = Array.prototype.slice.call(arguments, 1);
  }

  for (var i = 0, len = sources.length; i < len; i++) {
    var source = sources[i];
    for (var key in source) {
      if (!Object.prototype.hasOwnProperty.call(source, key)) {
        continue;
      }
      var value = source[key];
      obj[key] = value;
    }
  }
  return obj;
}

function Brain(corsica) {
  if (corsica.config.STATE_DIR_PATH) {
    console.warn('Warning: STATE_DIR_PATH should now be a path to a json ' +
                 'file to store persistence data, and be in STATE_DIR instead.');
    this.dbPath = path.join(corsica.config.STATE_DIR_PATH, 'state.json');
  } else {
    this.dbPath = corsica.config.STATE_PATH;
  }

  this.statePromise = new Promise(function(resolve, reject) {
    fs.readFile(this.dbPath, function(err, contents) {
      if (err) {
        console.error(err.stack || err);
        resolve({});
      } else {
        resolve(JSON.parse(contents));
      }
    }.bind(this));
  }.bind(this));
}

Brain.prototype.get = function(key) {
  return this.statePromise
  .then(function(state) {
    return state[key];
  });
};

Brain.prototype.set = function(key, value) {
  return this.statePromise
  .then(function(state) {
    state[key] = value;
    this.statePromise = Promise.resolve(state);
    return new Promise(function(resolve, reject) {
      fs.writeFile(this.dbPath, JSON.stringify(state, null, 4), function(err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    }.bind(this));
  }.bind(this));
};

Brain.prototype.remove = function(key) {
  return this.set(key, null);
};

module.exports = function(corsica) {
  corsica.brain = new Brain(corsica);
};
