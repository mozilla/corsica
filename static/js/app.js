console.log('Welcome to Corsica.');
console.log('To the NORTH there is water.');
console.log('To the WEST there is water.');
console.log('To the EAST there is water.');
console.log('To the SOUTH there is water.');

var config;
try {
  config = localStorage.getItem('config');
  if (config) {
    config = JSON.parse(config);
    if (config) {
      console.log('Welcome back, old friend.');
    } else {
      config = undefined;
    }
  }
} catch (e) {
  console.warn('Config could not be parsed: ' + e);
}
if (!config) {
  console.log('You\'re new here, aren\'t you.');
  config = {};
}

function writeConfig() {
  try {
    localStorage.setItem('config', JSON.stringify(config));
  } catch (e) {
    console.warn('Config could not be written.');
  }
}

function payAttention(name) {
  if (name instanceof Array) {
    for (var i=0; i<name.length; i++) {
      if (name[i] === config.name) {
        return true;
      }
    }
    return false;
  }
  return config.name === name;
}

var contentEl = document.querySelector('#content');

function handleURL(url) {
  contentEl.innerHTML = '';
  var iframe = makeEl('iframe', null, {
    sandbox: 'allow-same-origin allow-scripts allow-forms',
    src: url
  });
  contentEl.appendChild(iframe);
}

function handleHTML(html) {
  contentEl.innerHTML = '';
  var blob = new Blob([html], { "type" : "text/html" });
  var url = URL.createObjectURL(blob);
  var iframe = makeEl('iframe', null, {
    sandbox: 'allow-same-origin allow-scripts allow-forms',
    src: url
  });
  contentEl.appendChild(iframe);
}

function init() {
  console.log('My name is ' + config.name);
  sendMesssage('init', {name: config.name});
}

console.log('Waiting for connection to server...');

/* Socket.IO connections */
var socket = io.connect('/');

socket.on('connect', function() {
  console.log('Connection to server established.');

  if (config.name === undefined) {
    console.log('getting a name');
    sendMesssage('getName').then(function(name) {
      config.name = name;
      writeConfig();
      init();
    });
  } else {
    init();
  }
});

socket.on('content', function(msg) {
  var type = msg.type;
  if (!type) {
    console.warn('You thought you heard something. No, just the waves.');
    return;
  }
  if (!payAttention(msg.screen)) {
    console.log('You receive a message, but it\'s not for you...');
    return;
  }
  switch (msg.type) {
    case 'url':
      handleURL(msg.url);
      break;
    case 'html':
      handleHTML(msg.content);
      break;
    default:
      console.log('A voice speaks, in an unintelligible language.');
      break;
  }
});

socket.on('disconnect', function() {
  console.log('Disconnected from server.');
});


var sendMesssage = (function() {
  var messageReciepts = {};
  var nextId = 0;

  function sendMesssage(name, message) {
    return new Promise(function(resolve, reject) {
      var clientId = nextId++;
      messageReciepts[clientId] = {resolve: resolve, reject: reject};
      socket.emit('msg', {
        clientId: clientId,
        name: name,
        message: message,
      });
    });
  }

  socket.on('resolve', function(data) {
    var clientId = data.clientId;
    var message = data.message;
    messageReciepts[clientId].resolve(message);
  });

  socket.on('reject', function(data) {
    var clientId = data.clientId;
    var message = data.message;
    messageReciepts[clientId].reject(message);
  });

  return sendMesssage;
})();

var messagePromises = {};

function sendMesssage(name, message) {
  socket.emit('message', {name: name, message: message});
}
