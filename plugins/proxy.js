/* Description:
 *   Sets up the `request` library to deal with any system proxies that
 *   may exist.
 *
 * Dependencies:
 *   request
 *
 * Configuration:
 *   None
 */

var request = require('request');

module.exports = {
  phase: 0,

  init: function (corsica) {
    var proxyUrl = corsica.config.http_proxy || corsica.config.HTTP_PROXY;
    if (proxyUrl) {
      corsica.request = corsica.request.defaults({'proxy': proxyUrl});
    }
  },
};
