/* Description:
 *   Help function for content to infer some fields.
 *
 * Dependencies:
 *   None
 *
 * Configuration:
 *   None
 *
 * Author:
 *    mythmon
 */
module.exports = function(corsica) {
  corsica.on('content', function(content) {
    if (content.type === undefined) {
      if (content.url) {
        content.type = 'url';
      } else if (content.content) {
        content.type = 'html';
      }
    }

    return content;
  });
};
