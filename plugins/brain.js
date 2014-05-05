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

var Promise = require('es6-promise').Promise;
var lvl = require('lvl');

module.exports = {
  init: function(corsica) {
    corsica.brain = new Brain(corsica);
  },
};

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
  this.db = lvl(corsica.config.STATE_DIR_PATH);
}

Brain.prototype.get = function(key) {
  return Promise.cast(this.db.getObj(key))
    .catch(function(err) {
      return null;
    });
};

Brain.prototype.set = function(key, value) {
  return Promise.cast(this.db.putObj(key,value));
};

Brain.prototype.remove = function(key) {
  return Promise.cast(this.db.putObj(key, null));
};
