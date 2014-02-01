/* Description:
 *   Give names to functions.
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


module.exports = function(corsica) {
  var namesPath = path.join(corsica.dirname, 'static/names.txt');
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

  corsica.on('getName', function(content) {
    console.log('getName');
    return names.then(
      function(names) {
        var i = Math.floor(Math.random() * names.length);
        return names[i];
      },
      function(err) {
        return corsica.utils.randomId();
      });
  });
};
