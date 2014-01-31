var path = require('path');
var fs = require('fs');

var Promise = require('es6-promise').Promise;


/* Python new-style string formatting.
 * > "Hello, {0}.".format('Mike');
 * Hello, Mike.
 * > "How is the weather in {citi}?".format({city: 'Mountain View'})
 * How is the weather in Mountain View?
 */
String.prototype.format = function(obj) {
  var args = arguments;
  var str = this;
  // Support either an object, or a series.
  return str.replace(/\{[\w\d\._-]+\}/g, function(part) {
    // Strip off {}.
    part = part.slice(1, -1);
    var index = parseInt(part, 10);
    if (isNaN(index)) {
      return dottedGet(obj, part);
    } else {
      return args[index];
    }
  });
};

function dottedGet(obj, selector) {
  selector = selector.split('.');
  while (selector.length) {
    obj = obj[selector.splice(0, 1)[0]];
  }
  return obj;
}

/* Get a random string of [0-9a-z] that is 8 characters long. */
function randomId() {
  return ('00000000' + Math.random().toString(36)).slice(-8);
}


var getName = (function() {
  var names = null;
  var namesPath = path.normalize(path.join(__dirname, '../static/names.txt'));

  fs.readFile(namesPath, {encoding: 'utf-8'}, function(err, data) {
    if (err) {
      return;
    }
    // The last item will be an empty string, since the file ends in a newline.
    try {
      names = data.split('\n').slice(0, -1);
    } catch (e) {
    }
  });

  return function getName() {
    if (!names || !names.length) {
      return randomId();
    }
    var i = Math.floor(Math.random() * names.length);
    return names.splice(i, 1)[0];
  };
})();


module.exports = {
  dottedGet: dottedGet,
  getName: getName,
  randomId: randomId,
};
