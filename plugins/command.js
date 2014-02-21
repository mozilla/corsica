/* Description:
 *   Generic command parsing and dispatch.
 *
 * Dependencies:
 *   None
 *
 * Configuration:
 *   None
 *
 * Author:
 *    mythmon
 *
 * Takes messages that look like "foo bar=baz qux" and converts them to
 * `sendMessage('foo', {bar: baz, _args: ['qux']})`
 *
 * Special processing: if the first space-separated part of the string
 * looks like a url, this will make a content message like
 * `sendMessage('content', {url: <theurl>, type: 'url', <any extra args>})
 */

var url = require('url');

module.exports = function(corsica) {

  corsica.on('command', function(args) {

    var tokens = parser(args.raw);
    var msgType = tokens[0];
    var parsedUrl = url.parse(tokens[0]);

    var msg = {
      raw: args.raw,
      _args: [],
    };
    tokens.slice(1).forEach(function(token) {
      if (token.indexOf('=') > -1) {
        var parts = token.split('=');
        msg[parts[0]] = parts.slice(1).join('=');
      } else {
        msg._args.push(token);
      }
    });

    if (parsedUrl.protocol) {
      // Found a url, special case.
      msg.url = tokens[0];
      msg.type = 'url';
      msgType = 'content';
    }

    return corsica.sendMessage(msgType, msg)
      .then(function (msg) {
        if (msg.response) {
          args._response = msg._response;
        }
        return args;
      });
  });
};


function parser(str) {
  var tokens = [];
  var quotes = false;
  var curToken = '';

  function _push() {
    if (curToken) {
      tokens.push(curToken);
    }
    curToken = '';
  }

  for (var i = 0; i < str.length; i++) {
    if (str[i] === '\\') {
      i++;
      curToken += str[i];
    } else {
      if (quotes) {
        if (str[i] === '"') {
          quotes = false;
          _push();
        } else {
          curToken += str[i];
        }
      } else {
        if (str[i] === '"') {
          quotes = true;
        } else if (str[i] === ' ') {
          _push();
        } else {
          curToken += str[i];
        }
      }
    }
  }

  _push();

  return tokens;
}

module.exports.parser = parser;
