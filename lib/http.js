var Promise = require('es6-promise').Promise;

var corsica;

function init(corsica_) {
  corsica = corsica_;
}

function main(url) {
  return new Promise(function(resolve, reject) {
    var opts = {
      url: url,
      json: true,
    };
    // It is important to access request from the corsica core, in case it got overwritten
    corsica.request(opts, function(err, res, data) {
      if (err || res.statusCode >= 400) {
        reject(err || {statusCode: res.statusCode});
      } else {
        resolve(data);
      }
    });
  });
}

module.exports = main;
module.exports.init = init;
