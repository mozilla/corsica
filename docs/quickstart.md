# Corsica

## Getting Started with Corsica

You will need [node.js](http://nodejs.org/) and [npm](https://npmjs.org/). Try
your package manager, or checkout out Joyent's
[blog post](http://joyent.com/blog/installing-node-and-npm).

Onve you've got that set up, grab a copy of this repo and install the
dependencies:

    % git checkout git@github.com:mozilla/corsica.git
    % cd corsica
    % npm install

You can verify that you've got the dependencies by running the tests:

    % npm test

When you're ready, start the server:

    % npm start

You can use that command in a screen session, but the dev team recommends using
a process manager like upstart, monit, circus, supervisor, or similar.

## Customizing

Your set up will probably need some customization. Corsica reads settings first
from `/lib/config.js`, then reads in all environment variables, overriding the
current config keys when there's a conflict.

Plugins can be specified as one of these settings. Only specified settings will
be loaded, regardless of what could be loaded. Corsica will first try to load
plugins from the local `/plugins/` directory, and then from its npm dependencies
folder. If the plugin cannot be found an error will be logged at startup.
