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

var fs = require('fs').promises;
var path = require('path');

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

async function Brain(corsica) {
  if (corsica.config.STATE_DIR_PATH) {
    console.warn('Warning: STATE_DIR_PATH should now be a path to a json ' +
                 'file to store persistence data, and be in STATE_DIR instead.');
    this.dbPath = path.join(corsica.config.STATE_DIR_PATH, 'state.json');
  } else {
    this.dbPath = corsica.config.STATE_PATH;
  }

  let contents = await fs.readFile(this.dbPath);

  this.state = await JSON.parse(contents);
}

Brain.prototype.get = async function(key) {
  return await this.state[key];
};

Brain.prototype.set = async function(key, value) {
  this.state[key] = value;

  return await fs.writeFile(this.dbPath, JSON.stringify(this.state, null, 4);
};

Brain.prototype.remove = async function(key) {
  return await this.set(key, null);
};

module.exports = function(corsica) {
  corsica.brain = new Brain(corsica);
};
