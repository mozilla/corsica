
console.log(
  'Welcome to Corsica.\n'+
  'To the NORTH there is water.\n'+
  'To the WEST there is water.\n'+
  'To the EAST there is water.\n'+
  'To the SOUTH there is water.'
);

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

function identify() {
  toast('I am ' + config.name, 10000);
}

var toastTimeout;
var toastEl = document.querySelector('#toast');
function toast(message, timeout) {
  toastEl.textContent = message;
  toastEl.classList.add('show');
  toastTimeout = setTimeout(untoast, timeout || 5000);
}
function untoast() {
  toastEl.classList.remove('show');
}

var contentEl = document.querySelector('#content');

function handleURL(url) {
  var iframe = makeEl('iframe', null, {
    sandbox: 'allow-same-origin allow-scripts allow-forms',
    src: url
  });
  contentEl.innerHTML = '';
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
  sendMessage('init', {name: config.name});
  setupFullscreen();
}

console.log('Waiting for connection to server...');

socket.on('connect', function() {
  console.log('Connection to server established.');

  if (config.name === undefined) {
    console.log('getting a name');
    sendMessage('getName').then(function(message) {
      config.name = message.name;
      console.log(message);
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
    case 'identify':
      identify();
      break;
    case 'toast':
      toast(msg.text);
      break;
    default:
      console.log('A voice speaks, in an unintelligible language.');
      break;
  }
});

socket.on('disconnect', function() {
  console.log('Disconnected from server.');
});

function setupFullscreen() {
  function requestFullscreen(elem) {
    (elem.requestFullscreen ||
     elem.mozRequestFullScreen ||
     elem.webkitRequestFullScreen).call(elem, Element.ALLOW_KEYBOARD_INPUT);
  }

  var contentElem = document.querySelector('#content');

  // Be optimistic, this might work.
  requestFullscreen(contentElem);

  document.addEventListener('keydown', function (e) {
    // 70 is "f"
    if (e.keyCode === 70) {
      requestFullscreen(contentElem);
    }
  });
}
