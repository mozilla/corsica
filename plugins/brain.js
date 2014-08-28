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
var PromiseProxy = require('proxied-promise-object');
var levelup = require('levelup');
var jsondown = require('jsondown');

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
  var dbPath;
  if (corsica.config.STATE_DIR_PATH) {
    console.warn('Warning: STATE_DIR_PATH should now be a path to a json ' +
                 'file to store persistence data, and be in STATE_DIR instead.');
    dbPath = path.join(corsica.config.STATE_DIR_PATH, 'state.json');
  } else {
    dbPath = corsica.config.STATE_PATH;
  }
  console.log('dbPath', dbPath);
  var originalDb = levelup(dbPath, {db: jsondown});
  this.db = new PromiseProxy(Promise, originalDb);
}

Brain.prototype.get = function(key) {
  return this.db.get(key)
  .then(function(value) {
    try {
      return JSON.parse(value);
    } catch (e) {
      return value;
    }
  })
  .catch(function(err) {
    return null;
  });
};

Brain.prototype.set = function(key, value) {
  return this.db.put(key, JSON.stringify(value));
};

Brain.prototype.remove = function(key) {
  return this.db.putObj(key, null);
};

module.exports = function(corsica) {
  corsica.brain = new Brain(corsica);
};
