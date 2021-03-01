/**
 * DesignController
 * @description :: Server-side logic for managing designcontroller
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const {uploadImagesWithConfig} = require('../../libs/helper');

module.exports = {
  //Method called for creating design data
  //Model models/Design.js
  create: async (req, res) => {

    try {
      if (req.body.hasImage === 'true') {
        try {
          const uploaded = await uploadImagesWithConfig(req.file('image'), {saveAs: Date.now() + '_design.jpg'});
          if (uploaded.length === 0) {
            return res.badRequest('No image was uploaded');
          }
          const newPath = uploaded[0].fd.split(/[\\//]+/).reverse()[0];
          req.body.image = '/' + newPath;

        } catch (err) {
          console.log('err', err);
          return res.json(err.status, {err: err});
        }
      }
      const design = await Design.create(req.body).fetch();
      return res.json(200, design);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: '',
        error
      });
    }
  },
  //Method called for updating design data
  //Model models/Design.js
  update: async (req, res) => {
    try {
      if (req.body.hasImage === 'true') {
        try {
          const uploaded = await uploadImagesWithConfig(req.file('image'), {saveAs: Date.now() + '_design.jpg'});
          if (uploaded.length === 0) {
            return res.badRequest('No image was uploaded');
          }
          const newPath = uploaded[0].fd.split(/[\\//]+/).reverse()[0];
          req.body.image = '/' + newPath;

        } catch (err) {
          console.log('err', err);
          return res.json(err.status, {err: err});
        }
      }
      const design = await Design.updateOne({id: req.param('id')}).set(req.body);
      return res.json(200, design);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: '',
        error
      });
    }
  },

  // destroy a row
  destroy: async (req, res) => {
    try {
      const design = await Design.updateOne({id: req.param('id')}).set({deletedAt: new Date()});
      return res.json(design);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: '',
        error
      });
    }
  },
};

