'use strict';

var mongoose = require('mongoose');
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs-extra'));
var path = require('path');

var Book = require('../schemas/book');

var filesLib = {
  savePage: function(obj, callback) {
    var objThis = this;

    objThis.findBook(obj, function(error, resBook) {
      if (error) {
        callback(error, null);
      } else {
        objThis.addFilePage(obj, resBook, function(err, resFile) {
          if (err) {
            callback(err, null);
          }

          callback(null, resFile);
        });
      }
    });
  },
  findBook: function(obj, callback) {
    Book.findById(obj._id, function(err, docs) {
      if (err) {
        callback(err, false);
      } else {
        callback(null, docs);
      }
    });
  },
  addFilePage: function(obj, resBook, callback) {
    var objThis = this;
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

      objThis.createFile(objFile, function(resImg) {
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

      objThis.createFile(objFile, function(resAudio) {
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
                  callback(err, null);
                } else {
                  callback(null, true);
                }
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
                  callback(err, null);
                } else {
                  callback(null, true);
                }
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
                  callback(err, null);
                } else {
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
                        callback(err, null);
                      } else {
                        callback(null, true);
                      }
                    });
                }
              });
          } else {
            callback(null, false);
          }
        }
      });
    }
  },
  createFile: function(obj, callback) {
    if (obj.file && obj.file != '' && obj.file.path) {
      var objThis = this;

      if (obj.old) {
        // call function remove file!
        objThis.removeFile(obj.old, function(resRemove) {});
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
  },
  removeFile: function(file, callback) {
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
};

module.exports = filesLib;
