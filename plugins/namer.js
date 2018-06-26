/* Description:
 *   Give names to clients.
 *
 * Dependencies:
 *   None
 *
 * Configuration:
 *   None
 */
const fs = require('fs');
const path = require('path');

const staticPath = path.resolve(path.join(path.dirname(__filename), '..', 'static'));


module.exports = function (corsica) {
  const namesPath = path.join(staticPath, 'names.txt');
  const namesPromise = new Promise(function (resolve, reject) {
    fs.readFile(namesPath, { encoding: 'utf-8' }, (err, data) => {
      if (err) {
        reject(err);
      }
      // The last item will be an empty string, since the file ends in a newline.
      try {
        resolve(data.split('\n').filter(n => n.trim() !== ''));
      } catch (e) {
        reject(e);
      }
    });
  });

  corsica.on('getName', async message => {
    console.log('getName');
    try {
      const names = await namesPromise;
      var i = Math.floor(Math.random() * names.length);
      message.name = names[i];
    } catch (err) {
      message.name = corsica.utils.randomId();
    }
    return message;
  });
};
