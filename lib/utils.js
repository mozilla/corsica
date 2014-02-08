var path = require('path');
var fs = require('fs');

var Promise = require('es6-promise').Promise;


/* Python new-style string formatting.
 * > "Hello, {0}.".format('Mike');
 * Hello, Mike.
 * > "How is the weather in {citi}?".format({city: 'Mountain View'})
 * How is the weather in Mountain View?
 */
String.prototype.format = function (obj) {
  var args = arguments;
  var str = this;
  // Support either an object, or a series.
  return str.replace(/\{[\w\d\._-]+\}/g, function (part) {
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

/* From obj, get selector. If selector has dots in it, get the first
 * key from obj, and the second key from that, and the third from that,
 * and so forth.
 *
 * In other words, `dottedGet(obj, 'foo.bar.baz')` is equivalent to
 * `obj.foo.bar.baz`.
 */
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

/* Make a function that returns arguments[0][key]. */
function get(key) {
  return function (obj) {
    return obj[key];
  };
}

/* Return a promise that will resolve() in `time` milliseconds. */
function timerPromise(time) {
  return new Promise(function (resolve, reject) {
    setTimeout(resolve, time);
  });
}

/* Returns a union of many objects. Objects further to the right in the
 * arguments list win any disputes. Does not modify any of them. */
function merge(/* ...objs */) {
  var res = {};
  Array.prototype.forEach.call(arguments, function(obj) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        res[key] = obj[key];
      }
    }
  });
  return res;
}

module.exports = {
  dottedGet: dottedGet,
  randomId: randomId,
  get: get,
  timerPromise: timerPromise,
  merge: merge,
};
