var fs = require('fs');
var path = require('path');

var utils = require('./utils');

var config = {
  PORT: 8080,
  plugins: ['brain', 'census', 'settings', 'command', 'content', 'timer', 'namer', 'glob', 'tags'],
  STATE_PATH: './state.json',
  force_https: false,
  hsts_time: 60 * 24 * 60 * 60,  // 60 days in seconds
};


function parse(val) {
  try {
    return JSON.parse(val);
  } catch (e) {
    return val;
  }
}

// if the working directory contains a config.json, inherit from it.
try {
  var configJsonPath = path.resolve('config.json');
  if (fs.existsSync(configJsonPath)) {
    console.log('Reading config from ' + configJsonPath);
    var configJson = fs.readFileSync(configJsonPath, {encoding: 'utf8'});
    var configObj = JSON.parse(configJson);
    for (var key in configObj) {
      config[key] = configObj[key];
    }
  }
} catch(e) {
  console.warn('Error reading config.json');
}

for (var key in process.env) {
  config[key] = parse(process.env[key]);
}

// Load settings from a .env file in the working directory. This will override
// the defaults, but not the environment.
try {
  var dotEnvPath = path.resolve(path.join('.env'));
  if (fs.existsSync(dotEnvPath)) {
    console.log('Reading config from ' + dotEnvPath);
    var env = fs.readFileSync(dotEnvPath, {encoding: 'utf8'});
    env.split('\n').forEach(function(line) {
      var parts = line.split('=');
      var key = parts[0];
      var value = parse(parts.slice(1).join('='));
      if (!(key in process.env)) {
        config[key] = value;
      }
    });
  }
} catch(e) {
  console.warn('Error reading .env');
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
