'use strict';

process.env.NODE_ENV = 'test';

var mocha = require('mocha');
var mongoose = require('mongoose');
var config = require('../config/config');
var request = require('supertest');
var chai = require('chai');
var chaiHttp = require('chai-http');

var should = chai.should();
var expect = chai.expect;
var assert = chai.assert;
chai.use(chaiHttp);

var app = require('../app')(config);

// MongoDb
var mongoURL = process.env.MONGO_URL || config.mongoURI[app.get('env')]; // set our mongo

mongoose.connect(mongoURL); // connect to our database

var port = process.env.PORT || config.port[app.get('env')]; // set our port

// START THE SERVER
// =============================================================================
app.listen(port);

// Start test
var agent = chai.request(app);

var User = require('../app/schemas/user.js'); // user
var Book = require('../app/schemas/book.js'); // book
var Bear = require('../app/schemas/bear.js'); // bear
var xToken = ''; // x-access-token
var authToken = ''; // Authorization

describe('Main API', function() {
  it('should main templates / GET', function(done) {
    agent
      .get('/')
      .end(function(err, res) {
        xToken = res.body.token; // set x-access-token

        res.should.have.status(200);
        res.should.be.a('object');
        res.body.should.have.property('title');
        res.body.should.have.property('token');
        res.body.title.should.equal('Welcome to our api');

        done();
      });
  });
});

describe('Auth API', function() {
  // drop collection users
  User.collection.drop();

  // sign up
  it('should sign up /auth/sign-up POST', function(done) {
    agent
      .post('/auth/sign-up')
      .set('x-access-token', xToken)
      .send({ email: 'test@test.com', password: '12345678', name: 'test', surname: 'test' })
      .end(function(err, res) {
        authToken = 'Bearer ' + res.body.token; // Authorization

        res.should.have.status(200);
        res.should.be.a('object');
        res.body.should.have.property('token');

        done();
      });
  });

  // sign in
  it('should sign in /auth/sign-in POST', function(done) {
    agent
      .post('/auth/sign-in')
      .set('x-access-token', xToken)
      .send({ email: 'test@test.com', password: '12345678' })
      .end(function(err, res) {
        authToken = 'Bearer ' + res.body.token; // Authorization

        res.should.have.status(200);
        res.should.be.a('object');
        res.body.should.have.property('token');

        done();
      });
  });
});

