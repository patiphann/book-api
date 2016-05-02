'use strict';

var passport = require('passport');
require('../../config/passport')(passport); // pass passport for configuration

var self = {
  signUp: function(req, res, next) {
    passport.authenticate('local-signup', function(err, data, info) {
      if (err) {
        return next(err);
      }

      let msgError = '';

      if (info && info.length > 0) {
        for (var key in info) {
          msgError += info[key] + '\n';
        }

        return res.status(500).send(msgError);
      } else if (data.user._id === undefined) {
        return res.status(500).send('Error save!');
      } else {
        req.logIn(data.user, function(err) {
          if (err) {
            return res.status(500).send('Signup fail!');
          } else {
            return res.json({ token: data.token });
          }
        });
      }
    })(req, res, next);
  },
  signIn: function(req, res, next) {
    passport.authenticate('local-login', function(err, data, info) {
      if (err) {
        return next(err);
      }

      var msgError = '';

      if (info && info.length > 0) {
        // for (var key in info) {
        //   msgError += info[key] + '\n';
        // }

        // return res.status(401).send(msgError);

        return res.status(500).send('Invalid user or password');
      }

      req.logIn(data.user, function(err) {
        // if (err) { return next(err); }
        if (err) {
          return res.status(500).send('Invalid user or password!');
          // return res.json({ message: 'Login fail' });
        } else {
          return res.json({ token: data.token });
        }
      });
    })(req, res, next);
  }
}

module.exports = self;
