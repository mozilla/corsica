/* Description:
 *   pushes a default URL to screens when /reset is hit
 *
 * Dependencies:
 *   settings
 *
 * Configuration:
 *   defaultUrl
 *
 * Author:
 *    lonnen, mythmon
 */

module.exports = function (corsica) {
  var settings = corsica.settings.setup('reset', {
      defaultUrl: String,
    }, {
      defaultUrl: '/default.html',
    });

  corsica.on('reset', function(content) {
    return settings.get()
      .then(function(settings) {
        content.type = 'url';
        content.url = settings.defaultUrl;
        corsica.sendMessage('content', content);
        return content;
      });
  });
};
