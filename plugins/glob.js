/* Description:
 *   Expands screen name globs.
 *
 * Dependencies:
 *   census
 *
 * Configuration:
 *   None
 *
 * Author:
 *    mythmon
 */

var Promise = require('es6-promise').Promise;
var Minimatch = require('minimatch').Minimatch;

module.exports = function (corsica) {
  corsica.on('*', function (message) {
    if (message && message.screen) {
      var screens = message.screen;
      if (typeof screens === 'string') {
        screens = [screens];
      }

      var patterns = screens.map(Minimatch);

      return corsica.sendMessage('census.clients')
      .then(function(data) {
        var matchedScreens = [];
        var screens = data.clients;
        patterns.forEach(function(pattern) {
          screens.forEach(function(screen) {
            if (pattern.match(screen)) {
              matchedScreens.push(screen);
            }
          });
        });
        message.screen = matchedScreens;
        return message;
      });

    } else {
      return message;
    }
  });
};
