/* Description:
 *   Implements reset behaviour to a default URL
 *
 * Dependencies:
 *   None
 *
 * Configuration:
 *   DEFAULT_URL
 *
 * Commands:
 *   reset - Pushes the default url to the screen
 *
 * Author:
 *    lonnen
 */
module.exports = function(corsica) {
  corsica.on('content', function(msg, promise) {
    promise.fulfill(
      process.env.DEFAULT_URL || "http://i.imgur.com/SBvarB8.gif"
    );
  });
};
