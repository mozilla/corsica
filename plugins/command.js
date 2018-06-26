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

const url = require('url');

module.exports = function (corsica) {

  corsica.parseCommand = parser;

  corsica.on('command', msg => {
    console.log('command', msg);
    const { type, message } = parser(msg.raw, msg);
    corsica.sendMessage(type, message);
    return msg;
  });
};

/* Parse space separated tokens, allowing for both quotes and escaping quotes. */
function parser(str, msg = {}) {
  const tokens = [];
  let quotes = false;
  let curToken = '';

  function _push() {
    if (curToken) {
      tokens.push(curToken);
    }
    curToken = '';
  }

  for (let i = 0; i < str.length; i++) {
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

  const parsedUrl = url.parse(tokens[0]);
  let msgType = tokens[0];

  msg._args = [];
  for (const token of tokens.slice(1)) {
    if (token.includes('=')) {
      const parts = token.split('=');
      msg[parts[0]] = parts.slice(1).join('=');
    } else {
      msg._args.push(token);
    }
  }

  if (parsedUrl.protocol) {
    // Found a url, special case.
    msg.url = tokens[0];
    msg.type = 'url';
    msgType = 'content';
  }

  return { type: msgType, message: msg };
}

module.exports.parser = parser;
