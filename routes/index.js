'use strict';

// require controller
var User = require('../app/controllers/user'); // user
var Book = require('../app/controllers/book'); // book
var Bear = require('../app/controllers/bear'); // bear

module.exports = function(app, config, router, passport, tokenKey) {
  // ROUTES FOR OUR API
  // =============================================================================
  // middleware to use for all requests
  router.use(function(req, res, next) {
    // do logging
    // console.log('Something is happening.');
    next(); // make sure we go to the next routes and don't stop here
  });

  // test route to make sure everything is working (accessed at GET http://localhost:8080/api)
  app.get('/', function(req, res) {
    res.json({ title: 'Welcome to our api', token: tokenKey });
  });

  // test render jade
  app.get('/test/renderJade', function(req, res) {
    res.render('index', { title: 'Book voice' });
  });

  // more routes for our API will happen here

  // start user
  app.post('/auth/sign-up', User.signUp);
  app.post('/auth/sign-in', User.signIn);

  /* // route for facebook authentication and login
  app.get('/auth/facebook', passport.authenticate('facebook', { scope: 'email' }));

  // handle the callback after facebook has authenticated the user
  app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
      successRedirect: '/',
      failureRedirect: '/'
    }));

  // send to google to do the authentication
  // profile gets us their basic information including their name
  // email gets their emails
  app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

  // the callback after google has authenticated the user
  app.get('/auth/google/callback',
    passport.authenticate('google', {
      successRedirect: '/',
      failureRedirect: '/'
    })); */
  // end user

  // start route book
  router
    .route('/book')
    .post(Book.save) // save
    .get(Book.findAll); // find all

  router
    .route('/book/:id')
    .put(Book.update) // update
    .get(Book.findOne) // find one
    .delete(Book.delete); // delete
  // end book

  // start route page
  router
    .route('/page')
    .post(Book.addPage); // add

  router
    .route('/page/:id')
    .put(Book.updatePage) // update
    .delete(Book.deletePage); // delete
  // end book

  // start route bear
  router
    .route('/bears')
    .post(Bear.save) // save
    .get(Bear.findAll); // create

  router
    .route('/bears/:bear_id')
    .put(Bear.update) // update
    .get(Bear.findOne) // find one
    .delete(Bear.delete); // delete
  // end bear

  // REGISTER OUR ROUTES -------------------------------
  // all of our routes will be prefixed with /api
  app.use('/api', router);
};
