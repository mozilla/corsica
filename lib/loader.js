var config = require('./config');

module.exports = {
  getPlugins: getPlugins,
  loadByName: loadByName,
  prepPlugin: prepPlugin,
  pluginCompare: pluginCompare,
  ensureRequirements: ensureRequirements,
  topologicalSort: topologicalSort,
};

/* a.require = [b]: If a is loaded, b must also be loaded, in any order.
 * a.before = [b]: If a is loaded, and b is loaded, a must be loaded before b.
 * a.after = [b]: If a is loaded, and b is loaded, a must be loaded after b.
 *
 * If there are cycles or other reasons why the plugins can't satisfy this error,
 * an exception will be thrown.
 */


function getPlugins() {
  var plugins = config.plugins.map(loadByName).map(prepPlugin);
  plugins = topologicalSort(plugins);
  var loadErrors = ensureRequirements(plugins);

  if (loadErrors.length > 0) {
    loadErrors.forEach(console.log.bind(console, 'Error:'));
    process.exit(1);
  }

  return plugins;
}

function loadByName(name) {
  var plugin = null;
  // Local plugin.
  try {
    plugin = require('../plugins/' + name);
    console.log('Loaded local plugin {0}".'.format(name));
  } catch(e) {}

  // NPM plugin
  if (plugin === null) {
    try {
      plugin = require(name);
      console.log('Loaded NPM plugin {0}".'.format(name));
    } catch(e) {}
  }

  if (plugin === null) {
    throw 'Could not load plugin "{0}" from any sources.'.format(name);
  }

  return prepPlugin(plugin, name);
}

function prepPlugin(plugin, name) {
  if (typeof plugin === 'function') {
    plugin = {init: plugin};
  }

  plugin.name = plugin.name || name;
  plugin.before = plugin.before || [];
  plugin.after = plugin.after || [];
  plugin.require = plugin.require || [];
  if (plugin.phase === undefined) {
    plugin.phase = 1;
  }

  return plugin;
}

function pluginCompare(a, b) {
  // Phase trumps anything else.
  if (a.phase !== b.phase) {
    return a.phase - b.phase;
  }

  if (a.before.indexOf(b.name) > -1) {
    return -1;
  }
  if (a.after.indexOf(b.name) > -1) {
    return 1;
  }

  if (b.after.indexOf(a.name) > -1) {
    return -1;
  }
  if (b.before.indexOf(a.name) > -1) {
    return 1;
  }

  return 0;
}

function ensureRequirements(plugins) {
  var names = plugins.map(function(p) { return p.name; });
  var errors = [];

  plugins.forEach(function(plugin) {
    plugin.require.forEach(function(requiredName) {
      if (names.indexOf(requiredName) === -1) {
        errors.push("Plugin {0} requires {1}, but it is not loaded."
                    .format(plugin.name, requiredName));
      }
    });
  });

  return errors;
}

/* Fill the before list of every plugin. */
function fillGraph(plugins) {
  for (var i = 0; i < plugins.length - 1; i++) {
    var nodeA = plugins[i];
    for (var j = i + 1; j < plugins.length; j++) {
      var nodeB = plugins[j];
      var cmp = pluginCompare(nodeA, nodeB);
      if (cmp < 0) {
        nodeA.before.push(nodeB.name);
        nodeB.after.push(nodeA.name);
      }
      if (cmp > 0) {
        nodeA.after.push(nodeB.name);
        nodeB.before.push(nodeA.name);
      }
    }
  }
}

function topologicalSort(plugins) {
  var sorted = [];
  var unmarked = plugins.slice();

  fillGraph(plugins);

  var pluginMap = {};
  plugins.forEach(function(plugin) {
    pluginMap[plugin.name] = plugin;
  });

  function visit(node) {
    if (node._loopDetector) {
      throw "Error while loading dependencies: cyclic dependency detected.";
    }
    var index = unmarked.indexOf(node);
    if (index !== -1) {
      node._loopDetector = true;
      node.before.forEach(function(name) {
        visit(pluginMap[name]);
      });
      // Remove node from unmarked;
      unmarked.splice(index, 1);
      delete node._loopDetector;
      sorted = [node].concat(sorted);
    }
  }

  while (unmarked.length) {
    visit(unmarked[0]);
  }

  return sorted;
}
