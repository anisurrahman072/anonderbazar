/**
 * DesignController
 *
 * @description :: Server-side logic for managing categories
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
let asyncForEach = require("../../libs").asyncForEach;

module.exports = {
  //Method called for creating design data
  //Model models/Design.js
  create: function (req, res) {
    function create(body) {

      Design.create(body).exec(function (err, design) {

        if (err) {
          return res.json(err.status, { err: err });
        }
        if (design) {
          res.json(200, design);
        }
      });
    }

    if (req.body.hasImage === 'true') {
      req.file('image').upload({
        dirname: '../../.tmp/public/images/',
        saveAs: Date.now() + '_design.jpg'
      }, function (err, uploaded) {
        if (err) {
          return res.json(err.status, { err: err });
        }
        var newPath = uploaded[0].fd.split(/[\\//]+/).reverse()[0];
        if (err) return res.serverError(err);
        req.body.image = '/images/' + newPath;
        create(req.body);
      });
    } else {
      create(req.body);
    }
  },
  //Method called for updating design data
  //Model models/Design.js
  update: function (req, res) {
    if (req.body.hasImage == 'true') {
      req.file('image').upload({
        dirname: '../../.tmp/public/images/',
        saveAs: Date.now() + '_design.jpg'
      }, function (err, uploaded) {

        if (err) {
          return res.json(err.status, { err: err });
        }
        var newPath = uploaded[0].fd.split(/[\\//]+/).reverse()[0];
        if (err) return res.serverError(err);
        req.body.image = '/images/' + newPath;
        Design.update({ id: req.param('id') }, req.body)
          .exec(function (err, design) {
            if (err) return res.json(err, 400);
            return res.json(200, design);
          });
      });
    } else {
      Design.update({ id: req.param('id') }, req.body)
        .exec(function (err, design) {
          if (err) return res.json(err, 400);
          return res.json(200, design);
        });
    }
  },

  // destroy a row
  destroy: function (req, res) {
    Design.update({ id: req.param('id') }, { deletedAt: new Date() })
      .exec(function (err, user) {
        if (err) return res.json(err, 400);
        return res.json(user[0]);
      });
  },
};

