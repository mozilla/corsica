var config = {
  PORT: 8080,
  plugins: ['brain', 'settings', 'content', 'reset'],
};

for (var key in process.env) {
  config[key] = process.env[key];
}

module.exports = config;
