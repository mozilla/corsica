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

var promise = require('promisesaplus');
var lvl = require('lvl');

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
  return this.db.getObj(key).then(
    null,
    function err(err) {
      return null;
    }
  );
};

Brain.prototype.set = function(key, value) {
  var p = promise();
  var pair;
  if (key === Object(key)) {
    pair = key;
  }
  else {
    pair = {};
    pair[key] = value;
  }
  extend(this.data, pair);
  p.fulfill();
  return p;
};

Brain.prototype.remove = function(key) {
  var p = promise();
  if (this.data[key] !== null) {
    delete this.data[key];
    p.fulfill(true);
  } else {
    p.fulfill(false);
  }
  return p;
};

module.exports = function(corsica) {
  corsica.brain = new Brain(corsica);
};
