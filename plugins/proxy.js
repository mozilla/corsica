/* Description:
 *   Sets up the `request` library to deal with any system proxies that
 *   may exist.
 *
 * Dependencies:
 *   request
 *
 * Configuration:
 *   None
 */

module.exports = function (corsica) {
  const proxyUrl = corsica.config.http_proxy || corsica.config.HTTP_PROXY;
  corsica.request = corsica.request.defaults({ 'proxy': proxyUrl });
};
