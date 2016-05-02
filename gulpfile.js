'use strict';

process.env.NODE_ENV = 'development';

var gulp = require('gulp'),
  server = require('gulp-develop-server'),
  bs = require('browser-sync'),
  config = require('./config/config');

var options = {
  server: {
    path: './server.js',
    execArgv: ['--harmony']
  },
  bs: {
    proxy: 'localhost:'+config.port[process.env.NODE_ENV]
  }
};

var serverFiles = [
  './server.js',
	'./app.js',
	'./config/*.js',
  './routes/*.js',
  './app/**/*.js',
  './app/**/*.jade'
];

gulp.task('server:start', function() {
  server.listen(options.server, function(error) {
    if (!error) bs(options.bs);
  });
});

// If server scripts change, restart the server and then browser-reload.
gulp.task('server:restart', function() {
  server.restart(function(error) {
    if (!error) bs.reload();
  });
});

gulp.task('default', ['server:start'], function() {
  gulp.watch(serverFiles, ['server:restart'])
});