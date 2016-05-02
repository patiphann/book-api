module.exports = function(config){
	// call the packages we need
	var express = require('express'); // call express
	var app = express(); // define our app using express
	var expressJwt = require('express-jwt');
	var jwt = require('jsonwebtoken');
	var passport = require('passport');
	var bodyParser = require('body-parser');
	var morgan = require('morgan');
	var path = require('path');
	var multipart = require('connect-multiparty');
	var router = express.Router(); // get an instance of the express Router

	// use 'static' middleware
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(bodyParser.json());
	app.use(multipart());
	app.use(passport.initialize());
	app.use('/api', expressJwt({secret: config.secret}));

	app.use(express.static(path.join(__dirname, 'node_modules')));
	app.use(express.static(path.join(__dirname, 'public')));

	app.set('views', './app/views');
	app.set('view engine', 'jade');

	// use morgan to log requests to the console
	app.use(morgan('dev'));

	app.use(function(req, res, next) {
	  res.header('Access-Control-Allow-Origin', '*');
	  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
	  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
	  res.set('X-Powered-By', 'Book voice');

	  // intercept OPTIONS method
	  if ('OPTIONS' == req.method) {
	    res.send(200);
	  } else {
	    next();
	  }
	});

	app.use(function(err, req, res, next) {
	  if (err.constructor.name === 'UnauthorizedError') {
	    res.status(401).send('Invalid token...');
	  }
	});

	if('devolopment' === app.get('env')){
		app.use(express.errorHandle());
	}

	// create token
	var tokenKey = jwt.sign({ token: 'unlimitedToken' }, config.secret);

	// routes ======================================================================
	// route middleware to verify a token
	router.use(function(req, res, next) {
	  // check header or url parameters or post parameters for token
	  var token = req.body.token || req.query.token || req.headers['x-access-token'];

	  // decode token
	  if (token) {
	    // verifies secret and checks exp
	    jwt.verify(token, config.secret, function(err, decoded) {      
	      if (err) {
	        return res.json({ success: false, message: 'Failed to authenticate token.' });    
	      } else {
	        // if everything is good, save to request for use in other routes
	        req.decoded = decoded;
	        next();
	      }
	    });
	  } else {
	    // if there is no token
	    // return an error
	    return res.status(403).send({ 
	        success: false, 
	        message: 'No token provided.' 
	    });
	  }
	});

	// apply the routes to our application with the prefix /api
	app.use('/auth', router);

	// router
	require('./routes')(app, config, router, passport, tokenKey);

	return app;
}
