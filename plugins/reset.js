/* Description:
 *   pushes a default URL to screens when /reset is hit
 *
 * Dependencies:
 *   settings
 *
 * Optional Dependencies:
 *   command - if present, the reset lines can be commands.
 *
 *
 * Configuration:
 *   defaultUrl
 *
 * Author:
 *    lonnen, mythmon, potch
 */

module.exports = {
  requires: ['settings'],
  after: ['settings', 'command'],

  init: function(corsica) {
    var useCommand = corsica.config.plugins.indexOf('command') >= 0;

    var settings = corsica.settings.setup('reset', {
      defaultUrl: ['http://xkcd.com'],
    });

    var urlIndex = 0;

    corsica.on('reset', function(content) {
      return settings.get()
      .then(function (settings) {
        var nextLine = settings.defaultUrl[urlIndex];
        urlIndex = (urlIndex + 1) % settings.defaultUrl.length;

        if (useCommand) {
          if ('screen' in content) {
            nextLine += ' screen=' + content.screen;
          }
          corsica.sendMessage('command', {raw: nextLine});
        } else {
          content.type = 'url';
          content.url = nextLine;
          corsica.sendMessage('content', content);
        }
        return content;
      });
    });
  },
};
