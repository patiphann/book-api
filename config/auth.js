'use strict';

// expose our config directly to our application using module.exports
module.exports = {

    'facebookAuth' : {
        'clientID'      : '1704707583084832',
        'clientSecret'  : 'c21f03892db2f50e5f6042849c79e100',
        'callbackURL'   : 'http://localhost:3000/auth/facebook/callback'
    },

    'googleAuth' : {
        'clientID'      : '877005478216-qpchvlblvu73qk2b1sc5doac1k6fhh9u.apps.googleusercontent.com',
        'clientSecret'  : 'ZKzcV_7gx2wnN0Gzo1NdYmEu',
        'callbackURL'   : 'http://localhost:3000/auth/google/callback'
    }

};