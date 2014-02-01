/* Description:
 *   Stores settings for other plugins, and provides UI.
 *
 * Dependencies:
 *   Brain
 */

var Promise = require('es6-promise').Promise;

var specs = {};
var corsica;

/* Setup a settings namespace.
 *
 * Parameters:
 *
 *   namespace - The namespace to store setting under. This should
 *     probably be the plugin name.
 *   spec - The specification for your setting. This is an object where
 *     the keys are the names of your settings, and the values are the
 *     types. Types are things like `String`, `Boolean`, or
 *     `Array(String)`, ie: Constructors, or Constructors in an array.
 *   defaults (optional) - This is an object with that has keys which are
 *     a subset of the keys for spec. If provided, the values will be set
 *     as default values for the settings.
 *
 * Example specification:
 *
 *   {
 *     resetURL: String,
 *     timeout: Number,
 *     screens: Array(String),
 *     active: Boolean,
 *   }
 *
 * Returns an object with the following methods:
 *
 *   get() - returns a promise that will be resolved with all the
 *      settings associated with this namespace.
 *   set(valueObj) - returns a promise that will be resolved when the
 *      settings have been set to `valueObj`, or rejects otherwise.
 *      `valueObj` should be all the keys in settings. This is not merge.
 */
function setup(name, spec, defaults) {
  var key = 'settings::' + name;
  specs[name] = spec;

  var setupDeferred = new Promise(function(resolve, reject) {
    corsica.brain.get(key)
      .then(function(settings) {
        settings = settings || {};
        for (var k in defaults) {
          if (!(k in settings)) {
            settings[k] = defaults[k];
          }
        }
        resolve(corsica.brain.set(key, settings));
      });
  });

  return {
    get: function() {
      return setupDeferred.then(function() {
        return corsica.brain.get(key);
      });
    },
    set: function(value) {
      return setupDeferred.then(function() {
        return corsica.brain.set(key, value);
      });
    },
  };
}

module.exports = function(corsica_) {
  corsica = corsica_;
  corsica.settings = {
    setup: setup,
  };

  corsica.on('settings.getSpecs', function () {
    console.log('asked for setting');
    return new Promise(function (resolve) {
      resolve(specs);
    });
  });

  corsica.on('settings.get', function (name) {
    return corsica.brain.get('settings::' + name);
  });

};
