#!/usr/bin/env node

var shelljs = require('shelljs/global');
var minimist = require('minimist');

var args = minimist(process.env.CORDOVA_CMDLINE.split(' ').slice(2));
var env = args.env;

if ( typeof env !== 'undefined' ) { 
  exec('gulp build --env=' + env);
} else {
  exec('gulp build');
}