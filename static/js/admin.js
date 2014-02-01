
console.log('Waiting for connection to server...');

socket.on('connect', function () {
  init();
});

socket.on('disconnect', function () {
  console.log('Disconnected from server.');
});

var settingsEl = document.querySelector('.settings');

function init() {
  console.log('Connection to server established.');
  sendMessage('settings.getSpecs').then(function (specs) {
    for (var plugin in specs) {
      createSection(plugin, specs[plugin]);
    }
  });
}

function createSection(name, spec) {
  var id = 'settings-' + name;
  var section = document.getElementById(id);
  if (!section) {
    section = makeEl('section.plugin', null, { 'id': id });

    var header = makeEl('header', name);
    section.appendChild(header);

    var form = makeEl('form', null, { id: 'form-' + name });
    section.appendChild(form);

    for (var field in spec) {
      var row = makeEl('div.row');
      row.appendChild(makeEl('label', field));
      var input = makeEl('input', null, {
        'name': field
      });
      row.appendChild(input);
      form.appendChild(row);
    }

    settingsEl.appendChild(section);
  }

  sendMessage('settings.get', name).then(function (values) {
    console.log(values);
    var form = section.querySelector('form');
    for (var field in values) {
      var input = form.querySelector('[name=' + field + ']');
      if (input) {
        input.value = values[field];
      }
    }
  });
}
