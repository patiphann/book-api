'use strict';

var mongoose = require('mongoose');

var Book = require('../schemas/book');
var filesLib = require('../lib/files');

var self = {
  findAll: function(req, res) {
    Book.find(function(err, docs) {
      if (err) {
        res.send(err);
      }

      res.json(docs);
    });
  },
  findOne: function(req, res) {
    Book.findById(req.params.id, function(err, docs) {
      if (err) {
        res.send(err);
      }

      res.json(docs);
    });
  },
  save: function(req, res) {
    let objBook = {
      name: req.body.name,
      by: req.body.by
    };

    Book.create(objBook, function(err, docs) {
      if (err) {
        res.status(500).send('Save book fail!');
      } else {
        // save page
        let objPage = {
          _id: docs._id,
          pName: req.body.pName,
          pNo: req.body.pNo,
          pImg: req.files.pImg,
          pAudio: req.files.pAudio,
          type: 'book'
        };

        filesLib.savePage(objPage, function(err, resp) {
          if (err) {
            res.status(400).json(err);
          }

          if (resp !== true) {
            res.status(500).send('Save page fail!');
          } else {
            res.json({ message: 'Book created!' });
          }
        });
      }
    });
  },
  update: function(req, res) {
    let objBook = {
      name: req.body.name,
      by: req.body.by
    };

    Book.findByIdAndUpdate(req.params.id, objBook, { new: true }, function(err, docs) {
      if (err) {
        res.status(500).send('Update book fail!');
      } else {
        // save page
        let objPage = {
          _id: req.params.id,
          pName: req.body.pName,
          pNo: req.body.pNo,
          pImg: req.files.pImg,
          pAudio: req.files.pAudio,
          type: 'book'
        };

        filesLib.savePage(objPage, function(err, resp) {
          if (err) {
            res.status(400).json(err);
          }

          if (resp !== true) {
            res.status(500).send('Update page fail!');
          } else {
            res.json({ message: 'Book updated!' });
          }
        });
      }
    });
  },
  delete: function(req, res) {
    Book.findOneAndRemove({
      _id: req.params.id
    }, function(err, docs) {
      if (err) {
        res.send(err);
      }

      if (docs && docs.pages) {
        var length = docs.pages.length;

        for (var key = 0; key < length; key++) {
          filesLib.removeFile(docs.pages[key].image, function(resp) {});
          filesLib.removeFile(docs.pages[key].audio, function(resp) {});
        }
      }

      res.json({ message: 'Successfully deleted!' });
    });
  },
  addPage: function(req, res) {
    // save page
    let objPage = {
      _id: req.body.id,
      pName: req.body.pName,
      pNo: req.body.pNo,
      pImg: req.files.pImg,
      pAudio: req.files.pAudio,
      type: 'add page'
    };

    Book.findOne({ _id: objPage._id }, function(err, docs) {
      if (err) {
        res.status(500).send('Save page fail!');
      }

      if (docs && docs._id) {
        filesLib.savePage(objPage, function(err, resp) {
          if (err) {
            res.status(400).json(err);
          }

          if (resp !== true) {
            res.status(500).send('Save page fail!');
          } else {
            res.json({ message: 'Page created!' });
          }
        });
      } else {
        res.status(500).send('Id ' + objPage._id + ' not found!');
      }
    });
  },
  updatePage: function(req, res) {
    // save page
    let objPage = {
      _id: req.body.id,
      pName: req.body.pName,
      pNo: req.body.pNo,
      pImg: req.files.pImg,
      pAudio: req.files.pAudio,
      type: 'update page'
    };

    filesLib.savePage(objPage, function(err, resp) {
      if (err) {
        res.status(400).json(err);
      }

      if (resp !== true) {
        res.status(500).send('Update page fail!');
      } else {
        res.json({ message: 'Page updated!' });
      }
    });
  },
  deletePage: function(req, res) {
    Book.findOneAndUpdate({
      'pages._id': req.params.id,
    }, {
      '$pull': {
        pages: {
          _id: req.params.id
        }
      }
    }, {
      new: false
    }, function(err, docs) {
      if (err) {
        res.send(err);
      }

      if (docs && docs.pages) {
        var length = docs.pages.length;

        for (var key = 0; key < length; key++) {
          if (req.params.id == docs.pages[key]._id) {
            filesLib.removeFile(docs.pages[key].image, function(resp) {});
            filesLib.removeFile(docs.pages[key].audio, function(resp) {});
            break;
          }
        }
      }

      res.json({ message: 'Successfully deleted!' });
    });
  }
}

module.exports = self;
