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
  const useCommand = corsica.config.plugins.indexOf('command') >= 0;

  const subscriptions = {};
  const sequencePosition = {};

  const settings = corsica.settings.setup('tags', {
    _skipUI: true,
    tags: [
      {
        name: 'default',
        random: false,
        commands: []
      },
    ],
  });

  function insecureScrub(str) {
    return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  };

  corsica.serveRoute('tags', async (req, res) => {
    let out = '<html>';
    const settings = await settings.get();
    res.send(`
      <html>
        <h1>Tags</h1>
        <pre>${insecureScrub(JSON.stringify(settings, null, 2))}</pre>
        <h1>Subscriptions</h1>
        <pre>${insecureScrub(JSON.stringify(subscriptions, null, 2))}</pre>
      </html>
    `);
  });

  corsica.on('tags.getSubscriptions', message => {
    message.subscriptions = subscriptions;
    return message;
  });

  corsica.on('tags.setSubscriptions', msg => {
    console.log('setting tag subscriptions for', msg.name, msg.tags);
    if (msg.tags && msg.name) {
      subscriptions[msg.name] = msg.tags;
    }
    return msg;
  });

  corsica.on('reset', reset);
  corsica.on('clear', reset);

  async function reset(msg) {
    const settings = await settings.get();
    const screens = msg.screen;
    if (typeof screens === 'string') {
      screens = [screens];
    }

    for (const screen of screens) {
      console.log('resetting', screen);
      const commands = [];
      const subs = subscriptions[screen];

      if (!subs) {
        console.log('no subscriptions found for screen');
        return;
      }
      for (const tag of settings.tags) {
        if (subs.includes(tag.name)) {
          commands = commands.concat(tag.commands);
        }
      }
    }

    commands = commands.filter(command => {
      const c = corsica.parseCommand(command).message;
      const now = Date.now();
      let start = 0;
      let end = Infinity;

      if (c.start) {
        start = Date.parse(c.start);
      }
      if (c.end) {
        end = Date.parse(c.end);
      }

      return start < now && now < end;
    });

    let index;
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
      const command = commands[index] + ' screen=' + screen;
      corsica.sendMessage('command', { raw: command });
    }

    return msg;
  }
};
