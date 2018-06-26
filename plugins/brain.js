/* Description:
 *   Stores data for other plugins. Basic key value store.
 *
 * Dependencies:
 *   None
 *
 * Configuration:
 *   STATE_DIR_PATH
 *
 * Author:
 *    lonnen
 */

/* Extend an object with arbitrary other objects in a splat
 *
 * return the original object with updated changes
 */

const fs = require('fs');
const path = require('path');

class Brain {
  constructor(corsica) {
    if (corsica.config.STATE_DIR_PATH) {
      console.warn('Warning: STATE_DIR_PATH should now be a path to a json ' +
        'file to store persistence data, and be in STATE_DIR instead.');
      this.dbPath = path.join(corsica.config.STATE_DIR_PATH, 'state.json');
    }
    else {
      this.dbPath = corsica.config.STATE_PATH;
    }
    this.statePromise = new Promise(resolve => {
      fs.readFile(this.dbPath, (err, contents) => {
        if (err) {
          console.error(err.stack || err);
          resolve({});
        }
        else {
          resolve(JSON.parse(contents));
        }
      });
    });
  }

  async get(key) {
    const state = await this.statePromise;
    return state[key];
  }

  async set(key, value) {
    const state = await this.statePromise;
    state[key] = value;
    this.statePromise = Promise.resolve(state);

    await new Promise((resolve, reject) => {
      fs.writeFile(this.dbPath, JSON.stringify(state, null, 4), err => {
        if (err) {
          reject(err);
        } else {
          resolve()
        }
      })
    })
  }

  async remove(key) {
    await this.set(key, null);
  }
}

module.exports = function (corsica) {
  corsica.brain = new Brain(corsica);
};
