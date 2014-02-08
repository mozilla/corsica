
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

    for (var field in spec) {
      var row = makeEl('div.row');
      var input;
      row.appendChild(makeEl('label', field));
      if (spec[field] instanceof Array) {
        var many = makeEl('div.many', null, {
          'data-many': field
        });
        row.appendChild(many);
        var rows = spec[field];
        for (var i = 0; i < rows.length; i++) {
          input = makeEl('input', null, {
            'name': field + i,
            'value': rows[i]
          });
          many.appendChild(input);
        }
        many.appendChild(makeEl('input.empty'));
      } else {
        input = makeEl('input', null, {
          'name': field,
          'value': spec[field]
        });
        row.appendChild(input);
      }
      form.appendChild(row);
    }

    settingsEl.appendChild(section);
  }

  sendMessage('settings.get', name).then(function (values) {
    var form = section.querySelector('form');
    console.log(values);
    for (var field in values) {
      var val = values[field];
      if (val instanceof Array) {
        var many = form.querySelector('[data-many=' + field + ']');
        var inputs = many.querySelectorAll('input:not(.empty)');
        for (var i = 0; i < Math.max(val.length, inputs.length); i++) {
          var input = inputs[i];
          var v = val[i];
          if (v !== undefined && input) {
            input.value = v;
          } else if (v !== undefined && !input) {
            input = makeEl('input', null, {
              'name': field + i,
              'value': val[i]
            });
            many.insertBefore(input, many.querySelector('.empty'));
          } else if (v === undefined && input) {
            input.parentNode.removeChild(input);
          }
        }
      } else {
        var input = form.querySelectorAll('[name=' + field + ']');
        if (input) {
          input.value = values[field];
        }
      }
    }
  });
}
