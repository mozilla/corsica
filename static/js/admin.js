console.log('Waiting for connection to server...');

socket.on('connect', function () {
  init();
});

socket.on('disconnect', function () {
  console.log('Disconnected from server.');
});

socket.on('settings.set', function(opts) {
  // updateUI(opts.plugin, opts.settings);
});

socket.on('census.connected', updateCurrentClients);
socket.on('census.disconnected', updateCurrentClients);

socket.onAnyMessage(addLogMessage);

var settingsEl = document.querySelector('.settings');

function init() {
  console.log('Connection to server established.');

  sendMessage('admin.getPanels')
  .then(function (msg) {
    msg.panels.forEach(createPanel);
    return sendMessage('admin.getScripts');
  })
  .then(function(msg) {
    msg.scripts.forEach(function(script) {
      var scriptEl = makeEl('script', script, {type: 'text/javascript'});
      document.body.appendChild(scriptEl);
    });
  });

  initCommandAndControl();
  updateCurrentClients();
}

function createPanel(panel) {
  var id = 'panel-' + panel.id;
  console.log('Creating panel', panel.id);
  var panelEl = document.getElementById(id);
  if (!panelEl) {
    panelEl = makeEl('div.panel', null, {id: id});
    if (panel.class) {
      panelEl.classList.add(panel.class);
    }
    panelEl.appendChild(makeEl('header', panel.title));
    var bodyEl = makeEl('div');
    bodyEl.innerHTML = panel.body;
    panelEl.appendChild(bodyEl);
    document.querySelector('.panels').appendChild(panelEl);
  }
}

function initCommandAndControl() {
  var controlsEl = document.querySelector('.controls');

  var cncEl = controlsEl.querySelector('.cnc');
  if (cncEl === null) {
    cncEl = makeEl('section.plugin.cnc');
    cncEl.appendChild(makeEl('header', 'send message'));
    var form = makeEl('form');
    var row = makeEl('div.row');
    row.appendChild(makeEl('select.clients'));
    row.appendChild(makeEl('input.command', null, {type: 'text'}));
    row.appendChild(makeEl('button.send', 'send'));
    form.appendChild(row);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      cncEl.classList.add('pending');
      var command = form.querySelector('input.command').value;
      var screen = form.querySelector('select.clients').value;
      if (command.indexOf('screen=') === -1) {
        command += ' screen=' + screen;
      }
      sendMessage('command', {'raw': command})
        .then(function () {
          cncEl.classList.remove('pending');
        });
    });

    cncEl.appendChild(form);
    controlsEl.appendChild(cncEl);
  }

  var logsEl = controlsEl.querySelector('.logs');
  if (logsEl === null) {
    logsEl = makeEl('section.plugin.logs');
    logsEl.appendChild(makeEl('header', 'message logs'));
    logsEl.appendChild(makeEl('ul'));

    logsEl.addEventListener('click', function(e) {
      if (e.originalTarget.classList.contains('expander')) {
        e.originalTarget.parentNode.parentNode.classList.toggle('expanded');
      }
    });

    controlsEl.appendChild(logsEl);
  }
}

function updateCurrentClients() {
  var clientCounter = document.querySelector('.topbar .stats .current-clients');
  var clientSelector = document.querySelector('.controls .cnc select.clients');

  if (clientCounter === null) {
    clientCounter = makeEl('li.current-clients');
    document.querySelector('.topbar .stats').appendChild(clientCounter);
  }

  sendMessage('census.clients')
  .then(function(message) {
    var count = message.count;
    var clients = message.clients;
    clientCounter.textContent = (count || 'No') + (count === 1 ? ' client' : ' clients');
    clients.sort();
    var selectedClient = clientSelector.value;
    var options = clientSelector.querySelectorAll('option');
    for (var i = 0; i < options.length; i++) {
      clientSelector.remove(options[i]);
    }

    clients.forEach(function(client) {
      var newOpt = makeEl('option', client, {
        value: client,
        selected: client === selectedClient,
      });
      clientSelector.appendChild(newOpt);
    });
  });
}

function addLogMessage(name, message) {
  if (name === 'resolve') {
    return;
  }
  var logsEl = document.querySelector('.controls .logs ul');
  if (logsEl) {
    var li = makeEl('li');
    var top = makeEl('div.top');
    var now = new Date();

    top.appendChild(makeEl('time', now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds() + ' '));
    top.appendChild(makeEl('span.name', name + ' '));
    if (message) {
      top.appendChild(makeEl('span.expander', '{...}'));
      li.appendChild(makeEl('pre', JSON.stringify(message, null, '  ')));
    }
    li.insertBefore(top, li.firstChild);
    logsEl.insertBefore(li, logsEl.firstChild);
    while (logsEl.childNodes.length > 100) {
      logsEl.removeChild(logsEl.lastChild);
    }
  }
}
