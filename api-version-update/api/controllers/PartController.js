/**
 * PartController
 *
 * @description :: Server-side logic for managing categories
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const {uploadImages} = require('../../libs/helper');
const {imageUploadConfig} = require('../../libs/helper');


module.exports = {
  //Method called for creating a product part data
  //Model models/Part.js
  create: async (req, res) => {
    try {
      if (req.body.hasImage === 'true') {
        const uploadConfig = imageUploadConfig();
        const uploaded = await req.file('image').upload({...uploadConfig, saveAs: Date.now() + '_part.jpg'});
        if (uploaded.length === 0) {
          return res.badRequest('No files was uploaded');
        }
        let newPath = uploaded[0].fd.split(/[\\//]+/).reverse()[0];
        req.body.image = '/' + newPath;
      }

      const part = await Part.create(req.body).fetch();
      return res.json(200, part);
    } catch (error) {
      console.log(error);
      return res.json(error.status, {error: error});
    }
  },
  //Method called for updating a product part data
  //Model models/Part.js
  update: async (req, res) => {
    try {
      if (req.body.hasImage === 'true') {
        try {
          const uploaded = await uploadImages(req.file('image'));
          if (uploaded.length === 0) {
            return res.badRequest('No file was uploaded');
          }
          let newPath = uploaded[0].fd.split(/[\\//]+/).reverse()[0];
          req.body.image = '/' + newPath;
        } catch (error) {
          console.log(error);
          return res.json(error.status, {error: error});
        }
      }
      let updatedPart = await Part.updateOne({id: req.param('id')}).set(req.body);
      return res.json(200, updatedPart);

    } catch (error) {
      console.log(error);
      res.status(400).json({
        success: false,
        message: 'Failed to update product part',
      });
    }
  },

  // destroy a row
  destroy: async (req, res) => {
    try {
      const part = await Part.updateOne({id: req.param('id')}).set({deletedAt: new Date()});
      return res.json(part);
    } catch (error) {
      console.log(error);
      res.json(error.status, {error: error});
    }
  }
};
