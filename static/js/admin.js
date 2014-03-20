console.log('Waiting for connection to server...');

socket.on('connect', function () {
  init();
});

socket.on('disconnect', function () {
  console.log('Disconnected from server.');
});

socket.on('settings.set', function(opts) {
  updateUI(opts.plugin, opts.settings);
});

socket.on('census.connected', updateCurrentClients);
socket.on('census.disconnected', updateCurrentClients);

var settingsEl = document.querySelector('.settings');

function init() {
  console.log('Connection to server established.');
  sendMessage('settings.getSpecs').then(function (message) {
    var specs = message.specs;
    var plugin;
    for (plugin in specs) {
      createSection(plugin, specs[plugin]);
    }
    var sections = document.querySelectorAll('section.plugin');
    for (var i = 0; i < sections.length; i++) {
      plugin = sections[i].getAttribute('data-plugin');
      if (!(plugin in specs)) {
        sections[i].parentNode.removeChild(sections[i]);
      }
    }
  });
  updateCurrentClients();
}

function createSection(name, spec) {
  var id = 'settings-' + name;
  var section = document.getElementById(id);
  if (!section) {
    section = makeEl('section.plugin', null, {
      'id': id,
      'data-plugin': name
    });

    var header = makeEl('header', name);
    section.appendChild(header);

    var form = makeEl('form', null, { id: 'form-' + name });
    section.appendChild(form);

    var row;

    for (var field in spec) {
      row = makeEl('div.row');
      var input;
      row.appendChild(makeEl('label', field));
      var val = spec[field];
      if (val instanceof Array) {
        var many = makeEl('div.many', null, {
          'data-many': field
        });
        row.appendChild(many);
        var rows = val;
        for (var i = 0; i < rows.length; i++) {
          input = makeEl('input', null, {
            'value': rows[i]
          });
          many.appendChild(input);
        }
        many.appendChild(makeEl('input.empty'));
      } else {
        if (val === true || val === false) {
          input = makeEl('input.check', null, {
            'type': 'checkbox',
            'name': field
          });
          if (val) input.setAttribute('checked', 'checked');
        } else {
          input = makeEl('input', null, {
            'name': field,
            'value': val
          });
        }
        row.appendChild(input);
      }
      form.appendChild(row);
    }

    row = makeEl('div.row');
    row.appendChild(makeEl('button.save', 'save'));
    form.appendChild(row);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var obj = {};
      for (var field in spec) {
        if (spec[field] instanceof Array) {
          var inputs = form.querySelectorAll('[data-many=' + field + '] input:not(.empty)');
          obj[field] = [];
          for (var i = 0; i < inputs.length; i++) {
            obj[field].push(inputs[i].value);
          }
        } else {
          var input = form.querySelector('input[name=' + field + ']');
          if (input.classList.contains('check')) {
            obj[field] = !!input.checked;
          } else {
            obj[field] = input.value;
          }
        }
      }
      section.classList.add('pending');
      sendMessage('settings.set', {
          'plugin': name,
          'settings': obj
        }).then(function () {
          section.classList.remove('pending');
      });
    });

    form.addEventListener('keydown', function (e) {
      var tgt = e.target;
      if (tgt.tagName.toLowerCase() === 'input') {
        if (tgt.classList.contains('empty')) {
          setTimeout(function () {
            if (tgt.value.length > 0) {
              var many = tgt.parentNode;
              tgt.classList.remove('empty');
              many.appendChild(makeEl('input.empty'));
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

    settingsEl.appendChild(section);
  }

  console.log('sending message.get with plugin =', name);
  sendMessage('settings.get', {plugin: name}).then(function (message) {
    updateUI(name, message.settings);
  });
}

function updateUI(plugin, values) {
  console.log('updateUI', plugin, values);
  var form = document.querySelector('section#settings-' + plugin + ' form'),
      input;

  for (var field in values) {
    var val = values[field];
    if (val instanceof Array) {
      var many = form.querySelector('[data-many=' + field + ']');
      var inputs = many.querySelectorAll('input:not(.empty)');
      for (var i = 0; i < Math.max(val.length, inputs.length); i++) {
        input = inputs[i];
        var v = val[i];
        if (v !== undefined && input) {
          input.value = v;
        } else if (v !== undefined && !input) {
          input = makeEl('input', null, {
            'value': val[i]
          });
          many.insertBefore(input, many.querySelector('.empty'));
        } else if (v === undefined && input) {
          input.parentNode.removeChild(input);
        }
      }
    } else {
      input = form.querySelector('[name=' + field + ']');
      if (input) {
        if (val === true || val === false) {
          input.checked = val;
        } else {
          input.value = val;
        }
      }
    }
  }
}

function updateCurrentClients() {
  var el = document.querySelector('.topbar .stats .current-clients');
  console.log('updateCurrentClients');

  if (el === null) {
    console.log('making element');
    el = makeEl('li.current-clients');
    document.querySelector('.topbar .stats').appendChild(el);
  }

  sendMessage('census.count')
  .then(function(message) {
    var text;
    if (message.count === 0) {
      text = 'No clients';
    } else if (message.count === 1) {
      text = '1 client';
    } else {
      text = message.count + ' clients';
    }
    el.textContent = text;
  });
}
