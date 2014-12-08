/* Description:
 *   Constructs groups of screens, and deals with resetting them.
 *
 * Dependencies:
 *   settings
 *   command
 *   census
 *
 * Author:
 *   potch
 */

module.exports = function (corsica) {
  var useCommand = corsica.config.plugins.indexOf('command') >= 0;

  var subscriptions = {};

  var settings = corsica.settings.setup('tags', {
    _skipUI: true,
    tags: [
      {
        name: 'default',
        commands: ['http://xkcd.com'],
      },
    ],
  });

  var insecureScrub = function(str) {
    return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  };

  corsica.serveRoute('tags', function(req, res) {
    var out = '<html>';
    settings.get().then(function (settings) {
      out += '<h1>Tags</h1>';
      out += '<pre>' + insecureScrub(JSON.stringify(settings, null, 2)) + '</pre>';
      out += '<h1>Subscriptions</h1>';
      out += '<pre>' + insecureScrub(JSON.stringify(subscriptions, null, 2)) + '</pre>';
      out += '</html>';
      res.send(out);
    });
  });

  corsica.on('tags.setSubscriptions', function (msg) {
    console.log('setting tag subscriptions for', msg.name, msg.tags);
    if (msg.tags && msg.name) {
      subscriptions[msg.name] = msg.tags;
    }
    return msg;
  });

  corsica.on('reset', function (msg) {
    settings.get().then(function (settings) {

      var screens = msg.screen;
      if (typeof screens === 'string') {
        screens = [screens];
      }

      screens.forEach(function (screen) {
        console.log('resetting', screen);

        var commands = [];
        var subs = subscriptions[screen];
        if (!subs) {
          console.log('no subscriptions found for', screen);
          return;
        }
        settings.tags.forEach(function (tag) {
          if (subs.indexOf(tag.name) !== -1) {
            commands = commands.concat(tag.commands);
          }
        });

        console.log('sampling from', commands.length, 'commands:', commands);

        if (commands.length) {
          var index = Math.floor(Math.random() * commands.length);
          var command = commands[index] + ' screen=' + screen;

          corsica.sendMessage('command', {raw: command});
        }
      });
    }).catch(console.error.bind(console));

    return msg;
  });
};
