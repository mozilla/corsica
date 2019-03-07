console.log(
    'Welcome to Corsica.\n' +
    'To the NORTH there is water.\n' +
    'To the WEST there is water.\n' +
    'To the EAST there is water.\n' +
    'To the SOUTH there is water.\n' +
    'By your side is a rock with XYZZY carved on it.'
);

var config;
try {
    config = localStorage.getItem('config');
    config = JSON.parse(config);
    console.log('Welcome back, old friend.');
} catch (e) {
    console.warn('Config could not be parsed: ' + e);
}

if (!config) {
    console.log('You\'re new here, aren\'t you.');
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
    console.log(msg);
    var names = msg.screen;
    var tags = msg.tags;
    var i = 0;

    // names
    if (!(names instanceof Array)) {
        names = [names];
    }

    for (i = 0; i < names.length; i++) {
        if (names[i] === config.name) {
            return true;
        }
    }

    // tags
    if (!(tags instanceof Array)) {
        tags = [tags];
    }

    for (i = 0; i < tags.length; i++) {
        if (config.tags.indexOf(tags[i]) >= 0) {
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

var toastTimeout;
var toastEl = document.querySelector('#toast');

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
    var tags = config.tags;
    if (tags.indexOf(tag) === -1) {
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
    var tags = config.tags;
    var idx = tags.indexOf(tag);
    if (idx >= 0) {
        tags.splice(idx, 1);
    }
    toast('removed tag subscription `' + tag + '`');
    sendSubscriptions();
    writeConfig();
}

var contentEl = document.querySelector('#content');

function handleURL(url) {
    var iframe = makeEl('iframe', null, {
        sandbox: 'allow-same-origin allow-scripts allow-forms',
        src: url
    });
    return iframe;
}

function handleHTML(html) {
    var blob = new Blob([html], { "type": "text/html" });
    var url = URL.createObjectURL(blob);
    var iframe = makeEl('iframe', null, {
        sandbox: 'allow-same-origin allow-scripts allow-forms',
        src: url
    });
    return iframe;
}

function updateDisplay(iframe, msg) {
    var zoom = parseInt(msg.zoom) || 100;
    iframe.style.width = (10000 / zoom) + '%';
    iframe.style.height = (10000 / zoom) + '%';
    iframe.style.transform = 'scale(' + (zoom / 100) + ')';
    contentEl.innerHTML = '';
    contentEl.appendChild(iframe);
}


function init() {

    var params = (new URL(document.location)).searchParams;
    var tagset;

    if (params) {

        var myname = params.get('name');
        if (!myname) {
            myname = params.get('n');
        }
        if (myname) {
            config.name = myname;
            writeConfig();
        }

        var mydefault = params.get('default');
        if (!mydefault) {
            mydefault = params.get('d');
        }
        if (mydefault) {
            console.log("Replacing default subscription with \"" + mydefault + "\"");
            config.tags = [mydefault];
            writeConfig();
        }

        var tags2add = params.get('subscribe');
        if (!tags2add) {
            tags2add = params.get('s');
        }
        if (tags2add) {
            tagset = tags2add.split(",");
            tagset.forEach(addSubscription);
            if (tagset.length == 1) {
                console.log("Adding 1 new subscription.");
            } else {
                console.log("Adding " + tags2add.length + " new subscriptions.");
            }
        }

        var tags2drop = params.get('unsubscribe');
        if (!tags2drop) {
            tags2drop = params.get('u');
        }
        if (tags2drop) {
            tagset = tags2drop.split(",");
            tagset.forEach(removeSubscription);
            if (tagset.length == 1) {
                console.log("Dropping 1 subscription.");
            } else {
                console.log("Dropping " + tags2drop.length + " subscriptions.");
            }
        }

        var logtext = ("My name is " + config.name + " and I'm subscribed to:");
        config.tags.forEach(function(thetag) {
            logtext += (" " + thetag + ",");
        });
        console.log(logtext.slice(0, -1) + ".");
    }

    identify();
    sendSubscriptions().then(function() {
        sendMessage('init', { name: config.name });
    });
    setupFullscreen();
}

function sendSubscriptions() {
    console.log('sending other end');
    return sendMessage('tags.setSubscriptions', { name: config.name, tags: config.tags });
}

console.log('Waiting for connection to server...');

socket.on('connect', function() {
    console.log('Connection to server established.');

    // fetch name
    if (config.name === undefined) {
        console.log('getting a name');
        sendMessage('getName').then(function(message) {
            rename(message.name);
        });
        return;
    }
    init();
});


socket.on('admin', function(msg) {
    var type = msg.type;
    if (!type) {
        return;
    }
    if (!payAttention(msg)) {
        console.log('You receive a message, but it\'s not for you...');
        return;
    }
    switch (type) {
        case 'rename':
            if (msg.name) {
                rename(msg.name);
            }
            break;
        case 'reload':
            window.location.reload();
            break;
        case 'subscribe':
            if (msg.tag) {
                addSubscription(msg.tag);
            }
            break;
        case 'unsubscribe':
            if (msg.tag) {
                removeSubscription(msg.tag);
            }
            break;
    }
});

socket.on('toast', function(msg) {
    if (!payAttention(msg)) {
        console.log('You receive a message, but it\'s not for you...');
        return;
    }
    if (msg.text) {
        toast(msg.text, msg.timeout);
    }
});

socket.on('identify', function(msg) {
    if (payAttention(msg)) {
        identify();
    }
});

socket.on('content', function(msg) {
    var type = msg.type;
    if (!type) {
        console.warn('You thought you heard something. No, just the waves.');
        return;
    }
    if (!payAttention(msg)) {
        console.log('You receive a message, but it\'s not for you...');
        return;
    }
    switch (type) {
        case 'url':
            updateDisplay(handleURL(msg.url), msg);
            untoast();
            break;
        case 'html':
            updateDisplay(handleHTML(msg.content), msg);
            untoast();
            break;
        default:
            console.log('A voice speaks, in an unintelligible language.');
            break;
    }
});

var hudTimeout;
document.body.addEventListener('mousemove', function(e) {
    document.body.classList.add('show-hud');
    clearTimeout(hudTimeout);
    hudTimeout = setTimeout(function() {
        document.body.classList.remove('show-hud');
    }, 3000);
});

socket.on('disconnect', function() {
    console.log('Disconnected from server.');
});

window.addEventListener("message", function(e) {
    var data = e.data;
    if (data.corsica) {
        if (data.message) {
            var args = data.args || {};
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
        function() {}).call(elem, Element.ALLOW_KEYBOARD_INPUT);
}

function cancelFullScreen() {
    (document.exitFullscreen ||
        document.msExitFullscreen ||
        document.mozCancelFullScreen ||
        document.webkitExitFullscreen ||
        function() {}).call(document);
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

    // optimistic attempt for dedicated ambient displays that
    // are modified to allow fullscreen without user action
    // i.e. kiosk setups without dedicated inputs
    console.log("trying kiosk mode, may throw an uncatchable TypeError");
    requestFullscreen(contentElem);

    document.addEventListener('keydown', function(e) {
        // 70 is "f"
        if (e.keyCode === 70) {
            toggleFullScreen(contentElem);
        }
    });
    document.querySelector('#fullscreen').addEventListener('click', function(e) {
        toggleFullScreen(contentElem);
    });
}
