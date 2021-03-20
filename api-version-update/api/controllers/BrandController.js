/**
 * BrandController
 *
 * @description :: Server-side logic for managing brands
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const {uploadImages} = require('../../libs/helper');

module.exports = {
  // destroy a row
  destroy: async (req, res) => {
    try {
      const brand = await Brand.updateOne({id: req.param('id')}).set({deletedAt: new Date()});
      return res.json(200, brand);
    } catch (error) {
      return res.json(400, {message: 'wrong', error});
    }
  },
  // create a row
  //Method called for creating product brand
  //Model models/Brand.js
  create: async (req, res) => {
    try {
      let body = req.body;
      if (body.hasImage === 'true') {

        try {
          const uploaded = await uploadImages(req.file('image'));
          if (uploaded.length === 0) {
            return res.badRequest('No file was uploaded');
          }
          const newPath = uploaded[0].fd.split(/[\\//]+/).reverse()[0];

          body.image = '/' + newPath;
        } catch (err) {
          console.log('err', err);
          return res.json(err.status, {err: err});
        }

      }
      let stringForMakingSlug = body.name;
      stringForMakingSlug = stringForMakingSlug.replace(' ', '-');
      stringForMakingSlug = stringForMakingSlug.toLowerCase();
      body.slug = stringForMakingSlug;
      const returnBrand = await Brand.create(body).fetch();

      return res.json(200, returnBrand);

    } catch (err) {
      res.json(400, {message: 'something wrong', err});
    }
  },

  // update a row
  //Method called for updating product brand
  //Model models/Brand.js
  update: async (req, res) => {

    try {
      let body = req.body;
      if (body.hasImage === 'true') {

        try {
          const uploaded = await uploadImages(req.file('image'));
          if (uploaded.length === 0) {
            return res.badRequest('No file was uploaded');
          }
          const newPath = uploaded[0].fd.split(/[\\//]+/).reverse()[0];

          body.image = '/' + newPath;
        } catch (err) {
          console.log('err', err);
          return res.json(err.status, {err: err});
        }
      }
      let stringForMakingSlug = body.name;
      stringForMakingSlug = stringForMakingSlug.replace(' ', '-');
      stringForMakingSlug = stringForMakingSlug.toLowerCase();
      body.slug = stringForMakingSlug;
      const brand = await Brand.updateOne({id: req.param('id')}).set(body);

      return res.status(200).json(brand);

    } catch (err) {
      return res.status(400).json({message: 'Something Went Wrong', err});
    }

  },
};
