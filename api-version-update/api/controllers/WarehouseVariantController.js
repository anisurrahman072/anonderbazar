/**
 * WarehouseVariantController
 *
 * @description :: Server-side logic for managing variant
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const {uploadImagesWithConfig} = require('../../libs/helper');
const {uploadImages} = require('../../libs/helper');
const {imageUploadConfig} = require('../../libs/helper');

module.exports = {
  //Method called for deleting a warehouse variant data
  //Model models/WarehouseVariant.js
  destroy: async (req, res) => {
    try {
      const user = await WarehouseVariant.updateOne({id: req.param('id')}).set({deletedAt: new Date()});
      return res.json(user[0]);
    } catch (error) {
      return res.status(400).json(error);
    }
  },
  //Method called for creating a warehouse variant data
  //Model models/WarehouseVariant.js
  create: async (req, res) => {
    try {
      if (req.body.hasImage === 'true') {
        const uploadConfig = imageUploadConfig();
        let tempImg = await uploadImagesWithConfig(req.file('image'), {
          ...uploadConfig,
          saveAs: Date.now() + '_warehouse_variant.jpg'
        });

        if (tempImg.length === 0) {
          return res.badRequest('No file was uploaded');
        }
        req.body.image = '/' + tempImg[0].fd.split(/[\\//]+/).reverse()[0];

        let warehouseVariant = await WarehouseVariant.create(req.body).fetch();
        return res.json(200, warehouseVariant);
      } else {
        let warehouseVariant = await WarehouseVariant.create(req.body).fetch();

        return res.json(200, warehouseVariant);
      }
    } catch (err) {
      console.log(err);
      res.json(400, {success: false, message: 'wrong', err});
    }
  },

  //Method called for updating a warehouse variant data
  //Model models/WarehouseVariant.js
  update: async (req, res) => {
    try {
      if (req.body.hasImage === 'true') {
        const uploaded = await uploadImages(req.file('image'));
        if (uploaded.length === 0) {
          return res.badRequest('No file was uploaded');
        }
        const newPath = uploaded[0].fd.split(/[\\//]+/).reverse()[0];
        req.body.image = '/' + newPath;
      }
      const warehouseVariant = await WarehouseVariant.updateOne({id: req.param('id')}).set(req.body);
      return res.json(200, warehouseVariant);
    } catch (error) {
      return res.json(error.status, {message: '', error, success: false});
    }
  }
};
