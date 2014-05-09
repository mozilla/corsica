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
