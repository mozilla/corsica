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
    // If there is a * or a ? in the screen name, activate globbing.
    // Otherwise, pass it on unmodified.
    if (message && (message.screen || '').match(/[\*\?\+\|]/)) {
      var pattern = Minimatch(message.screen);

      return corsica.sendMessage('census.clients')
      .then(function(data) {
        message.screen = data.clients.filter(pattern.match.bind(pattern));
        return message;
      });

    } else {
      return message;
    }
  });
};
