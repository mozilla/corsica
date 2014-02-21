var assert = require('assert');

var commandPlugin = require('../../plugins/command');


assert.deepEqual(commandPlugin.parser('foo'), ['foo']);
assert.deepEqual(commandPlugin.parser('foo bar'), ['foo', 'bar']);
assert.deepEqual(commandPlugin.parser('"foo bar"'), ['foo bar']);
assert.deepEqual(commandPlugin.parser('"foo bar" "baz=qux wat"'), ['foo bar', 'baz=qux wat']);
assert.deepEqual(commandPlugin.parser('foo\\"bar'), ['foo"bar']);
assert.deepEqual(commandPlugin.parser('x "y \\"z\\" w"'), ['x', 'y "z" w']);
