/**
 * DesignController
 * @description :: Server-side logic for managing designcontroller
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const {uploadImagesWithConfig} = require('../../libs/helper');
const {performance} = require('perf_hooks');

module.exports = {
  //Method called for creating design data
  //Model models/Design.js
  create: async (req, res) => {

    try {
      const time1 = performance.now();

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
          sails.log.error(`Request Uri: ${req.path} ########## ${err}`);

          return res.json(err.status, {err: err});
        }
      }
      const design = await Design.create(req.body).fetch();
      const time2 = performance.now();
      sails.log.info(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.json(200, design);
    } catch (error) {
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

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
      const time1 = performance.now();

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
          sails.log.error(`Request Uri: ${req.path} ########## ${err}`);

          return res.json(err.status, {err: err});
        }
      }
      const design = await Design.updateOne({id: req.param('id')}).set(req.body);
      const time2 = performance.now();
      sails.log.info(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.json(200, design);
    } catch (error) {
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

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
      const time1 = performance.now();

      const design = await Design.updateOne({id: req.param('id')}).set({deletedAt: new Date()});
      const time2 = performance.now();
      sails.log.info(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.json(design);
    } catch (error) {
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      res.status(400).json({
        success: false,
        message: '',
        error
      });
    }
  },
};

