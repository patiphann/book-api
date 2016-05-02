'use strict';

var config = {};

config = {
  mongoURI: {
    development: 'mongodb://localhost/book-dev', // looks like mongodb://<user>:<pass>@localhost:27017/articles
    production: 'mongodb://localhost/book',
    test: 'mongodb://localhost/book-test'
  },
  port: {
    development: 8000,
    production: 8080,
    test: 3002
  },
  secret: 'atsecretjsonwebtoken',
  token: {
    expire: 60*60*24 // 24 hour
  }
};

module.exports = config;
