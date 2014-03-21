/* Description:
 *   Give names to clients.
 *
 * Dependencies:
 *   None
 *
 * Configuration:
 *   None
 */
var fs = require('fs');
var path = require('path');

var Promise = require('es6-promise').Promise;

var staticPath = path.resolve(path.join(path.dirname(__filename), '..', 'static'));


module.exports = function(corsica) {
  var namesPath = path.join(staticPath, 'names.txt');
  var names = new Promise(function(resolve, reject) {
    fs.readFile(namesPath, {encoding: 'utf-8'}, function(err, data) {
      if (err) {
        reject(err);
      }
      // The last item will be an empty string, since the file ends in a newline.
      try {
        resolve(data.split('\n').slice(0, -1));
      } catch (e) {
        reject(e);
      }
    });
  });

  corsica.on('getName', function(message) {
    console.log('getName');
    return names.then(
      function(names) {
        var i = Math.floor(Math.random() * names.length);
        message.name = names[i];
        return message;
      },
      function(err) {
        message.name = corsica.utils.randomId();
        return message;
      });
  });
};
