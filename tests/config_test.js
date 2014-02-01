var assert = require('assert');

// poison environment before loading the config
process.env.plugins = 'not a list';
process.env['corsica-test'] = 'truthy';

var config = require('../lib/config.js');


assert.ok(config.plugins, 'does it read the default config?');

assert.ok(
  config['corsica-test'],
  'does it read from the environment?');

assert.strictEqual(
  config.plugins,
  'not a list',
  'does the env override the default?'
);

