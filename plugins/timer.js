/* Description:
 *   Emits reset signals on a timer.
 *
 * Dependencies:
 *   settings, reset
 *
 * Configuration:
 *   resetTime - Time between resets on each screen, in milliseconds.
 *
 * Author:
 *    mythmon
 */

var Promise = require('es6-promise').Promise;

module.exports = function (corsica) {
  var settings = corsica.settings.setup('timer', {
    resetTime: 2 * 60 * 1000,
    resetOnConnect: true,
  });

  var clientCounters = {};
  var utils = corsica.utils;

  corsica.on('census.connected', function (data) {
    var name = data.name;
    if (name === undefined) {
      return;
    }
    makeTimeout(name);
    settings.get()
      .then(function(settings) {
        if (settings.resetOnConnect) {
          corsica.sendMessage('reset', {screen: name});
        }
      });
    return data;
  });

  corsica.on('census.disconnected', function (data) {
    // Invalidate the timer.
    clientCounters[data.name]++;
  });

  function makeTimeout(name) {
    if (name === undefined) {
      return Promise.reject();
    }
    var currentCounter = clientCounters[name] = (clientCounters[name] || 0) + 1;

    /* Get the reset time, wait for that number of milliseconds, reset
     * the give screen, and then set another timeout.
     *
     * If makeTimeout gets called again, clientCounter[name] will get
     * incremented, making this promise chain invalid.
     */
    return settings.get()
      .then(utils.get('resetTime'))
      .then(utils.timerPromise) // Gets resetTime as an argument.
      .then(function () {
        if (clientCounters[name] !== currentCounter) {
          // The counter got incremented, this chain is no longer valid.
          return;
        }
        makeTimeout(name);
        corsica.sendMessage('reset', {'screen': name});
        console.log('[timer]', 'reset', name);
      })
      .catch(function (err) {
        console.error('Error:', err);
      });
  }

  corsica.on('content', function (content) {
    // If a screen is getting new content, start a new counter.
    makeTimeout(content.screen);
    return content;
  });

};
