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
 *    lonnen, mythmon
 */

var DEFAULT_URL = '/default.html';

module.exports = function(corsica) {
  var settings = corsica.settings.setup('reset', {
      defaultUrl: String,
    }, {
      defaultUrl: '/default.html',
    });

  corsica.on('reset', function(content, promise) {
    content.type = 'url';
    content.url = settings.get('defaultUrl');
    console.log('reset: ', content);

    corsica.sendMessage('content', content);
    promise.fulfill(content);
  });
};
