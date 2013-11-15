/* Description:
 *   pushes a default URL to screens when /reset is hit
 *
 * Dependencies:
 *   None
 *
 * Configuration:
 *   DEFAULT_URL
 *
 * Author:
 *    lonnen, mythmon
 */

var DEFAULT_URL = '/default.html';

module.exports = function(corsica) {
  corsica.on('reset', function(content, promise) {
    var url = DEFAULT_URL;

    content.type = 'url';
    content.url = url;

    corsica.sendMessage('content', content);
    promise.fulfill(content);
  });
};
