/* Description:
 *   Emits reset signals on a timer.
 *
 * Dependencies:
 *   settings, reset
 *
 * Configuration:
 *   resetTime - Time between resets on each screen, in milliseconds.
 *
 * Author:
 *    mythmon
 */

module.exports = function (corsica) {
  const settingsInterface = corsica.settings.setup('timer', {
    resetTime: 2 * 60 * 1000,
    jitter: 15 * 1000,
    resetOnConnect: true,
  });

  const clientCounters = {};
  const utils = corsica.utils;

  corsica.on('census.connected', async data => {
    const { name } = data;
    if (name === undefined) {
      return;
    }
    makeTimeout(name);
    const settings = await settingsInterface.get();
    if (settings.resetOnConnect) {
      corsica.sendMessage('reset', { screen: name });
    }
    return data;
  });

  corsica.on('census.disconnected', ({ name }) => {
    // Invalidate the timer.
    clientCounters[name]++;
  });

  async function makeTimeout(name, customTimeout) {
    if (name === undefined) {
      throw new Error('Name is required');
    }
    // Increment the counter index, and invalidate the old one.
    const currentCounter = clientCounters[name] = (clientCounters[name] || 0) + 1;

    /* Get the reset time, wait for that number of milliseconds, reset
     * the give screen, and then set another timeout.
     *
     * If makeTimeout gets called again, clientCounter[name] will get
     * incremented, making this promise chain invalid.
     */
    const settings = await settingsInterface.get();
    let resetTime, jitter;

    if (!isNaN(customTimeout)) {
      resetTime = customTimeout;
      jitter = 0;
    } else if ('screens' in settings && name in settings.screens) {
      resetTime = parseInt(settings.screens[name].resetTime || settings.resetTime);
      jitter = parseInt(settings.screens[name].jitter || settings.jitter);
    } else {
      resetTime = +settings.resetTime;
      jitter = +settings.jitter;
    }

    const offset = jitter * (Math.random() * 2 - 1);
    await utils.timerPromise(resetTime + offset);

    if (clientCounters[name] !== currentCounter) {
      // The counter got incremented, this chain is no longer valid.
      return;
    }
    makeTimeout(name);
    corsica.sendMessage('reset', { 'screen': name });
    console.log('[timer]', 'reset', name);
  }

  corsica.on('content', content => {
    // If a screen is getting new content, start a new counter.
    let screens = content.screen;
    if (typeof screens === 'string') {
      screens = [screens];
    }
    for (const screen of screens) {
      makeTimeout(screen, parseFloat(content.timeout) * 1000);
    }
    return content;
  });

  corsica.on('timer.stop', content => {
    console.log('stopping timer for', content.screen);
    let screens = content.screen;
    if (!(screens instanceof Array)) {
      screens = [screens];
    }

    for (const screen of screens) {
      if (clientCounters[screen]) {
        clientCounters[screen]++;
      }
    }

    return content;
  });

  corsica.on('timer.start', content => {
    console.log('restarting timer for', content.screen);
    corsica.sendMessage('reset', { screen: content.screen });
    return content;
  });
};
