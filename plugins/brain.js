/* Description:
 *   pushes a default URL to screens when /reset is hit
 *
 * Dependencies:
 *   None
 *
 * Configuration:
 *   None
 *
 * Author:
 *    lonnen
 */

/* Extend an object with arbitrary other objects in a splat
 *
 * return the original object with updated changes
 */

var promises = require('promisesaplus');

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

function Brain() {
  this.data = {};
}

// This api doesn't need to by async yet, but it probably will later.
Brain.prototype.get = function(key) {
  var p = promises();
  p.fulfill(this.data[key] || null);
  return p;
};

Brain.prototype.set = function(key, value) {
  var p = promises();
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
  var p = promises();
  if (this.data[key] !== null) {
    delete this.data[key];
    p.fulfill(true);
  } else {
    p.fulfill(false);
  }
  return p;
};

module.exports = function(corsica) {
  corsica.brain = new Brain();
};
