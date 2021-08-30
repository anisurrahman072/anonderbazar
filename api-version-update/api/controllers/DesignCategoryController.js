/**
 * DesignCategoryController
 *
 * @description :: Server-side logic for managing categories
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const {asyncForEach} = require('../../libs/helper');
const {uploadImagesWithConfig} = require('../../libs/helper');
const {uploadImages} = require('../../libs/helper');
const {performance} = require('perf_hooks');

module.exports = {
  //Method called for creating category design list data
  //Model models/DesignCategory.js
  create: async (req, res) => {
    const time1 = performance.now();

    const create = async (body) => {
      try {
        const returnCategory = await DesignCategory.create(body).fetch();
        const time2 = performance.now();
        sails.log.info(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

        return res.json(200, returnCategory);
      } catch (error) {
        console.log(error);
        sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

        return res.json(400, {message: 'Something went wrong!', error});
      }
    };

    if (req.body.hasImage === 'true') {
      try {
        const uploaded = await uploadImages(req.file('image'));
        if (uploaded.length === 0) {
          return res.badRequest('No file was uploaded');
        }
        const newPath = uploaded[0].fd.split(/[\\//]+/).reverse()[0];

        req.body.image = '/' + newPath;
      } catch (err) {
        console.log('err', err);
        sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

        return res.status(400).json(err.status, {err: err});
      }
    }

    await create(req.body);
  },
  //Method called for getting all category design list with sub categories
  //Model models/DesignCategory.js
  withDesignSubcategory: async (req, res) => {
    try {
      const time1 = performance.now();


      let designCategories = await DesignCategory.find({
        deletedAt: null,
        parent_id: 0
      });

      await asyncForEach(designCategories, async _designCategory => {
        _designCategory.subCategories = await DesignCategory.find({
          parent_id: _designCategory.id,
          deletedAt: null
        });
      });

      const time2 = performance.now();
      sails.log.info(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      res.status(200).json({
        success: true,
        message: '',
        data: designCategories
      });
    } catch (error) {

      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      res.status(400).json({
        success: false,
        message: '',
        error
      });
    }
  },
  //Method called for updating category design list data
  //Model models/DesignCategory.js
  update: async (req, res) => {
    try {
      const time1 = performance.now();

      if (req.body.hasImage === 'true') {
        try {
          const uploaded = await uploadImagesWithConfig(req.file('image'), {saveAs: Date.now() + '_designcategory.jpg'});
          if (uploaded.length === 0) {
            return res.badRequest('No file was uploaded');
          }
          const newPath = uploaded[0].fd.split(/[\\//]+/).reverse()[0];
          req.body.image = '/' + newPath;

        } catch (err) {
          console.log('err', err);
          sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

          return res.json(err.status, {err: err});
        }
      }
      const designCategory = await DesignCategory.updateOne({id: req.param('id')}).set(req.body);

      const time2 = performance.now();
      sails.log.info(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.json(200, designCategory);

    } catch (error) {
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      res.status(400).json({
        success: false,
        message: '',
        error
      });
    }
  }
};
