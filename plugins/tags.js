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
  var sequencePosition = {};

  var settings = corsica.settings.setup('tags', {
    _skipUI: true,
    tags: [
      {
        name: 'default',
        random: false,
        commands: []
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

  corsica.on('tags.getSubscriptions', function(message) {
    message.subscriptions = subscriptions;
    return message;
  });

  corsica.on('tags.setSubscriptions', function (msg) {
    console.log('setting tag subscriptions for', msg.name, msg.tags);
    if (msg.tags && msg.name) {
      subscriptions[msg.name] = msg.tags;
    }
    return msg;
  });

  corsica.on('reset', reset);
  corsica.on('clear', reset);

  function reset(msg) {
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

        commands = commands.filter(function (command) {
          var c = corsica.parseCommand(command).message;

          var start;
          var end;

          if (c.start) {
            start = Date.parse(c.start);
          } else {
            start = 0;
          }

          if (c.end) {
            end = Date.parse(c.end);
          } else {
            end = Infinity;
          }

          var now = Date.now();

          return start < now && now < end;
        });

        var index;
        if (commands.length) {
          if (settings.random) {
            console.log('sampling from', commands.length, 'commands');
            index = Math.floor(Math.random() * commands.length);
          } else {
            index = sequencePosition[screen.toString()] || 0;
            console.log('sequence position: ' + index + '/' + (commands.length - 1));
            console.log(index, commands.length);
            if (index >= commands.length) {
              index = 0;
            }
            sequencePosition[screen.toString()] = index + 1;
          }
          var command = commands[index] + ' screen=' + screen;
          corsica.sendMessage('command', {raw: command});
        }
      });
    }).catch(console.error.bind(console));

    return msg;
  }
};
