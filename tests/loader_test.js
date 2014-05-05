var assert = require('assert');

var loader = require('../lib/loader');


(function testPrepPlugin() {
  var func = function(){};
  var stuff = ['stuff'];

  // Test defaults.
  var plugin = loader.prepPlugin(func);
  assert.equal(plugin.init, func);
  assert.deepEqual(plugin.before, []);
  assert.deepEqual(plugin.after, []);
  assert.deepEqual(plugin.require, []);
  assert.deepEqual(plugin.phase, 1);

  // Test before isn't overwritten.
  plugin = loader.prepPlugin({before: stuff});
  assert.equal(plugin.before, stuff);

  // Test after isn't overwritten.
  plugin = loader.prepPlugin({after: stuff});
  assert.equal(plugin.after, stuff);

  // Test require isn't overwritten.
  plugin = loader.prepPlugin({require: stuff});
  assert.equal(plugin.require, stuff);

  // Test phase isn't overwritten.
  plugin = loader.prepPlugin({phase: 0});
  assert.equal(plugin.phase, 0);

  // Test name is set correctly.
  plugin = loader.prepPlugin({}, "a plugin");
  assert.equal(plugin.name, "a plugin");
})();


(function testPluginCompare() {
  var a = {name: 'a', require: [], after: [], before: [], phase: 1};
  var b = {name: 'b', require: [], after: [], before: [], phase: 1};

  assert.equal(0, loader.pluginCompare(a, b));

  a.after = ['b'];
  assert.equal(1, loader.pluginCompare(a, b));
  assert.equal(-1, loader.pluginCompare(b, a));

  a.after = ['c'];
  assert.equal(0, loader.pluginCompare(a, b));
  assert.equal(0, loader.pluginCompare(b, a));

  a.after = [];
  a.before = ['b'];
  assert.equal(-1, loader.pluginCompare(a, b));
  assert.equal(1, loader.pluginCompare(b, a));

  a.before = ['c'];
  assert.equal(0, loader.pluginCompare(a, b));
  assert.equal(0, loader.pluginCompare(b, a));

  a.before = [];
  a.phase = 0;
  b.phase = 1;
  assert.equal(-1, loader.pluginCompare(a, b));
  assert.equal(1, loader.pluginCompare(b, a));
})();

(function testTopoSort() {
  var a = {name: 'a', require: [], after: [], before: ['b'], phase: 1};
  var b = {name: 'b', require: [], after: [], before: [], phase: 1};
  var c = {name: 'c', require: [], after: ['b'], before: [], phase: 1};
  var plugins = [c, b, a];
  var expected = [a, b, c];
  var actual = loader.topologicalSort(plugins);
  assert.deepEqual(expected, actual);
})();

(function testEnsureRequirements() {
  var a = {name: 'a', require: [], after: [], before: []};
  var b = {name: 'b', require: [], after: [], before: []};
  var plugins = [a, b];

  assert.equal(0, loader.ensureRequirements(plugins).length);

  a.require = ['b'];
  assert.equal(0, loader.ensureRequirements(plugins).length);

  b.require = ['a'];
  assert.equal(0, loader.ensureRequirements(plugins).length);

  a.require = [];
  assert.equal(0, loader.ensureRequirements(plugins).length);

  b.require = ['c'];
  assert.equal(1, loader.ensureRequirements(plugins).length);

  a.require = ['c'];
  assert.equal(2, loader.ensureRequirements(plugins).length);

  b.require = [];
  assert.equal(1, loader.ensureRequirements(plugins).length);
})();
