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

module.exports = corsica => {
  const clients = {};

  corsica.on('client.connected', data => {
    console.log('Client connected. id: ', data._sid);
    return data;
  });

  corsica.on('init', data => {
    console.log('Client initialize', data._sid, data.name);
    clients[data._sid] = data.name;
    corsica.sendMessage('census.connected', data);
    return data;
  });

  corsica.on('client.disconnected', data => {
    console.log('Client disconnected. id: ', data._sid);
    if (data._sid in clients) {
      data.name = clients[data._sid];
      delete clients[data._sid];
      corsica.sendMessage('census.disconnected', data);
    }
    return data;
  });

  function clientNames() {
    return Object.values(clients);
  }

  corsica.on('census.clients', message => {
    message.clients = clientNames();
    message.count = message.clients.length;
    return message;
  });

  corsica.on('census.count', message => {
    message.count = clientNames().length;
    return message;
  });
};