describe('Book API', function() {
  var idBook = '';
  var pageId = [];

  // drop collection book
  Book.collection.drop();

  // create book
  it('should create book /api/book POST', function(done) {
    agent
      .post('/api/book')
      .set('x-access-token', xToken)
      .set('Authorization', authToken)
      .field('name', 'Book1')
      .field('by', '5725a1cf2689bc8c1e000002')
      .field('pName[0]', 'Page2')
      .field('pName[1]', 'Page1')
      .field('pNo[0]', 2)
      .field('pNo[1]', 1)
      .attach('pImg[0]', './test/files/image.jpg')
      .attach('pImg[1]', './test/files/image.jpg')
      .attach('pAudio[0]', './test/files/audio.mp3')
      .attach('pAudio[1]', './test/files/audio.mp3')
      .end(function(err, res) {
        res.should.have.status(200);
        res.should.be.a('object');
        res.body.should.have.property('message');
        res.body.message.should.equal('Book created!');

        done();
      });
  });

  // find all book
  it('should find all book /api/book GET', function(done) {
    agent
      .get('/api/book')
      .set('x-access-token', xToken)
      .set('Authorization', authToken)
      .end(function(err, res) {
        idBook = res.body[0]._id;
        pageId = [
          res.body[0].pages[0]._id,
          res.body[0].pages[1]._id
        ];

        res.should.have.status(200);
        res.should.be.a('object');
        res.body[0].should.have.property('_id');
        res.body[0].should.have.property('name');
        res.body[0].should.have.property('by');
        res.body[0].name.should.equal('Book1');
        res.body[0].by.should.equal('5725a1cf2689bc8c1e000002');

        res.body[0].should.have.property('pages');
        res.body[0].pages.should.be.a('array');

        let key = 0;
        res.body[0].pages[key].should.be.a('object');
        res.body[0].pages[key].should.have.property('_id');
        res.body[0].pages[key].should.have.property('name');
        res.body[0].pages[key].should.have.property('no');
        res.body[0].pages[key].should.have.property('image');
        res.body[0].pages[key].should.have.property('audio');
        res.body[0].pages[key].name.should.equal('Page1');
        res.body[0].pages[key].no.should.equal(1);

        key = 1;
        res.body[0].pages[key].should.be.a('object');
        res.body[0].pages[key].should.have.property('_id');
        res.body[0].pages[key].should.have.property('name');
        res.body[0].pages[key].should.have.property('no');
        res.body[0].pages[key].should.have.property('image');
        res.body[0].pages[key].should.have.property('audio');
        res.body[0].pages[key].name.should.equal('Page2');
        res.body[0].pages[key].no.should.equal(2);

        done();
      });
  });

  // find one
  it('should find book /api/book/:id GET', function(done) {
    agent
      .get('/api/book/' + idBook)
      .set('x-access-token', xToken)
      .set('Authorization', authToken)
      .end(function(err, res) {
        res.should.have.status(200);
        res.should.be.a('object');
        res.body.should.have.property('_id');
        res.body.should.have.property('name');
        res.body.should.have.property('by');
        res.body.name.should.equal('Book1');
        res.body.by.should.equal('5725a1cf2689bc8c1e000002');

        res.body.should.have.property('pages');
        res.body.pages.should.be.a('array');

        let key = 0;
        res.body.pages[key].should.be.a('object');
        res.body.pages[key].should.have.property('_id');
        res.body.pages[key].should.have.property('name');
        res.body.pages[key].should.have.property('no');
        res.body.pages[key].should.have.property('image');
        res.body.pages[key].should.have.property('audio');
        res.body.pages[key].name.should.equal('Page1');
        res.body.pages[key].no.should.equal(1);

        key = 1;
        res.body.pages[key].should.be.a('object');
        res.body.pages[key].should.have.property('_id');
        res.body.pages[key].should.have.property('name');
        res.body.pages[key].should.have.property('no');
        res.body.pages[key].should.have.property('image');
        res.body.pages[key].should.have.property('audio');
        res.body.pages[key].name.should.equal('Page2');
        res.body.pages[key].no.should.equal(2);

        done();
      });
  });

  // update book
  it('should update book /api/book/:id PUT', function(done) {
    agent
      .put('/api/book/' + idBook)
      .set('x-access-token', xToken)
      .set('Authorization', authToken)
      .field('name', 'edit Book1')
      .field('by', '5725a1cf2689bc8c1e000003')
      .field('pName[' + pageId[0] + ']', 'edit Page2')
      .field('pName[' + pageId[1] + ']', 'edit Page1')
      .field('pName[0]', 'edit Page3')
      .field('pNo[' + pageId[0] + ']', 22)
      .field('pNo[' + pageId[1] + ']', 11)
      .field('pNo[0]', 33)
      .attach('pImg[' + pageId[0] + ']', './test/files/image.jpg')
      .attach('pImg[' + pageId[1] + ']', './test/files/image.jpg')
      .attach('pImg[0]', './test/files/image.jpg')
      .attach('pAudio[' + pageId[0] + ']', './test/files/audio.mp3')
      .attach('pAudio[' + pageId[1] + ']', './test/files/audio.mp3')
      .attach('pAudio[0]', './test/files/audio.mp3')
      .end(function(err, res) {
        res.should.have.status(200);
        res.should.be.a('object');
        res.body.should.have.property('message');
        res.body.message.should.equal('Book updated!');

        done();
      });
  });

  // find add page
  it('should add page /api/page POST', function(done) {
    agent
      .post('/api/page/')
      .set('x-access-token', xToken)
      .set('Authorization', authToken)
      .field('id', idBook)
      .field('pName[0]', 'Page4')
      .field('pName[1]', 'Page5')
      .field('pNo[0]', 4)
      .field('pNo[1]', 5)
      .attach('pImg[0]', './test/files/image.jpg')
      .attach('pImg[1]', './test/files/image.jpg')
      .attach('pAudio[0]', './test/files/audio.mp3')
      .attach('pAudio[1]', './test/files/audio.mp3')
      .end(function(err, res) {
        res.should.have.status(200);
        res.should.be.a('object');
        res.body.should.have.property('message');
        res.body.message.should.equal('Page created!');

        done();
      });
  });

  // update page
  it('should update page /api/page/:id PUT', function(done) {
    agent
      .put('/api/page/' + pageId[0])
      .set('x-access-token', xToken)
      .set('Authorization', authToken)
      .field('id', idBook)
      .field('pName[' + pageId[0] + ']', 'Page8')
      .field('pNo[' + pageId[0] + ']', 8)
      .attach('pImg[' + pageId[0] + ']', './test/files/image.jpg')
      .attach('pAudio[' + pageId[0] + ']', './test/files/audio.mp3')
      .end(function(err, res) {
        res.should.have.status(200);
        res.should.be.a('object');
        res.body.should.have.property('message');
        res.body.message.should.equal('Page updated!');

        done();
      });
  });

  // delete
  it('should delete page /api/page/:id DELETE', function(done) {
    agent
      .delete('/api/page/' + pageId[0])
      .set('x-access-token', xToken)
      .set('Authorization', authToken)
      .end(function(err, res) {
        res.should.have.status(200);
        res.should.be.a('object');
        res.body.should.have.property('message');
        res.body.message.should.equal('Successfully deleted!');

        done();
      });
  });

  // delete
  it('should delete book /api/book/:id DELETE', function(done) {
    agent
      .delete('/api/book/' + idBook)
      .set('x-access-token', xToken)
      .set('Authorization', authToken)
      .end(function(err, res) {
        res.should.have.status(200);
        res.should.be.a('object');
        res.body.should.have.property('message');
        res.body.message.should.equal('Successfully deleted!');

        done();
      });
  });

});

