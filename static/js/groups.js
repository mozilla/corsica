console.log('Waiting for connection to server...');

socket.on('connect', function () {
  init();
});

socket.on('disconnect', function () {
  console.log('Disconnected from server.');
});

socket.on('settings.set', function(message) {
  if (message.plugin === 'group-reset') {
    groupsEl.innerHTML = '';
    message.settings.groups.forEach(function(group) {
      createGroupSection(group);
    });
  }
});

var groupsEl = document.querySelector('.groups');

function init() {
  console.log('Connection to server established.');
  sendMessage('settings.get', {plugin: 'group-reset'}).then(function(message) {
    groupsEl.innerHTML = '';
    message.settings.groups.forEach(function(group) {
      createGroupSection(group);
    });
  });
}

document.body.addEventListener('click', function (e) {
  if (e.target.tagName.toLowerCase() === 'button') {
    if (e.target.id === 'save') {
      var groupEls = document.querySelectorAll('.groups .plugin');
      var groups = Array.prototype.map.call(groupEls, function(groupEl) {
        var group = {search: null, commands: []};
        group.search = groupEl.querySelector('[name=search]').value;
        var commandEls = groupEl.querySelectorAll('[name=command]:not(.empty)');
        group.commands = Array.prototype.map.call(commandEls, function(commandEl) {
          return commandEl.value;
        });
        return group;
      });

      console.log('updating settings');
      var formEls = document.querySelectorAll('form');
      Array.prototype.forEach.call(formEls, function(form) {
        form.classList.add('pending');
      });
      sendMessage('settings.get', {plugin: 'group-reset'})
      .then(function(settings) {
        console.log('got settings', settings);
        settings.groups = groups;
        return sendMessage('settings.set', {
          plugin: 'group-reset',
          settings: settings,
        });
      })
      .then(function() {
        console.log('settings saved');
        Array.prototype.forEach.call(formEls, function(form) {
          form.classList.remove('pending');
        });
      }, console.error.bind(console));


    } else if (e.target.id === 'add-group') {
      createGroupSection({search: '', commands: []});
    }
  }
  return;
  form.classList.add('pending');
  sendMessage('settings.set', {
      'plugin': name,
      'settings': obj
    }).then(function () {
      form.classList.remove('pending');
  });
});

function createGroupSection(group) {
  var section = makeEl('section.plugin');
  var form = makeEl('form', null);

  var searchRow = makeEl('header.row', null);
  searchRow.appendChild(makeEl('label', 'Search'));
  searchRow.appendChild(makeEl('input', null, {name: 'search', value: group.search}));
  form.appendChild(searchRow);

  var commandsRow = makeEl('div.row', null);
  commandsRow.appendChild(makeEl('label', 'Commands'));
  var commandInputs = makeEl('div.many', null);
  group.commands.forEach(function(command) {
    commandInputs.appendChild(makeEl('input', null, {
      type: 'text',
      value: command,
      name: 'command',
    }));
  });
  commandInputs.appendChild(makeEl('input.empty', null, {name: 'command'}));
  commandsRow.appendChild(commandInputs);
  form.appendChild(commandsRow);

  form.addEventListener('keydown', function (e) {
    var tgt = e.target;
    if (tgt.tagName.toLowerCase() === 'input') {
      if (tgt.classList.contains('empty')) {
        setTimeout(function () {
          if (tgt.value.length > 0) {
            var many = tgt.parentNode;
            tgt.classList.remove('empty');
            many.appendChild(makeEl('input.empty', null, {name: 'command'}));
          }
        }, 0);
      }
    }
  });

  form.addEventListener('blur', function (e) {
    var tgt = e.target;
    if (tgt.tagName.toLowerCase() === 'input') {
      if (!tgt.classList.contains('empty') &&
          tgt.parentNode.classList.contains('many')) {
        if (tgt.value.length === 0) {
          var many = tgt.parentNode;
          many.removeChild(tgt);
        }
      }
    }
  }, true);

  section.appendChild(form);
  groupsEl.appendChild(section);
}
