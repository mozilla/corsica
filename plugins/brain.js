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

Brain.prototype.get = function(key) {
  return this.data[key] || null;
};

Brain.prototype.set = function(key, value) {
  var pair;
  if (key === Object(key)) {
    pair = key;
  }
  else {
    pair = {};
    pair[key] = value;
  }
  extend(this.data, pair);
};

Brain.prototype.remove = function(key) {
  if (this.data[key] !== null) {
    delete this.data[key];
  }
  return this;
};

var DEFAULT_URL = '/default.html';

module.exports = function(corsica) {
  corsica.brain = new Brain();
};
