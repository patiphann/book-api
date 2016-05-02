'use strict';

var mongoose = require('mongoose');
var config = require('./config/config');
var app = require('./app')(config);

// MongoDb
var mongoURL = process.env.MONGO_URL || config.mongoURI[app.get('env')]; // set our mongo

mongoose.connect(mongoURL); // connect to our database

var port = process.env.PORT || config.port[app.get('env')]; // set our port

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
