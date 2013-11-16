/* Description:
 *   Stores settings for other plugins, and provides UI.
 *
 * Dependencies:
 *   Brain
 */

var specs = {};
var corsica;

function setup(namespace, spec, defaults) {
  var data = {};

  var key = function(name) {
    return namespace + ':' + name;
  };

  var name, Type;
  for (name in spec) {
    Type = spec[name];
    corsica.brain.set(key(name), Type(defaults[name]));
  }

  specs[namespace] = spec;

  var ret = {
    get: function(name) {
      return corsica.brain.get(key(name));
    },
    set: function(name, value) {
      return corsica.brain.set(key(name), value);
    }
  };
  return ret;
}

module.exports = function(corsica_) {
  corsica = corsica_;
  corsica.settings = {
    setup: setup,
  };
};
