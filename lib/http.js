let corsica;

function init(corsica_) {
  corsica = corsica_;
}

function main(url) {
  const opts = { url, json: true };
  // It is important to access request from the corsica core, in case it got overwritten

  return new Promise((resolve, reject) => {
    corsica.request(opts, (err, res, data) => {
      if (err || res.statusCode >= 400) {
        reject(err || { statusCode: res.statusCode });
      } else {
        resolve(data);
      }
    })
  })
}

module.exports = main;
module.exports.init = init;
