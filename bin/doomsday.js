#!/usr/bin/env node
'use strict';

var deploy = require('../lib/deploy');

deploy(function (err) {
  process.exit(err ? 1 : 0);
});
