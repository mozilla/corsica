const fs = require('fs');
const path = require('path');

const utils = require('./utils');

let config = {
  PORT: 8080,
  plugins: [
    'brain',
    'census',
    'settings',
    'command',
    'content',
    'timer',
    'namer',
    'glob',
    'tags'
  ],
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
  const configJsonPath = path.resolve('config.json');
  if (fs.existsSync(configJsonPath)) {
    console.log('Reading config from ' + configJsonPath);
    const configJson = fs.readFileSync(configJsonPath, { encoding: 'utf8' });
    const configObj = JSON.parse(configJson);
    for (const key in configObj) {
      config[key] = configObj[key];
    }
  }
} catch (e) {
  console.warn('Error reading config.json');
}

for (const key in process.env) {
  config[key] = parse(process.env[key]);
}

// Load settings from a .env file in the working directory. This will override
// the defaults, but not the environment.
try {
  const dotEnvPath = path.resolve(path.join('.env'));
  if (fs.existsSync(dotEnvPath)) {
    console.log('Reading config from ' + dotEnvPath);
    const env = fs.readFileSync(dotEnvPath, { encoding: 'utf8' });
    for (const line of env.split('\n')) {
      const parts = line.split('=');
      const key = parts[0];
      const value = parse(parts.slice(1).join('='));
      if (!(key in process.env)) {
        config[key] = value;
      }
    }
  }
} catch (e) {
  console.warn('Error reading .env');
}

// If a variable starts with '$', look up *that* envvar, and use it instead.
for (const key in config) {
  const val = config[key];
  if (val === null || val === undefined || val.charAt === undefined) {
    continue;
  }
  if (val.charAt(0) === '$') {
    config[key] = config[val.slice(1)] || val;
  } else if (val.charAt(0) === '\\') {
    config[key] = val.slice(1);
  }
}

module.exports = config;
