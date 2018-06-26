/* Description:
 *   Stores settings for other plugins, and provides UI.
 *
 * Dependencies:
 *   Brain
 */

const EventEmitter = require("events").EventEmitter;

const specs = {};
const emitters = {};
let corsica;

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
  const key = 'settings::' + name;
  specs[name] = defaults;

  const setupPromise = new Promise(async resolve => {
    const settings = await corsica.brain.get(key) || {};
    await corsica.brain.set(key, settings);
  });

  var emitter = new EventEmitter();
  emitter.get = async () => {
    await setupPromise;
    const settings = await corsica.brain.get(key);
    return corsica.utils.merge(defaults, settings);
  };

  emitter.set = async value => {
    await setupPromise;
    await corsica.brain.set(key, value);
  };

  emitters[name] = emitter;

  return emitter;
}

module.exports = function (corsica_) {
  corsica = corsica_;
  corsica.settings = { setup };

  if (!corsica.brain) {
    throw new Error('Plugin "settings" requires plugin "brain".');
  }

  corsica.on('settings.getSpecs', message => {
    message.specs = specs;
    return message;
  });

  corsica.on('settings.get', async message => {
    const setttings = await corsica.brain.get(`settings::${message.plugin}`);
    message.settings = corsica.utils.merge(specs[message.plugin], settings);
    return message;
  });

  corsica.on('settings.set', async message => {
    const { plugin, settings } = message;
    await corsica.brain.set(`settings::${plugin}`, settings);
    emitters[plugin].emit('updated', settings);
    return message;
  });
};
