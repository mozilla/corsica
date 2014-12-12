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
    jitter: 15 * 1000,
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

  function makeTimeout(name, customTimeout) {
    if (name === undefined) {
      console.log('[timer] Error: No name.');
      return Promise.reject();
    }
    // Increment the counter index, and invalidate the old one.
    var currentCounter = clientCounters[name] = (clientCounters[name] || 0) + 1;

    /* Get the reset time, wait for that number of milliseconds, reset
     * the give screen, and then set another timeout.
     *
     * If makeTimeout gets called again, clientCounter[name] will get
     * incremented, making this promise chain invalid.
     */
    return settings.get()
      .then(function(settings) {
        var resetTime, jitter;

        if (!isNaN(customTimeout)) {
          resetTime = customTimeout;
          jitter = 0;
        } else if ('screens' in settings && name in settings.screens) {
          resetTime = parseInt(settings.screens[name].resetTime || settings.resetTime);
          jitter = parseInt(settings.screens[name].jitter || settings.jitter);
        } else {
          resetTime = +settings.resetTime;
          jitter = +settings.jitter;
        }

        var offset = jitter * (Math.random() * 2 - 1);
        return utils.timerPromise(resetTime + offset);
      })
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
    var screens = content.screen;
    if (typeof screens === 'string') {
      screens = [screens];
    }
    screens.forEach(function(screen) {
      makeTimeout(screen, parseFloat(content.timeout) * 1000);
    });
    return content;
  });

  corsica.on('timer.stop', function(content) {
    console.log('stopping timer for', content.screen);
    var screens = content.screen;
    if (!(screens instanceof Array)) {
      screens = [screens];
    }

    screens.forEach(function(screen) {
      if (clientCounters[screen]) {
        clientCounters[screen]++;
      }
    });

    return content;
  });

  corsica.on('timer.start', function(content) {
    console.log('restarting timer for', content.screen);
    corsica.sendMessage('reset', {screen: content.screen});
    return content;
  });
};
