var fs = require('fs');
var path = require('path');

var utils = require('./utils');

var config = {
  PORT: 8080,
  plugins: ['brain', 'settings', 'content', 'timer', 'reset', 'namer'],
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


module.exports = config;
