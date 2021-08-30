/**
 * BrandController
 *
 * @description :: Server-side logic for managing brands
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const {uploadImages} = require('../../libs/helper');
const {performance} = require('perf_hooks');

module.exports = {
  // get all brands
  getAll: async (req, res) => {
    try {
      const time1 = performance.now();

      let defaultQuery = {
        deletedAt: null
      };
      if (req.query.skip && req.query.take) {
        defaultQuery = {where: defaultQuery, skip: req.query.skip, limit: req.query.take };
      }
      let allBrands = await Brand.find(defaultQuery).sort([
        {frontend_position: 'ASC'}
      ]);

      const time2 = performance.now();
      sails.log.info(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.status(200).json(allBrands);
    }
    catch (error){
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      return res.status(400).json({
        success: false,
        message: error
      });
    }
  },

  // destroy a row
  destroy: async (req, res) => {
    try {
      const time1 = performance.now();

      const brand = await Brand.updateOne({id: req.param('id')}).set({deletedAt: new Date()});
      const time2 = performance.now();
      sails.log.info(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.json(200, brand);
    } catch (error) {
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      return res.json(400, {message: 'wrong', error});
    }
  },
  // create a row
  //Method called for creating product brand
  //Model models/Brand.js
  create: async (req, res) => {
    const authUser = req.token.userInfo;
    const isVendor = authUser.group_id.name === 'owner';
    try {
      const time1 = performance.now();

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
      if (isVendor && authUser.warehouse_id && authUser.warehouse_id.id) {
        body.warehouse_id = authUser.warehouse_id.id;
      }
      let stringForMakingSlug = body.name;
      stringForMakingSlug = stringForMakingSlug.replace(' ', '-');
      stringForMakingSlug = stringForMakingSlug.toLowerCase();
      body.slug = stringForMakingSlug;
      const returnBrand = await Brand.create(body).fetch();

      const time2 = performance.now();
      sails.log.info(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.json(200, returnBrand);

    } catch (err) {
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      res.json(400, {message: 'something wrong', err});
    }
  },

  // update a row
  //Method called for updating product brand
  //Model models/Brand.js
  update: async (req, res) => {

    try {
      const time1 = performance.now();

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

      const time2 = performance.now();
      sails.log.info(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.status(200).json(brand);

    } catch (err) {
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      return res.status(400).json({message: 'Something Went Wrong', err});
    }
  },
  uniqueCheckName: async (req, res) => {
    try {
      const time1 = performance.now();

      const ignoreId = parseInt(req.body.ignore_id, 10);
      const where = {
        name: req.param('name')
      };

      if(ignoreId){
        where.id = { '!=': ignoreId };
      }

      console.log(where, ignoreId);
      let exists = await Brand.find(where);

      const time2 = performance.now();
      sails.log.info(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      if (exists && exists.length > 0) {
        return res.status(200).json({isunique: false});
      } else {
        return res.status(200).json({isunique: true});
      }
    } catch (error) {
      console.log(error);
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      return res.status(400).json({isunique: true});
    }
  }
};
