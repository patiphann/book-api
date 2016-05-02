'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BookSchema = new Schema({
  name: {
    type: String,
    trim: true,
    index: true,
    unique: true,
    required: [true, 'Book name is required']
  },
  pages: [{
    name: {
      type: String,
      trim: true,
      required: [true, 'Page name is required']
    },
    image: {
      type: String,
      trim: true,
      default: 'default.jpg'
    },
    audio: {
      type: String,
      trim: true,
      required: 'default.mp3'
    },
    no: {
      type: Number
    }
  }],
  by: Schema.ObjectId,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { collection: 'book' });

module.exports = mongoose.model('Book', BookSchema);
