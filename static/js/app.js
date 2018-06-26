let config;
try {
  config = localStorage.getItem('config');
  config = JSON.parse(config);
} catch (e) {
  console.warn('Config could not be parsed: ' + e);
}

if (!config) {
  config = {};
  writeConfig();
}

if (!config.tags) {
  config.tags = ['default'];
  writeConfig();
}

// name will come on socket connect

function writeConfig() {
  try {
    localStorage.setItem('config', JSON.stringify(config));
  } catch (e) {
    console.warn('Config could not be written.');
  }
}

function payAttention(msg) {
  console.log('Received message', msg);
  let tags = msg.tags;
  let names = msg.screen;

  // names
  if (!Array.isArray(names)) {
    names = [names];
  }

  for (const name of names) {
    if (name === config.name) {
      return true;
    }
  }

  // tags
  if (!Array.isArray(tags)) {
    tags = [tags];
  }

  for (const tag of tags) {
    if (config.tags.includes(tag)) {
      return true;
    }
  }

  // this message is boring
  return false;
}

function identify() {
  document.querySelector('#name').textContent = config.name;
  toast('I am ' + config.name, 10000);
}

let toastTimeout;
const toastEl = document.querySelector('#toast');
function toast(message, timeout) {
  toastEl.textContent = message;
  toastEl.classList.add('show');
  if (timeout > -1) {
    toastTimeout = setTimeout(untoast, timeout);
  }
}

function untoast() {
  toastEl.classList.remove('show');
  clearTimeout(toastTimeout);
}

function rename(name) {
  config.name = name;
  writeConfig();
  identify();
  init();
}

function addSubscription(tag) {
  if (!config.tags) {
    config.tags = [];
  }
  const { tags } = config;
  if (!tags.include(tag)) {
    tags.push(tag);
  }
  toast('added tag subscription `' + tag + '`');
  sendSubscriptions();
  writeConfig();
}

function removeSubscription(tag) {
  if (!config.tags) {
    config.tags = [];
  }
  var idx = config.tags.indexOf(tag);
  if (idx >= 0) {
    config.tags.splice(idx, 1);
  }
  toast('removed tag subscription `' + tag + '`');
  sendSubscriptions();
  writeConfig();
}

const contentEl = document.querySelector('#content');

function handleURL(url) {
  return makeEl('iframe', null, {
    sandbox: 'allow-same-origin allow-scripts allow-forms',
    src: url
  });
}

function handleHTML(html) {
  const blob = new Blob([html], { "type": "text/html" });
  const url = URL.createObjectURL(blob);
  return makeEl('iframe', null, {
    sandbox: 'allow-same-origin allow-scripts allow-forms',
    src: url
  });
}

function updateDisplay(iframe, msg) {
  const zoom = parseInt(msg.zoom) || 100;
  iframe.style.width = (10000 / zoom) + '%';
  iframe.style.height = (10000 / zoom) + '%';
  iframe.style.transform = `scale(${zoom / 100})`;
  contentEl.innerHTML = '';
  contentEl.appendChild(iframe);
}

async function init() {
  identify();
  await sendSubscriptions();
  sendMessage('init', { name: config.name });
  setupFullscreen();
}

function sendSubscriptions() {
  return sendMessage('tags.setSubscriptions', { name: config.name, tags: config.tags });
}

console.log('Waiting for connection to server...');

socket.on('connect', () => {
  console.log('Connection to server established.');

  // fetch name
  if (config.name === undefined) {
    console.log('getting a name');
    sendMessage('getName').then(function (message) {
      rename(message.name);
    });
    return;
  }
  init();
});


socket.on('admin', msg => {
  const type = msg.type;
  if (!type) {
    return;
  }
  if (!payAttention(msg)) {
    return;
  }

  switch (type) {
    case 'rename': {
      if (msg.name) {
        rename(msg.name);
      }
      break;
    }
    case 'reload': {
      window.location.reload();
      break;
    }
    case 'subscribe': {
      if (msg.tag) {
        addSubscription(msg.tag);
      }
      break;
    }
    case 'unsubscribe': {
      if (msg.tag) {
        removeSubscription(msg.tag);
      }
      break;
    }
  }
});

socket.on('toast', msg => {
  if (!payAttention(msg)) {
    return;
  }
  if (msg.text) {
    toast(msg.text, msg.timeout);
  }
});

socket.on('identify', msg => {
  if (payAttention(msg)) {
    identify();
  }
});

socket.on('content', msg => {
  const type = msg.type;
  if (!type) {
    return;
  }
  if (!payAttention(msg)) {
    return;
  }
  switch (type) {
    case 'url': {
      updateDisplay(handleURL(msg.url), msg);
      untoast();
      break;
    }
    case 'html': {
      updateDisplay(handleHTML(msg.content), msg);
      untoast();
      break;
    }
  }
});

let hudTimeout;
document.body.addEventListener('mousemove', function (e) {
  document.body.classList.add('show-hud');
  clearTimeout(hudTimeout);
  hudTimeout = setTimeout(() => {
    document.body.classList.remove('show-hud');
  }, 3000);
});

socket.on('disconnect', () => console.log('Disconnected from server.'));

window.addEventListener("message", ({ data }) => {
  if (data.corsica) {
    if (data.message) {
      const args = data.args || {};
      args.screen = args.screen || config.name;
      sendMessage(data.message, args);
    }
  }
});

function requestFullscreen(elem) {
  (elem.requestFullscreen ||
    elem.msRequestFullScreen ||
    elem.mozRequestFullScreen ||
    elem.webkitRequestFullScreen ||
    function () { }).call(elem, Element.ALLOW_KEYBOARD_INPUT);
}

function cancelFullScreen() {
  (document.exitFullscreen ||
    document.msExitFullscreen ||
    document.mozCancelFullScreen ||
    document.webkitExitFullscreen ||
    function () { }).call(document);
}

function isFullScreen() {
  return !!(document.fullscreenElement ||
    document.mozFullScreenElement ||
    document.webkitFullscreenElement ||
    document.msFullscreenElement);
}

function toggleFullScreen(elem) {
  if (isFullScreen()) {
    cancelFullScreen();
  } else {
    requestFullscreen(elem);
  }
}

function setupFullscreen() {
  var contentElem = document.querySelector('#app');

  // Be optimistic, this might work.
  requestFullscreen(contentElem);

  document.addEventListener('keydown', ({ keyCode }) => {
    // 70 is "f"
    if (keyCode === 70) {
      toggleFullScreen(contentElem);
    }
  });

  document.querySelector('#fullscreen').addEventListener('click', () => {
    toggleFullScreen(contentElem);
  });
}
