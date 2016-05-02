'use strict';

var mongoose = require('mongoose');
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs-extra'));
var path = require('path');

var Book = require('../schemas/book');

function createFile(obj, callback) {
  if (obj.file && obj.file != '' && obj.file.path) {

    if (obj.old) {
      // call function remove file!
      removeFile(obj.old, function(resRemove) {});
    }

    let typeImg = path.extname(obj.file.path);
    let tempImg = obj.file.path;
    let saveImg = '/uploads/' + obj.type + '/' + obj._id + '_' + obj.key + '' + typeImg;
    let targetImg = path.join(__dirname, '../..' + saveImg);

    let is = fs.createReadStream(tempImg);
    let os = fs.createWriteStream(targetImg);
    is.pipe(os);

    fs.copySync(tempImg, targetImg, function(err) {
      if (err) {
        // console.log(err);
      }

      callback(saveImg);
    });
  } else {
    callback(false);
  }
}

function removeFile(file, callback) {
  if (file && file != '') {
    let targetFile = path.join(__dirname, '../..' + file);
    fs.unlink('.' + file, function(err) {
      if (err) {
        console.log(err);
      }

      callback(true);
    })
  } else {
    callback(true);
  }
}

function findBook(obj, callback) {
  Book.findById(obj._id, function(err, docs) {
    if (err) {
      callback(false);
    }

    callback(docs);
  });
}

function addFilePage(obj, resBook, callback) {
  var objArray = [];
  var oldFile = {};
  var no = 0;
  var length = obj.pName.length || Object.keys(obj.pName).length;

  for (var key in obj.pName) {

    let pageId = key;
    oldFile = { image: '', audio: '' };

    // if key is integer
    if (key == parseInt(key, 10)) {
      pageId = mongoose.Types.ObjectId();
      // if key is mongo _id
    } else {
      pageId = key;
      let keyP = resBook.pages.map(function(e) {
        return '' + e._id;
      }).indexOf(pageId);

      if (keyP > -1) {
        oldFile = {
          image: resBook.pages[keyP].image,
          audio: resBook.pages[keyP].audio
        }
      }
    }

    let objValue = {
      _id: pageId,
      name: obj.pName[key],
      no: obj.pNo[key],
    };

    let objFile = {
      _id: obj._id,
      file: obj.pImg[key],
      key: pageId,
      type: 'image'
    }

    createFile(objFile, function(resImg) {
      if (resImg) {
        objValue.image = resImg;
      } else {
        if (oldFile.image) {
          objValue.image = oldFile.image;
        }
      }
    });

    objFile.file = obj.pAudio[key];
    objFile.type = 'audio';

    createFile(objFile, function(resAudio) {
      if (resAudio) {
        objValue.audio = resAudio;
      } else {
        if (oldFile.audio) {
          objValue.audio = oldFile.audio;
        }
      }

      objArray.push(objValue);

      if (++no === length) {
        // add or edit book
        if (obj.type === 'book') {
          objArray.sort(function(a, b) {
            return (a.no > b.no) ? 1 : ((b.no > a.no) ? -1 : 0);
          });

          Book.findOneAndUpdate({ _id: obj._id }, { pages: objArray, updatedAt: new Date() }, { new: true },
            function(err, docs) {
              if (err) {
                callback(err);
              }

              callback(true);
            });
        } else if (obj.type === 'add page') {
          Book.findOneAndUpdate({ _id: obj._id }, {
              $push: {
                pages: {
                  $each: objArray,
                  $sort: { no: 1 }
                }
              },
              updatedAt: new Date()
            }, { new: true },
            function(err, docs) {
              if (err) {
                callback(err);
              }

              callback(true);
            });
        } else if (obj.type === 'update page') {
          objArray._id = pageId;

          Book.findOneAndUpdate({ _id: obj._id, 'pages._id': pageId }, {
              $pull: {
                pages: { _id: pageId }
              }
            }, { new: true },
            function(err, docs) {
              if (err) {
                callback(err);
              }

              Book.findOneAndUpdate({ _id: obj._id }, {
                  $push: {
                    pages: {
                      $each: objArray,
                      $sort: { no: 1 }
                    }
                  },
                  updatedAt: new Date()
                }, { new: true },
                function(err, docs) {
                  if (err) {
                    callback(err);
                  }

                  callback(true);
                });
            });
        } else {
          callback(false);
        }
      }
    });
  }
}

// function savePage
function savePage(obj, callback) {
  findBook(obj, function(resBook) {
    addFilePage(obj, resBook, function(resFile) {
      callback(resFile);
    });
  });
}

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

        savePage(objPage, function(resp) {
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

        savePage(objPage, function(resp) {
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
          removeFile(docs.pages[key].image, function(resp) {});
          removeFile(docs.pages[key].audio, function(resp) {});
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
        savePage(objPage, function(resp) {
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

    savePage(objPage, function(resp) {
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
            removeFile(docs.pages[key].image, function(resp) {});
            removeFile(docs.pages[key].audio, function(resp) {});
            break;
          }
        }
      }

      res.json({ message: 'Successfully deleted!' });
    });
  }
}

module.exports = self;
