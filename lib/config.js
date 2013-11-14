var config = {
  PORT: 8080
};

for (var key in process.env) {
  config[key] = process.env[key];
}

module.exports = config;
