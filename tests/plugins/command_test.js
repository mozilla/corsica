var assert = require('assert');

var commandPlugin = require('../../plugins/command');

function result(o) {
  return Object.assign({ message: { _args: [] } }, o);
}

assert.deepEqual(
  commandPlugin.parser('foo'),
  result({
    type: 'foo'
  })
);

assert.deepEqual(
  commandPlugin.parser('foo bar'),
  result({
    type: 'foo',
    message: {
      _args: ['bar']
    }
  })
);

assert.deepEqual(
  commandPlugin.parser('"foo bar"'),
  result({
    type: 'foo bar'
  })
);

assert.deepEqual(
  commandPlugin.parser('foo bar baz=qux wat'),
  result({
    type: 'foo',
    message: {
      _args: ['bar', 'wat'],
      baz: 'qux'
    }
  })
);

assert.deepEqual(
  commandPlugin.parser('foo\\"bar'),
  result({
    type: 'foo"bar'
  })
);

assert.deepEqual(
  commandPlugin.parser('x "y \\"z\\" w"'),
  result({
    type: 'x',
    message: {
      _args: ['y "z" w']
    }
  })
);