describe('Bear API', function() {
  var bearId = '';

  // drop collection bear
  Bear.collection.drop();

  // create bear
  it('should create bear /api/bears POST', function(done) {
    agent
      .post('/api/bears')
      .set('x-access-token', xToken)
      .set('Authorization', authToken)
      .field('name', 'Test')
      .end(function(err, res) {
        res.should.have.status(200);
        res.should.be.a('object');
        res.body.should.have.property('message');
        res.body.message.should.equal('Bear created!');

        done();
      });
  });

  // find all bear
  it('should find all bear /api/bears GET', function(done) {
    agent
      .get('/api/bears')
      .set('x-access-token', xToken)
      .set('Authorization', authToken)
      .end(function(err, res) {
        bearId = res.body[0]._id;

        res.should.have.status(200);
        res.should.be.a('object');
        res.body[0].should.have.property('_id');
        res.body[0].should.have.property('name');
        res.body[0].name.should.equal('Test');

        done();
      });
  });

  // find one
  it('should find one /api/bears/:bear_id GET', function(done) {
    agent
      .get('/api/bears/' + bearId)
      .set('x-access-token', xToken)
      .set('Authorization', authToken)
      .end(function(err, res) {
        res.should.have.status(200);
        res.should.be.a('object');
        res.body.should.have.property('_id');
        res.body.should.have.property('name');
        res.body.name.should.equal('Test');

        done();
      });
  });

  // update bear
  it('should update bear /api/bears/:bear_id PUT', function(done) {
    agent
      .put('/api/bears/' + bearId)
      .set('x-access-token', xToken)
      .set('Authorization', authToken)
      .field('name', 'Test')
      .end(function(err, res) {
        res.should.have.status(200);
        res.should.be.a('object');
        res.body.should.have.property('message');
        res.body.message.should.equal('Bear updated!');

        done();
      });
  });

  // delete bear
  it('should delete bear /api/bears/:bear_id DELETE', function(done) {
    agent
      .delete('/api/bears/' + bearId)
      .set('x-access-token', xToken)
      .set('Authorization', authToken)
      .field('name', 'Test')
      .end(function(err, res) {
        res.should.have.status(200);
        res.should.be.a('object');
        res.body.should.have.property('message');
        res.body.message.should.equal('Successfully deleted');

        done();
      });
  });
});
