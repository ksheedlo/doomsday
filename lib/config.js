'use strict';

var fs = require('graceful-fs'),
  path = require('path'),
  doomsdayRc;

try {
  doomsdayRc = fs.readFileSync(path.join(process.env.HOME, '.doomsdayrc'), 'utf8');
  doomsdayRc = JSON.parse(doomsdayRc);
} catch (err) {
  if (err.code === 'ENOENT') {
    doomsdayRc = {};
  } else {
    console.error('Error loading file: ' + path.join(process.env.HOME, '.doomsdayrc'));
    process.exit(1);
  }
}

module.exports = {
  LOG_LEVEL: doomsdayRc.log_level || 'debug',
  PLUGIN: doomsdayRc.plugin || 'dreadnot',
  PLUGIN_OPTS: doomsdayRc.plugin_opts || {}
};
