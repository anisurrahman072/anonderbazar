/**
 * ProductPhotoController
 *
 * @description :: Server-side logic for managing productphotoes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const {performance} = require('perf_hooks');

module.exports = {
  //Method called for deleting a product photo
  //Model models/ProductPhoto.js
  destroy: async (req, res) => {
    try {
      const time1 = performance.now();

      const productPhoto = await ProductPhoto.updateOne({id: req.param('id')}).set({deletedAt: new Date()});
      return res.json(200, productPhoto);
    } catch (error) {
      console.log(error);
      res.status(error.status).json({error: error});
    }
  },
  //Method called for creating a product photo
  //Model models/ProductPhoto.js
  create: async (req, res) => {
    try {
      const time1 = performance.now();

      const productPhoto = await ProductPhoto.create(req.body).fetch();
      return res.json(200, {productPhoto: productPhoto});
    }catch (error){
      console.log(error);
      res.status(error.status).json({error: error});
    }
  }
};

