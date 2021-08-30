/**
 * CategoryController
 *
 * @description :: Server-side logic for managing categories
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const {asyncForEach} = require('../../libs/helper');
const {uploadImages} = require('../../libs/helper');
const _ = require('lodash');
const {performance} = require('perf_hooks');

module.exports = {
  removeImage: async (req, res) => {
    const time1 = performance.now();

    const type = req.param('type');
    const id = req.param('id');

    try {
      await Category.updateOne({
        id: id
      }).set({
        [type]: null
      });

      const time2 = performance.now();
      sails.log.info(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.status(201).json({
        message: true
      });
    } catch (error) {
      console.log(error);
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);
      res.status(400).json({message: 'server problem!', error});
    }

  },
  //Method called for creating category data
  //Model models/Category.js
  create: async (req, res) => {
    try {

      let body = req.body;

      try {

        if ((body.hasImage && body.hasImage === 'true') ||
          (body.hasMobileImage && body.hasMobileImage === 'true') ||
          (body.hasBannerImage && body.hasBannerImage === 'true')) {

          const uploaded = await uploadImages(req.file('image'));
          if (uploaded.length === 0) {
            return res.badRequest('No file was uploaded');
          }
          console.log('uploaded image: ', uploaded);
          const newPath = uploaded[0].fd.split(/[\\//]+/).reverse()[0];

          if (body.hasBannerImage && body.hasBannerImage === 'true' &&
            body.hasMobileImage && body.hasMobileImage === 'true' &&
            body.hasImage && body.hasImage === 'true') {

            body.image = '/' + newPath;
            if (typeof uploaded[1] !== 'undefined') {
              const newPathMobile = uploaded[1].fd.split(/[\\//]+/).reverse()[0];
              body.mobile_image = '/' + newPathMobile;
            }
            if (typeof uploaded[2] !== 'undefined') {
              const newPathBanner = uploaded[2].fd.split(/[\\//]+/).reverse()[0];
              body.banner_image = '/' + newPathBanner;
            }
          } else if (body.hasMobileImage && body.hasMobileImage === 'true' &&
            body.hasImage && body.hasImage === 'true') {

            body.image = '/' + newPath;
            if (typeof uploaded[1] !== 'undefined') {
              const newPathMobile = uploaded[1].fd.split(/[\\//]+/).reverse()[0];
              body.mobile_image = '/' + newPathMobile;
            }

          } else if (body.hasBannerImage && body.hasBannerImage === 'true' &&
            body.hasImage && body.hasImage === 'true') {

            body.image = '/' + newPath;
            if (typeof uploaded[1] !== 'undefined') {
              const newPathMobile = uploaded[1].fd.split(/[\\//]+/).reverse()[0];
              body.banner_image = '/' + newPathMobile;
            }

          } else if (body.hasBannerImage && body.hasBannerImage === 'true' &&
            body.hasMobileImage && body.hasMobileImage === 'true') {

            body.mobile_image = '/' + newPath;
            if (typeof uploaded[1] !== 'undefined') {
              const newPathMobile = uploaded[1].fd.split(/[\\//]+/).reverse()[0];
              body.banner_image = '/' + newPathMobile;
            }

          } else if (body.hasImage && body.hasImage === 'true') {
            body.image = '/' + newPath;
          } else if (body.hasMobileImage && body.hasMobileImage === 'true') {
            body.mobile_image = '/' + newPath;
          } else if (body.hasBannerImage && body.hasBannerImage === 'true') {
            body.banner_image = '/' + newPath;
          }
        }

      } catch (err) {
        console.log('err', err);
        return res.json(err.status, {err: err});
      }

      if (body.showInNav  && body.showInNav === 'true') {
        body.show_in_nav = 1;
      } else {
        body.show_in_nav = 0;
      }

      const returnCategory = await Category.create(body).fetch();

      return res.status(200).json(returnCategory);
    } catch (err) {
      console.log(err);
      res.status(400).json({message: 'server problem!', err});
    }
  },

  // Destroy function to soft delete a row based on id
  //Method called for deleting category data
  //Model models/Category.js
  destroyType: async (req, res) => {
    try {
      const category = await Category.updateOne({id: req.param('id')}).set({deletedAt: new Date()});
      return res.json(category);
    } catch (error) {
      res.json(400, {message: 'wrong', error});
    }

  },
  //Method called for deleting category data
  //Model models/Category.js
  destroyProduct: async (req, res) => {
    try {
      const category = await Category.updateOne({id: req.param('id')}).set({deletedAt: new Date()});
      return res.json(category);
    } catch (error) {
      res.json(400, {message: 'wrong', error});
    }
  },

  //Method called for getting category data
  //Model models/Category.js
  getType: async (req, res) => {
    try {
      let categories = await Category.find({
        where: {type_id: 1, deletedAt: null}
      });

      if (categories) {
        res.status(200).json(categories);
      } else {
        res.status(400).json({
          success: false
        });
      }
    } catch (error) {
      res.status(400).json(error);
    }
  },
  //Method called for getting category product data
  //Model models/Category.js
  getProduct: async (req, res) => {
    try {
      const categories = await Category.find()
        .where({type_id: 2, deletedAt: null});
      return res.json(200, categories);
    } catch (error) {
      res.status(400).json(error);
    }
  },

  //Method called for getting a category data
  //Model models/Category.js
  getSingleType: async (req, res) => {
    try {
      const category = await Category.findOne({id: req.param('id'), type_id: 1});
      return res.json(200, category);
    } catch (error) {
      res.status(400).json(error);
    }
  },
  // Method called for getting a category data
  //Model models/Category.js
  getSingleProduct: async (req, res) => {
    try {
      const category = await Category.findOne({id: req.param('id'), type_id: 2});
      return res.json(200, category);
    } catch (error) {
      res.status(400).json(error);
    }
  },
  // Creating new row in category table
  createType: async (req, res) => {
    try {
      let body = req.body;
      if (body.hasImage === 'true') {
        const uploaded = await uploadImages(req.file('image0'));
        if (uploaded.length === 0) {
          return res.badRequest('No file was uploaded');
        }
        const newPath = uploaded[0].fd.split(/[\\//]+/).reverse()[0];
        body.image = '/' + newPath;
      }

      body.type_id = 2;
      const CategoryUpload = await Category.create(body).fetch();
      return res.json(200, CategoryUpload);

    } catch (error) {
      return res.json(error.status, {message: '', error, success: false});
    }
  },
  // Creating new row in product category table
  createProduct: async (req, res) => {
    try {
      let body = req.body;
      if (body.hasImage === 'true') {
        const uploaded = await uploadImages.upload(req.file('image0'));
        if (uploaded.length === 0) {
          return res.badRequest('No file was uploaded');
        }
        const newPath = uploaded[0].fd.split(/[\\//]+/).reverse()[0];
        body.image = '/' + newPath;
        body.type_id = 1;
      } else {
        body.type_id = 2;
      }
      const created = await Category.create(body).fetch();
      return res.json(200, created);
    } catch (error) {
      return res.json(error.status, {message: '', error, success: false});
    }
  },
  //Method called for updating category
  //Model models/Category.js
  update: async (req, res) => {
    try {
      let body = req.body;

      if ((body.hasImage && body.hasImage === 'true') || (body.hasBannerImage && body.hasBannerImage === 'true') ||
        (body.hasMobileImage && body.hasMobileImage === 'true')) {
        const uploaded = await uploadImages(req.file('image'));
        if (uploaded.length === 0) {
          return res.badRequest('No file was uploaded');
        }
        console.log('uploaded image: ', uploaded);
        const newPath = uploaded[0].fd.split(/[\\//]+/).reverse()[0];
        if (body.hasBannerImage && body.hasBannerImage === 'true' && body.hasImage && body.hasImage === 'true'
          && body.hasMobileImage && body.hasMobileImage === 'true') {

          body.image = '/' + newPath;
          if (typeof uploaded[1] !== 'undefined') {
            const newPathMobile = uploaded[1].fd.split(/[\\//]+/).reverse()[0];
            body.mobile_image = '/' + newPathMobile;
          }

          if (typeof uploaded[2] !== 'undefined') {
            const newPathBanner = uploaded[2].fd.split(/[\\//]+/).reverse()[0];
            body.banner_image = '/' + newPathBanner;
          }
        } else if (body.hasMobileImage && body.hasMobileImage === 'true' &&
          body.hasImage && body.hasImage === 'true') {

          body.image = '/' + newPath;
          if (typeof uploaded[1] !== 'undefined') {
            const newPathMobile = uploaded[1].fd.split(/[\\//]+/).reverse()[0];
            body.mobile_image = '/' + newPathMobile;
          }

        } else if (body.hasBannerImage && body.hasBannerImage === 'true' &&
          body.hasImage && body.hasImage === 'true') {

          body.image = '/' + newPath;
          if (typeof uploaded[1] !== 'undefined') {
            const newPathMobile = uploaded[1].fd.split(/[\\//]+/).reverse()[0];
            body.banner_image = '/' + newPathMobile;
          }

        } else if (body.hasBannerImage && body.hasBannerImage === 'true' &&
          body.hasMobileImage && body.hasMobileImage === 'true') {

          body.mobile_image = '/' + newPath;
          if (typeof uploaded[1] !== 'undefined') {
            const newPathMobile = uploaded[1].fd.split(/[\\//]+/).reverse()[0];
            body.banner_image = '/' + newPathMobile;
          }

        } else if (body.hasImage && body.hasImage === 'true') {
          body.image = '/' + newPath;
        } else if (body.hasMobileImage && body.hasMobileImage === 'true') {
          body.mobile_image = '/' + newPath;
        } else if (body.hasBannerImage && body.hasBannerImage === 'true') {
          body.banner_image = '/' + newPath;
        }
      }

      if (body.showInNav && body.showInNav === 'true') {
        body.show_in_nav = 1;
      } else {
        body.show_in_nav = 0;
      }

      const updateCategory = await Category.updateOne({id: req.param('id')}).set(body);
      return res.status(200).json(updateCategory);
    } catch (error) {
      console.log(error);
      return res.status(500).json({message: '', error, success: false});
    }
  },
  //Method called for updating category type
  //Model models/Category.js
  updateType: async (req, res) => {
    let body = req.body;
    try {
      if (req.body.hasImage === 'true') {
        const uploaded = await uploadImages.upload(req.file('image0'));
        if (uploaded.length === 0) {
          return res.badRequest('No file was uploaded');
        }
        const newPath = uploaded[0].fd.split(/[\\//]+/).reverse()[0];
        body.image = '/' + newPath;
        body.type_id = 1;
      }
      const udpated = await Category.updateOne({
        id: req.param('id')
      }).set(body);

      return res.status(200).json(udpated);
    } catch (error) {
      return res.status(error.status).json({message: '', error, success: false});
    }
  },
  //Method called for updating category product
  //Model models/Category.js
  updateProduct: async (req, res) => {
    try {
      let body = req.body;
      if (body.hasImage === 'true') {
        const uploaded = await uploadImages.upload(req.file('image0'));
        if (uploaded.length === 0) {
          return res.badRequest('No file was uploaded');
        }
        const newPath = uploaded[0].fd.split(/[\\//]+/).reverse()[0];
        body.image = '/' + newPath;
        body.type_id = 2;
      }
      const udpated = await Category.updateOne({
        id: req.param('id')
      }).set(body);

      return res.status(200).json(udpated);
    } catch (error) {
      return res.status(error.status).json({message: '', error, success: false});
    }
  },


  allCategories: async (req, res) => {
    try {
      const time1 = performance.now();

      let categories = await Category.find({deletedAt: null, parent_id: 0, type_id: 2, show_in_nav: 1}).populate('offer_id');

      const time2 = performance.now();
      sails.log.info(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.json(categories);
    } catch (error) {
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);
      return res.status(error.status).json({message: '', error, success: false});
    }
  },

  //Method called for getting a category with subcategories data
  //Model models/Category.js
  withSubcategories: async (req, res) => {
    try {
      let categories = await Category.find({deletedAt: null, parent_id: 0, type_id: 2})
        .populate('offer_id');

      let allCategories = await Promise.all(categories.map(async (item) => {
        item.subCategories = await Category.find({deletedAt: null, parent_id: item.id});
        return item;
      }));

      return res.json(allCategories);
    } catch (error) {
      return res.status(error.status).json({message: '', error, success: false});
    }
  },

  //Method called for getting a category with subcategories data
  //Model models/Category.js
  withSubcategoriesV2: async (req, res) => {
    try {
      let categories = await Category.find({deletedAt: null, parent_id: 0, type_id: 2});

      const parentCategoryIds = categories.map((cat) => cat.id);

      const allSubCategories = await Category.find({deletedAt: null, parent_id: parentCategoryIds, type_id: 2});
      const subCategoryIndexes = _.groupBy(allSubCategories, 'parent_id');

      const allSubCategoriesIds = allSubCategories.map((cat) => cat.id);
      const allSubSubCategories = await Category.find({deletedAt: null, parent_id: allSubCategoriesIds, type_id: 2});
      const subSubCategoryIndexes = _.groupBy(allSubSubCategories, 'parent_id');

      const allCategories = _.merge(subCategoryIndexes, subSubCategoryIndexes);
      return res.json(allCategories);
    } catch (error) {
      return res.status(error.status).json({message: '', error, success: false});
    }
  },

  //Method called for getting a product category with subcategories data
  //Model models/Category.js
  withProductSubcategory: async (req, res) => {
    try {
      let categories = await Category.find({
        type_id: 2,
        deletedAt: null,
        parent_id: 0
      });
      await asyncForEach(categories, async _category => {
        _category.subCategories = await Category.find({
          type_id: 2,
          parent_id: _category.id,
          deletedAt: null
        });
      });

      return res.status(200).json({
        success: true,
        message: 'product category with subcategory',
        data: categories
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: '',
        error
      });
    }
  }
};
