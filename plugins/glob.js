/* Description:
 *   Expands screen name globs.
 *
 * Dependencies:
 *   census
 *
 * Configuration:
 *   None
 *
 * Author:
 *    mythmon
 */

const { Minimatch } = require('minimatch');

module.exports = function (corsica) {
  corsica.on('*', async message => {
    if (message && message.screen) {
      let patternTexts = message.screen;
      if (typeof patternTexts === 'string') {
        patternTexts = [patternTexts];
      }

      const patterns = patternTexts.map(Minimatch);

      const data = await corsica.sendMessage('census.clients');
      const matchedScreens = new Set();
      const screens = data.clients;
      for (const pattern of patterns) {
        for (const screen of screens) {
          if (pattern.match(screen)) {
            matchedScreens.add(screen);
          }
        }
      }
      message.screen = Array.from(matchedScreens);
    }

    return message;
  });
};
