/**
 * PartController
 *
 * @description :: Server-side logic for managing categories
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const {uploadImagesWithConfig} = require('../../libs/helper');
const {uploadImages} = require('../../libs/helper');
const {performance} = require('perf_hooks');


module.exports = {
  //Method called for creating a product part data
  //Model models/Part.js
  create: async (req, res) => {
    try {
      const time1 = performance.now();

      if (req.body.hasImage === 'true') {
        const uploaded = await uploadImagesWithConfig(req.file('image'), {saveAs: Date.now() + '_part.jpg'});
        if (uploaded.length === 0) {
          return res.badRequest('No files was uploaded');
        }
        let newPath = uploaded[0].fd.split(/[\\//]+/).reverse()[0];
        req.body.image = '/' + newPath;
      }

      const part = await Part.create(req.body).fetch();
      const time2 = performance.now();
      sails.log.info(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.status(200).json({part: part});
    } catch (error) {
      console.log(error);
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      return res.json(error.status, {error: error});
    }
  },
  //Method called for updating a product part data
  //Model models/Part.js
  update: async (req, res) => {
    try {
      const time1 = performance.now();

      if (req.body.hasImage === 'true') {
        const uploaded = await uploadImages(req.file('image'));
        if (uploaded.length === 0) {
          return res.badRequest('No file was uploaded');
        }
        let newPath = uploaded[0].fd.split(/[\\//]+/).reverse()[0];
        req.body.image = '/' + newPath;
      }

      let updatedPart = await Part.updateOne({id: req.param('id')}).set(req.body);
      const time2 = performance.now();
      sails.log.info(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.json(200, updatedPart);

    } catch (error) {
      console.log(error);
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      res.status(400).json({
        success: false,
        message: 'Failed to update product part',
      });
    }
  },

  // destroy a row
  destroy: async (req, res) => {
    try {
      const time1 = performance.now();

      const part = await Part.updateOne({id: req.param('id')}).set({deletedAt: new Date()});
      const time2 = performance.now();
      sails.log.info(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.json(part);
    } catch (error) {
      console.log(error);
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      res.json(error.status, {error: error});
    }
  }
};
