/* Description:
 *   pushes a default URL to screens when /reset is hit
 *
 * Dependencies:
 *   None
 *
 * Configuration:
 *   default_url
 *
 * Author:
 *    lonnen, mythmon, potch
 */

var DEFAULT_URL = '/default.html';

module.exports = function (corsica) {
  var settings = corsica.settings.setup('reset', {
    defaultUrl: String,
  }, {
    defaultUrl: '/default.html',
  });

  corsica.on('reset', function (content) {
    return settings.get()
      .then(function (settings) {
        content.type = 'url';
        content.url = settings.defaultUrl;
        corsica.sendMessage('content', content);
        return content;
      });
  });
};
