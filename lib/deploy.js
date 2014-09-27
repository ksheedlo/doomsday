'use strict';

var config = require('./config'),
  winston = require('winston'),
  plugin,
  logger;

plugin = require('./plugins/' + config.PLUGIN);

logger = new winston.Logger({
  transports: [
    new winston.transports.Console({level: config.LOG_LEVEL})
  ]
});

module.exports = function (cb) {
  plugin.deploy(logger, config.PLUGIN_OPTS, cb);
};
