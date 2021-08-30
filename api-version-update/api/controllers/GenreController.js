/**
 * BrandController
 *
 * @description :: Server-side logic for managing brands
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const {uploadImages} = require('../../libs/helper');
const {uploadImagesWithConfig} = require('../../libs/helper');
const {performance} = require('perf_hooks');

module.exports = {

  // destroy a row
  destroy: async (req, res) => {
    try {
      const time1 = performance.now();

      const genre = await Genre.updateOne({id: req.param('id')}).set({deletedAt: new Date()});
      const time2 = performance.now();
      sails.log.info(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.status(200).json({genre: genre});
    } catch (error) {
      console.log(error);
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      res.status(error.status).json({error: error});
    }
  },
  //Method called for creating a genre data
  //Model models/Genre.js
  create: async (req, res) => {
    try {
      const time1 = performance.now();

      if (req.body.hasImage === 'true') {
        const uploaded = await uploadImagesWithConfig(req.file('image'), {saveAs: Date.now() + '_genre.jpg'});
        if (uploaded.length === 0) {
          return res.badRequest('No files were uploaded');
        }
        let newPath = uploaded[0].fd.split(/[\\//]+/).reverse()[0];
        req.body.image = '/' + newPath;
      }
      const genre = await Genre.create(req.body).fetch();
      const time2 = performance.now();
      sails.log.info(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.status(200).json({genre: genre});
    } catch (error) {
      console.log(error);
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      res.status(error.status).json({error: error});
    }
  },

  //Method called for updating a genre data
  //Model models/Genre.js
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

      const genreUpdated = await Genre.updateOne({id: req.param('id')}).set(req.body);
      const time2 = performance.now();
      sails.log.info(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.status(200).json({
        genre: genreUpdated,
        token: jwToken.issue({id: genreUpdated.id})
      });
    } catch (error) {
      console.log(error);
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      return res.json(error.status, {error: error});
    }
  }
};

