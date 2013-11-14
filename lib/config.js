var config = {
  port: 8080
};

for (key in process.env) {
  config.key = process.env.key
}

module.exports = config;
