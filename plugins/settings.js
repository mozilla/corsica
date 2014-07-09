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

  corsica.nunjucks.addFilter('type', function(val) {
    if (val instanceof Array) {
      return 'array';
    } else if (val === true || val === false) {
      return 'boolean';
    } else {
      return 'unknown';
    }
  });

  corsica.on('settings.getSpecs', function (message) {
    message.specs = specs;
    return message;
  });

  corsica.on('settings.get', function (message) {
    return corsica.brain.get('settings::' + message.plugin).then(function (settings) {
      message.settings = corsica.utils.merge(specs[message.plugin], settings);
      return message;
    });
  });

  corsica.on('settings.set', function (message) {
    var plugin = message.plugin;
    var values = message.settings;
    return corsica.brain.set('settings::' + plugin, values).then(function () {
      emitters[plugin].emit('updated', values);
      return message;
    });
  });

  corsica.on('admin.getPanels', function(message) {
    message.panels = message.panels || [];
    var keys = [];
    for (var key in specs) {
      keys.push(key);
    }
    return Promise.all(keys.map(function(key) {
      return corsica.brain.get('settings::' + key)
      .then(function(settings) {
        return [key, corsica.utils.merge(specs[key], settings)];
      });
    }))
    .then(function(allSettings) {
      allSettings.forEach(function(keyAndSettings) {
        var key = keyAndSettings[0];
        var settings = keyAndSettings[1];
        if (settings._skipUI) {
          return;
        }
        message.panels.push({
          id: key,
          class: 'settings',
          title: key,
          body: corsica.nunjucks.render('settings.html', {settings: settings}),
        });
      });

      return message;
    });
  });

  corsica.on('admin.getScripts', function(message) {
    message.scripts = message.scripts || [];
    message.scripts.push(corsica.utils.iife(function() {
      // This function runs on the client.


      var settingsEls = document.querySelectorAll('.panel.settings');
      document.querySelector('.panels').addEventListener('submit', function(e) {
        // Did this come from a settings panel?
        var panelEl = e.originalTarget.parentNode.parentNode;
        if (panelEl.classList.contains('settings')) {
          e.preventDefault();
          var formEl = e.originalTarget;
          var rows = formEl.querySelectorAll('.row');
          var data = {};
          var input;

          for (var i = 0; i < rows.length; i++) {
            if (rows[i].classList.contains('many')) {
              throw new Error("Can't do many type fields yet.");
            }
            input = rows[i].querySelector('input');
            if (!input) {
              continue;
            }
            if (input.getAttribute('type') === 'checkbox') {
              data[input.getAttribute('name')] = !!input.checked;
            } else {
              data[input.getAttribute('name')] = input.value;
            }
          }

          var name = panelEl.getAttribute('id').replace(/^panel\-/, '');
          panelEl.classList.add('pending');

          console.log('plugin', name, 'data', data);
          sendMessage('settings.set', {
            plugin: name,
            settings: data,
          })
          .then(function(msg) {
            console.log('save ok', msg);
            panelEl.classList.remove('pending');
          })
          .catch(function(err) {
            console.error('save error', err);
          });

        }
      });
    }));
    return message;
  });
};
