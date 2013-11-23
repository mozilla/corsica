var config = {
  PORT: 8080,
  plugins: ['brain', 'settings', 'content', 'reset'],
  STATE_DIR_PATH: 'state',
};

for (var key in process.env) {
  config[key] = process.env[key];
}

module.exports = config;
