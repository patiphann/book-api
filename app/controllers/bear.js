'use strict';

var Bear = require('../schemas/bear');

var self = {
  findAll: function(req, res) {
    Bear.find(function(err, bears) {
      if (err) {
        res.send(err);
      }

      res.json(bears);
    });
  },
  findOne: function(req, res) {
    Bear.findById(req.params.bear_id, function(err, bear) {
      if (err) {
        res.send(err);
      }

      res.json(bear);
    });
  },
  save: function(req, res) {
    var bear = new Bear(); // create a new instance of the Bear model
    bear.name = req.body.name; // set the bears name (comes from the request)

    // save
    bear.save(function(err) {
      if (err) {
        res.send(err);
      }

      res.json({ message: 'Bear created!' });
    });
  },
  update: function(req, res) {
    Bear.findByIdAndUpdate(req.params.bear_id, req.body, { new: true }, function(err, docs) {
      if (err) {
        res.send(err);
      }

      res.json({ message: 'Bear updated!' });
    });
  },
  delete: function(req, res) {
    Bear.remove({
      _id: req.params.bear_id
    }, function(err, bear) {
      if (err){
        res.send(err);
      }

      res.json({ message: 'Successfully deleted' });
    });
  }
}

module.exports = self;
