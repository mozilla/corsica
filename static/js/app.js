console.log('Welcome to Corsica.');
console.log('To the NORTH there is water.');
console.log('To the WEST there is water.');
console.log('To the EAST there is water.');
console.log('To the SOUTH there is water.');

var config;
try {
  config = localStorage.getItem('config');
  if (config) {
    config = JSON.parse('config');
    if (!config.corsica) {
      console.log('Welcome back, old friend.');
    } else {
      config = undefined;
    }
  }
} catch (e) {
  console.warn('Config could not be parsed.');
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

console.log('Waiting for connection to server...');

/* Socket.IO connections */
var socket = io.connect('/');

socket.on('connect', function() {
  console.log('Connection to server established.');
});

socket.on('content', function(msg) {
  console.log('got message', msg);
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
