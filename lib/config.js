var fs = require('fs');
var path = require('path');

var utils = require('./utils');

var config = {
  PORT: 8080,
  plugins: ['brain', 'census', 'settings', 'command', 'content', 'timer', 'reset', 'namer', 'glob'],
  STATE_DIR_PATH: 'state',
};


function parse(val) {
  try {
    return JSON.parse(val);
  } catch (e) {
    return val;
  }
}


for (var key in process.env) {
  config[key] = parse(process.env[key]);
}


// Load settings from a .env file. This will override the defaults, but
// not the environment.
try {
  var dotEnvPath = path.resolve(path.join(__dirname, '..', '.env'));
  var env = fs.readFileSync(dotEnvPath, {encoding: 'utf8'});
  env.split('\n').forEach(function(line) {
    var parts = line.split('=');
    var key = parts[0];
    var value = parse(parts.slice(1).join('='));
    if (!(key in process.env)) {
      config[key] = value;
    }
  });
} catch(e) {
}

// If a variable starts with '$', look up *that* envvar, and use it instead.
for (var key in config) {
  val = config[key];
  if (val === null || val === undefined || val.charAt === undefined) {
    continue;
  }
  if (val.charAt(0) === '$') {
    var val = config[val.slice(1)] || val;
    config[key] = val;
  } else if (val.charAt(0) === '\\') {
    val = val.slice(1);
  }
}


module.exports = config;
