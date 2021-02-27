const {initLogPlaceholder, pagination, uploadImgAsync} = require('../../libs');
const {imageUploadConfig} = require('../../libs/helper');

/**
 * BrandController
 *
 * @description :: Server-side logic for managing brands
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  // destroy a row
  destroy: function (req, res) {
    Brand.update({id: req.param('id')}, {deletedAt: new Date()}).exec(
      (err, user) => {
        if (err) {
          return res.json(err, 400);
        }
        return res.json(user[0]);
      }
    );
  },
  // create a row
  //Method called for creating product brand
  //Model models/Brand.js
  create: function (req, res) {
    try {
      if (req.body.hasImage === 'true') {
        let imageCounter = 1;
        let i;
        let body; let body1;
        req.file('image').upload(imageUploadConfig(), (err, files) => {
          // maxBytes: 10000000;
          if (err) {
            return res.serverError(err);
          }
          var newPath = files[0].fd.split(/[\\//]+/).reverse()[0];
          body = req.body;
          body.image = '/' + newPath;
          Brand.create(body).exec((err, returnBrand) => {
            if (err) {
              return res.json(err.status, {err: err});
            }
            if (returnBrand) {
              res.json(200, returnBrand);
            }
          });
        });

      } else {
        Brand.create(req.body).exec((err, returnBrand) => {
          if (err) {
            return res.json(err.status, {err: err});
          }
          if (returnBrand) {
            res.json(200, returnBrand);
          }
        });
      }
    } catch (err) {
      res.json(400, {message: 'wrong'});
    }
  },

  // update a row
  //Method called for updating product brand
  //Model models/Brand.js
  update: function (req, res) {


    if (req.body.hasImage === 'true') {

      req.file('image').upload(imageUploadConfig(),
        (err, uploaded) => {
          if (err) {
            return res.json(err.status, {err: err});
          }
          const newPath = uploaded[0].fd.split(/[\\//]+/).reverse()[0];
          if (err) {
            return res.serverError(err);
          }
          req.body.image = '/' + newPath;
          Brand.update({id: req.param('id')}, req.body).exec((
            err,
            brand
          ) => {
            if (err) {
              return res.json(err.status, {err: err});
            }
            if (brand) {
              res.json(200, {
                brand: brand,
                token: jwToken.issue({id: brand.id})
              });
            }
          });
        }
      );
    } else {
      Brand.update({id: req.param('id')}, req.body).exec((
        err,
        brand
      ) => {
        if (err) {
          return res.json(err, 400);
        }
        return res.json(200, brand);
      });
    }
  },
};
