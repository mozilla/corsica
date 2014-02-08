/* Description:
 *   Stores settings for other plugins, and provides UI.
 *
 * Dependencies:
 *   Brain
 */

var Promise = require('es6-promise').Promise;
var EventEmitter = require("events").EventEmitter;

var specs = {};
var emitters = {};
var corsica;

/* Setup a settings namespace.
 *
 * Parameters:
 *
 *   namespace - The namespace to store setting under. This should
 *     probably be the plugin name.
 *   defaults - The specification for your setting. This is an object where
 *     the keys are the names of your settings, and the values are the
 *     default values.
 *
 * Example defaults:
 *
 *   {
 *     resetURL: 'http://example.com/'
 *     timeout: 1000,
 *     screens: ['foo', 'bar'],
 *     active: true
 *   }
 *
 * Returns an EventEmitter with the following methods:
 *
 *   get() - returns a promise that will be resolved with all the
 *      settings associated with this namespace.
 *   set(valueObj) - returns a promise that will be resolved when the
 *      settings have been set to `valueObj`, or rejects otherwise.
 *      `valueObj` should be all the keys in settings. This is not merge.
 *
 * And the following events:
 *
 *   'updated' - fired when the settings are updated. Called with an
 *       object containings the new settings.
 */
function setup(name, defaults) {
  var key = 'settings::' + name;
  specs[name] = defaults;

  var setupDeferred = new Promise(function (resolve, reject) {
    corsica.brain.get(key)
      .then(function (settings) {
        settings = settings || {};
        resolve(corsica.brain.set(key, settings));
      });
  });

  var emitter = new EventEmitter();
  emitter.get = function () {
    return setupDeferred
      .then(function () {
        return corsica.brain.get(key);
      })
      .then(function (settings) {
        return corsica.utils.merge(defaults, settings);
      });
  };
  emitter.set = function (value) {
    return setupDeferred.then(function () {
      return corsica.brain.set(key, value);
    });
  };

  emitters[name] = emitter;

  return emitter;
}

module.exports = function (corsica_) {
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

  corsica.on('settings.get', function (plugin) {
    return corsica.brain.get('settings::' + plugin).then(function (settings) {
      return corsica.utils.merge(specs[plugin], settings);
    });
  });

  corsica.on('settings.set', function (opts) {
    var plugin = opts.plugin;
    var values = opts.settings;
    return corsica.brain.set('settings::' + plugin, values).then(function () {
      emitters[plugin].emit('updated', values);
    });
  });

};
