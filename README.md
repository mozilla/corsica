![corsica](https://raw.github.com/mozilla/corsica/master/static/corsica.png)

![build status: gold](https://travis-ci.org/mozilla/corsica.png)

Empathic screens for the masses.

## Looking for Mozilla's Corsica deployment?

Suggest content, plugin changes, and administrative changes here: https://github.com/mozilla/moz-corsica

## What is Corsica? How should I use it?

Corsica is a server for coordinating screens via web browsers. Content comes from an API or a plugin, is processed by one or more plugins, and sent as output to connected screens.

Chat bots, browser plugins, or website widgets can use the API to control nearby screens. This is useful for Posting graphs, GIFs, slides, or public announcements. Plugins provide a playlist-like rotation from a list of URLs for ambient dashboards of application metrics, promotional pages, event calendars, etc.

Since Corsica can push content to any modern web browser the screens can be monitors, tablets, phones, smart TVs, cars, etc.

## How do I extend Corsica?

Corsica aspires to a tiny core with most features implemented via plugins. Changes to the core can be submitted on this repo as PRs.

Plugins are the easiest way to customize your installation and add new functionality. They are usually developed in an independent package and installed via NPM, though they can also be included directly as files. When published on NPM, they should have the keyword `corsica`. Existing plugins can then be discovered with by [searching npm](https://www.npmjs.com/browse/keyword/corsica).

Corsica's core operates on `command`s (sometimes called `messages`), which can be submitted via the API or by plugins. Each `command` is processed by each active plugin. A plugin may choose to ignore the command, transform it, or submit a new command. `command`s are formatted like a JS function call:

`command [positional1] [positional2] [kwarg=value] [kwarg2=value]`

There are a few feature patterns that plugins commonly implement:

###### Create an easy to remember `command` that expands into a URL, sometimes after making an external request:
```
xkcd random -> content type=html content='<body style="margin:0;height:100%;background:url(http://imgs.xkcd.com/comics/cloud.png) no-repeat center #000;background-size:contain;"></body>'
```

###### Reformat URLs

URLs can be analyzed and reformatted to make presentation on a screen easier -- transform image hosting or webcomic urls so that only the image displays, ignoring the cruft of the screen. Transform videos so that they display full screen and autoplay. Create shorthand syntaxes that unpack to whole websites. Since new messages will pass through all the plugins again, you can avoid duplicating functionality:
```
http://imgur.com/1SSVsBH -> http://i.imgur.com/1SSVsBH.gif -> content type=url url=http://i.imgur.com/1SSVsBH.gif
```

###### Generate and inject raw HTML

New content types can be implemented, to do things like inject raw HTML. This let's you avoid setting up an external static file host, and saves a network request:
```
content type=html content="<style>@keyframes AnimationName{0%{background-position:center,100vw 50%}100%{background-position:center,0vw 50%}}body{background:url(https://raw.githubusercontent.com/bwinton/whimsy/f8c52e336233897ba37aa265e2fccdaa008a2ca1/wheeeeee.png)no-repeat center,linear-gradient(to right,red 0%,orange 17vw,yellow 33vw,#0f0 50vw,blue 67vw,violet 83vw,red 100vw);height:100%;background-size:90vh,cover;margin:0;animation:AnimationName 180s linear infinite;}</style><body>"
```

###### Call external APIs

Requests can be made to external APIs and the result can be used in the creation of a new URL or new static content.
```
meme decreux dost thou even hoist? -> http://www.somememe.com/2rwhmpt.jpg -> content type=url url=http://www.somememe.com/2rwhmpt.jpg
```

## How do I set up a Kiosk client?

Corsica clients rely on WebAPIs that MUST be initiated by a user action in modern web browsers. You may find it useful to change your browser configuration on managed deployments (Raspberry Pi, Mac Mini, NUC).

Launch Chrome with the kiosk flag: `--kiosk "<<your corsica server url>>"`

If you're running in Firefox, you can change the following preferences in `about:preferences` or add the following lines to `user.js` in the profile directory:
```
user_pref("full-screen-api.allow-trusted-requests-only", false);
user_pref("full-screen-api.approval-required", false);
```
