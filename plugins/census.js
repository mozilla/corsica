/* Description:
 *   Keeps track of collected clients.
 *
 * Dependencies:
 *   None
 *
 * Configuration:
 *   None
 *
 * Author:
 *    mythmon
 */

var Promise = require('es6-promise').Promise;

module.exports = function (corsica) {
  var clients = {};

  corsica.on('client.connected', function(data) {
    console.log('Client connected. id: ', data._sid);
    return data;
  });

  corsica.on('init', function(data) {
    console.log('Client initialize', data._sid, data.name);
    clients[data._sid] = data.name;
    corsica.sendMessage('census.connected', data);
    return data;
  });

  corsica.on('client.disconnected', function(data) {
    console.log('Client disconnected. id: ', data._sid);
    if (data._sid in clients) {
      data.name = clients[data._sid];
      delete clients[data._sid];
      corsica.sendMessage('census.disconnected', data);
    }
    return data;
  });

  function clientNames() {
    var names = [];
    for (var key in clients) {
      names.push(clients[key]);
    }
    return names;
  }

  corsica.on('census.clients', function(message) {
    message.clients = clientNames();
    message.count = message.clients.length;
    return message;
  });

  corsica.on('census.count', function(message) {
    message.count = clientNames().length;
    return message;
  });
};
