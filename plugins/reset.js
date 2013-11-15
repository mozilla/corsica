/* Description:
 *   pushes a default URL to screens when /reset is hit
 *
 * Dependencies:
 *   None
 *
 * Configuration:
 *   DEFAULT_URL
 *
 * Author:
 *    lonnen
 */
module.exports = function(corsica) {
  corsica.on('reset', function(content, promise) {
    promise.fulfill(
      process.env.DEFAULT_URL || "http://i.imgur.com/SBvarB8.gif"
    );
  });
};
