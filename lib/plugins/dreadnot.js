'use strict';

var request = require('request').defaults({jar: true}),
  cheerio = require('cheerio');

function getTargetSHA (logger, props, cb) {
  var resource = '/stacks/' + props.stack + '/regions/' + props.region;

  logger.debug('[doomsday] Logging in...');
  request.post(props.url + '/login', {
    form: {
      username: props.username,
      password: props.password
    }
  }, function (err, res, body) {
    if (err) {
      logger.error('[doomsday] Login failed.');
      cb(err);
    } else {
      logger.debug('[doomsday] Fetching target SHA...');
      request(props.url + resource, function (err ,res, body) {
        var $, sha;

        if (err) {
          logger.error('[doomsday] Failed to fetch latest revision.');
          cb(err);
        } else {
          $ = cheerio.load(body);
          sha = $('#to_revision').attr('value');
          if (!sha) {
            logger.debug('[doomsday] Failed to parse SHA.');
            cb(new Error('[doomsday:nosha] Failed to parse SHA'));
          } else {
            logger.debug('[doomsday] Found SHA: ' + sha);
            cb(null, sha);
          }
        }
      });
    }
  });
}

function startDeploy (logger, props, cb) {
  var resource = '/stacks/' + props.stack + '/regions/' + props.region;

  getTargetSHA(logger, props, function (err, sha) {
    if (err) {
      logger.error('[doomsday] Failed to load target SHA.');
      cb(err);
    } else {
      setTimeout(function () {
        logger.debug('[doomsday] Deploying...');
        request.post(props.url + resource, {
          form: {
            to_revision: sha,
            ack_warning: true
          }
        }, function (err, res) {
          if (err) {
            logger.error('[doomsday] Deploy request failed.');
            cb(err);
          } else if (!res.headers.location) {
            logger.error('[doomsday] Expected Location header from Deploy ' +
              'request, but it was not present. Is a deploy already in progress?');
            cb(new Error('[doomsday:noloc] Missing Location header from deploy'));
          } else {
            logger.debug('[doomsday] Started deploying ' + res.headers.location);
            cb(null, res.headers.location);
          }
        });
      }, 1000);
    }
  });
}

function logProgress (logger, props, cb) {
  if (!props.url) {
    props.url = (props.ssl ? 'https://' : 'http://') + props.host;
  }
  startDeploy(logger, props, function (err, location) {
    var logIndex = 0,
      refreshInterval = 1000,
      pollLogs;

    if (err) {
      cb(err);
    } else {
      pollLogs = function () {
        request({
          url: location + '/log',
          qs: {from: logIndex},
          json: true,
          jar: true
        }, function (err, res, logs) {
          if (err) {
            cb(err);
          } else if (res.statusCode === 502) {
            logger.info('[doomsday] GET ' + location + '/log?from=' + logIndex + ' 502');
            logger.info('[doomsday] Retrying in 5 seconds...');
            setTimeout(pollLogs, 5000);
          } else {
            logs.forEach(function (log) {
              if (typeof log !== 'boolean') {
                if (log.lvl <= 2) {
                  logger.error('[dreadnot] ' + log.msg);
                } else if (log.lvl === 3) {
                  logger.warning('[dreadnot] ' + log.msg);
                } else {
                  logger.info('[dreadnot] ' + log.msg);
                }
              }
            });
            if (typeof logs[logs.length-1] === 'boolean') {
              logger.info('[doomsday] Deploy SUCCESS');
              cb(null, {type: 'success'});
            } else {
              logIndex += logs.length;
              setTimeout(pollLogs, 1000);
            }
          }
        });
      };
      setTimeout(pollLogs, 1000);
    }
  });
}

module.exports = {
  deploy: logProgress
};
