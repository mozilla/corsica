# Corsica
This document is intended for people who are comfortable reading the code to understand what's happening.   For everyone else the best place to start is probably the Absolute Beginner's guide to Corsica on a Raspberry Pi.  You'll find it in docs/raspi.md and repackaged as an [Instructable](https://www.instructables.com/id/A-Digital-Sign-Server-on-a-Raspberry-Pi/).

## Getting Started with Corsica

You will need [node.js](http://nodejs.org/) and [npm](https://npmjs.org/). Try
your package manager, or checkout out Joyent's
[blog post](http://joyent.com/blog/installing-node-and-npm).

Onve you've got that set up, grab a copy of this repo and install the
dependencies:

    % git clone git@github.com:mozilla/corsica.git
    % cd corsica
    % npm install

You can verify that you've got the dependencies by running the tests:

    % npm test

When you're ready, start the server:

    % npm start

You can use that command in a screen session, but the dev team recommends using
a process manager like upstart, monit, circus, supervisor, or similar.

## Customizing

Your set up will probably need some customization. There are two kinds
of customization in Corsica: configuration and settings. Configuration
is mostly static and used by the core. Settings are dynamic and used
mostly by plugins.

### Configuration

Configuration comes from the environment, and is for very static things
such the port to listen on, or the plugins to load. There are three
sources for config:

1. `lib/config.json` - This is where the defaults are stored, and a good
   place to see what you need to configure. You shouldn't change values
   here.

2. `.env` - If there is a file named `.env` in the base of the
   repository, settings will be loaded from this file as if they were from
   the environment. The syntax is one configuration per line, like `PORT=8080`.
   If the values here are valid JSON, they will be parsed as such. Settings
   here will override the defaults in `lib/config.json`. This should only
   be used in development. Production environments should use environment
   variables directly.

3. The environment - The recommended place to set configuration is in
   environment variables. If environment variables are valid JSON, they will be
   parsed as such. Configuration options here will override both
   `lib/config.json` and `.env`.

Plugins can be specified as one of these settings. Only specified settings will
be loaded, regardless of what could be loaded. Corsica will first try to load
plugins from the local `/plugins/` directory, and then from its npm dependencies
folder. If the plugin cannot be found an error will be logged at startup.


### Settings

Settings are stored in a leveldb database, and are dynamic. They can change at
run time and are generally configured with a web browser on the admin page.
Most of these come from plugins. Examples include the set of default urls for
screens (if you have the reset plugin enabled), or the time that screens wait
to reset (if you have the timer plugin enabled).


