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
module.exports = function(corsica) {
  corsica.on('reset', function(content, promise) {
    var url = content.url ||
              corsica.config.DEFAULT_URL ||
              'http://imgur.com/SBvarB8.gif';

    content.type = 'url';
    content.url = url;

    corsica.sendMessage('content', content);
    promise.fulfill(content);
  });
};
