/**
 * DesignCategoryController
 *
 * @description :: Server-side logic for managing categories
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const { initLogPlaceholder } = require('../../libs');
const {imageUploadConfig} = require('../../libs/helper');

let asyncForEach = require('../../libs').asyncForEach;

module.exports = {
  //Method called for creating category design list data
  //Model models/DesignCategory.js
  create: function(req, res) {
    function create(body) {
      DesignCategory.create(body).exec((err, returnCategory) => {
        if (err) {
          return res.json(err.status, { err: err });
        }
        if (returnCategory) {
          res.json(200, returnCategory);
        }
      });
    }

    if (req.body.hasImage === 'true') {
      const uploadConfig = imageUploadConfig();
      req.file('image').upload(
        {
          ...uploadConfig,
          saveAs: Date.now() + '_designCategory.jpg'
        },
        (err, uploaded) => {
          if (err) {
            return res.json(err.status, { err: err });
          }
          var newPath = uploaded[0].fd.split(/[\\//]+/).reverse()[0];
          if (err) {return res.serverError(err);}
          req.body.image = '/' + newPath;
          create(req.body);
        }
      );
    } else {
      create(req.body);
    }
  },
  //Method called for getting all category design list with sub categories
  //Model models/DesignCategory.js
  withDesignSubcategory: async (req, res) => {
    try {
      initLogPlaceholder(req, 'design withsubdesigncategory');

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
  update: function(req, res) {
    if (req.body.hasImage == 'true') {
      const uploadConfig = imageUploadConfig();
      req.file('image').upload(
        {
          ...uploadConfig,
          saveAs: Date.now() + '_designcategory.jpg'
        },
        (err, uploaded) => {
          if (err) {
            return res.json(err.status, { err: err });
          }
          const newPath = uploaded[0].fd.split(/[\\//]+/).reverse()[0];
          if (err) {return res.serverError(err);}
          req.body.image = '/' + newPath;
          DesignCategory.update({ id: req.param('id') }, req.body).exec(
            (err, designCategory) => {
              if (err) {return res.json(err, 400);}
              return res.json(200, designCategory);
            }
          );
        }
      );
    } else {
      DesignCategory.update({ id: req.param('id') }, req.body).exec((
        err,
        designCategory
      ) => {
        if (err) {return res.json(err, 400);}
        return res.json(200, designCategory);
      });
    }
  }
};
