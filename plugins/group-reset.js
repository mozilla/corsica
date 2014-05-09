/* Description:
 *   Constructs groups of screens, and deals with resetting them.
 *
 * Dependencies:
 *   settings
 *   command
 *
 * Author:
 *    mythmon
 */

var Minimatch = require('minimatch').Minimatch;

module.exports = function (corsica) {
  var useCommand = corsica.config.plugins.indexOf('command') >= 0;

  var settings = corsica.settings.setup('group-reset', {
    groups: [
      {
        search: '*',
        commands: ['http://xkcd.com'],
      },
    ],
  });

  corsica.on('reset', function(msg) {
    settings.get().then(function(settings) {
      var screens = msg.screen;
      if (typeof screen === 'string') {
        screens = [screens];
      }

      screens.forEach(function(screen) {
        var commands = [];
        settings.groups.forEach(function(group) {
          if (screenMatchesSearch(screen, group.search)) {
            commands = commands.concat(group.commands);
          }
        });

        var index = Math.floor(Math.random() * commands.length);
        var command = commands[index] + ' screen=' + screen;

        corsica.sendMessage('command', {raw: command});
      });
    });

    return msg;
  });

  function screenMatchesSearch(screen, search) {
    return Minimatch(search).match(screen);
  }
};
