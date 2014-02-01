# corsica

![build status: gold](https://travis-ci.org/mozilla/corsica.png)

Empathic screens for the masses.

Corsica is a server for coordinating screens via web browsers. Corsica recieves content from an API or a plugin, processes it with one or more plugins, and sends output to screens.

Corsica can trivially be used to control ambient displays in an office via an API. Chat bots can yield control of nearby screens to nearby desks, temporarily or indefinitely, for posting graphs, GIFs, or public announcements. Plugins can provide a regular rotation between a list of URLs for ambient dashboard display, like application metrics, promotional pages, or event calendars for the proximal space.

Since Corsica can push content to any modern webbrowser, clients can be monitors, tablets, or phones. Wall mounted tablets are significantly cheaper than TVs with dedicated computers. Phones can be used as transient clients to set up remote viewports when you're away from the relavent screen.

Plugins make it easy to extend and add new functionality. URLs can be analyzed and reformatted to make presentation on a screen easier -- transform imgur or webcomic urls so that only the image displays, ignoring the cruft of the screen. Transform videos so that they display full screen and autoplay. Create shorthand syntaxes that unpack to whole websites, `contributors mozilla/corsica` -> `https://github.com/mozilla/corsica/graphs/contributors`, or even complicated calls to external APIs that create a new page to display, e.g. `meme decreux dost though even hoist? -> http://www.somememe.com/2rwhmpt.jpg`.
