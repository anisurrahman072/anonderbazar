/**
 * DesignCategoryController
 *
 * @description :: Server-side logic for managing categories
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const {uploadImagesWithConfig} = require('../../libs/helper');
const {uploadImages} = require('../../libs/helper');
let asyncForEach = require('../../libs').asyncForEach;

module.exports = {
  //Method called for creating category design list data
  //Model models/DesignCategory.js
  create: async (req, res) => {
    const create = async (body) => {
      try {
        const returnCategory = await DesignCategory.create(body).fetch();
        return res.json(200, returnCategory);
      } catch (error) {
        console.log(error);
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
        return res.status(400).json(err.status, {err: err});
      }
    }

    await create(req.body);
  },
  //Method called for getting all category design list with sub categories
  //Model models/DesignCategory.js
  withDesignSubcategory: async (req, res) => {
    try {

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

      res.status(200).json({
        success: true,
        message: '',
        data: designCategories
      });
    } catch (error) {

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
          return res.json(err.status, {err: err});
        }
      }
      const designCategory = await DesignCategory.updateOne({id: req.param('id')}).set(req.body);

      return res.json(200, designCategory);

    } catch (error) {
      res.status(400).json({
        success: false,
        message: '',
        error
      });
    }
  }
};
