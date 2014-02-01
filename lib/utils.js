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


module.exports = {
  dottedGet: dottedGet,
  randomId: randomId,
};
