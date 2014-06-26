Plugins
-------

Most of Corsica's functionality comes in the form of Plugins. Plugins are JavaScript modules that can be loaded from the plugins directory or installed from NPM. They are loaded once at startup, so Corsica requires a config change a reboot to instantiate new functionality.

Plugins export a single function that will be called when the plugin is loaded. The function is passed the `corsica` object. The corsica object is used for registering event listeners and sending messages. Code outside of this function will be run at module load and can be used to set up external resources. Code inside the exported function will be executed by corsica as a setup function. It will be passed the `corsica` object, which can be used to register message listeners or objects that other plugins can use.

The `corsica` object itself enables most of the plugin functionality. Plugin's generally want to register `corsica.on(:message-type, :handler-function)`. The handler function is passed a message object with attributes about the message. If it returns the message, the message will be passed to the next plugin. If it does not, message propogation is stopped and the message will not make it to the screens. This function may also use the `corsica` object to submit new messages. These pieces of functionality combine to be useful for transforming custom syntax into properly formed urls.

There are a set of core plugins that offer basic functionality by following these patterns. They provide good examples for writing new plugins that range from the simple (`reset.js`) to the complex (`settings.js`) with documentation and promises based control flow. They also provide functionality for storing and retrieving settings and other utility functions that can be reused by non-core plugins.
