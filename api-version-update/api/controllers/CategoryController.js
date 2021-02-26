const {asyncForEach, initLogPlaceholder} = require('../../libs');
const {imageUploadConfig} = require('../../libs/helper');
/**
 * CategoryController
 *
 * @description :: Server-side logic for managing categories
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
module.exports = {
  //Method called for creating category data
  //Model models/Category.js
  create: function (req, res) {
    try {
      if (req.body.hasImage === 'true') {
        let imageCounter = 1;
        let i;
        let body;
        let body1;
        req.file('image0').upload(imageUploadConfig(), (err, files) => {
          // maxBytes: 10000000;
          if (err) {
            return res.serverError(err);
          }
          var newPath = files[0].fd.split(/[\\//]+/).reverse()[0];
          body = req.body;
          body.image = '/' + newPath;
          Category.create(body).exec((err, returnCategory) => {
            if (err) {
              return res.json(err.status, {err: err});
            }
            if (returnCategory) {
              res.json(200, returnCategory);
            }
          });
        });

      } else {
        Category.create(req.body).exec((err, returnCategory) => {
          if (err) {
            return res.json(err.status, {err: err});
          }
          if (returnCategory) {
            res.json(200, returnCategory);
          }
        });
      }
    } catch (err) {
      res.json(400, {message: 'wrong'});
    }
  },

  // Destroy function to soft delete a row based on id
  //Method called for deleting category data
  //Model models/Category.js
  destroyType: function (req, res) {
    Category.update({id: req.param('id')}, {deletedAt: new Date()}).exec(
      (err, user) => {
        if (err) {
          return res.json(err, 400);
        }
        return res.json(user[0]);
      }
    );
  },
  //Method called for deleting category data
  //Model models/Category.js
  destroyProduct: function (req, res) {
    Category.update({id: req.param('id')}, {deletedAt: new Date()}).exec(
      (err, user) => {
        if (err) {
          return res.json(err, 400);
        }
        return res.json(user[0]);
      }
    );
  },

  //Method called for getting category data
  //Model models/Category.js
  getType: async (req, res) => {
    try {
      let category = await Category.find({
        where: {type_id: 1, deletedAt: null}
      });

      if (category) {
        res.status(200).json(category);
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
  getProduct: function (req, res) {
    Category.find()
      .where({type_id: 2, deletedAt: null})
      .then((categoryProducts) => {
        res.json(200, categoryProducts);
      });
  },

  //Method called for getting a category data
  //Model models/Category.js
  getSingleType: function (req, res) {
    Category.findOne()
      .where({id: req.param('id'), type_id: 1})
      .then((categoryType) => {
        res.json(200, categoryType);
      });
  },
  // Method called for getting a category data
  //Model models/Category.js
  getSingleProduct: function (req, res) {
    Category.findOne()
      .where({id: req.param('id'), type_id: 2})
      .then((categoryProduct) => {
        res.json(200, categoryProduct);
      });
  },
  // Creating new row in category table
  createType: function (req, res) {

    try {
      if (req.body.hasImage === 'true') {
        let imageCounter = 1;
        let i;
        let body;
        req.file('image0').upload(imageUploadConfig(), (err, files) => {
          // maxBytes: 10000000;
          if (err) {
            return res.serverError(err);
          }
          var newPath = files[0].fd.split(/[\\//]+/).reverse()[0];
          body = req.body;
          body.image = '/' + newPath;
          body.type_id = 1;

          Category.create(body).exec((err, returnCategory) => {
            if (err) {
              return res.json(err.status, {err: err});
            }
            if (returnCategory) {
              res.json(200, returnCategory);
            }
          });
        });

      } else {
        let body = req.body;
        body.type_id = 1;
        Category.create(body).exec((err, returnCategory) => {
          if (err) {
            return res.json(err.status, {err: err});
          }
          if (returnCategory) {
            res.json(200, returnCategory);
          }
        });
      }
    } catch (err) {
      res.json(400, {message: 'wrong'});
    }
  },
  // Creating new row in product category table
  createProduct: function (req, res) {
    try {
      if (req.body.hasImage === 'true') {
        let imageCounter = 2;
        let i;
        let body;
        req.file('image0').upload(imageUploadConfig(), (err, files) => {
          // maxBytes: 10000000;
          if (err) {
            return res.serverError(err);
          }
          var newPath = files[0].fd.split(/[\\//]+/).reverse()[0];
          body = req.body;
          body.image = '/' + newPath;
          body.type_id = 1;

          Category.create(body).exec((err, returnCategory) => {
            if (err) {
              return res.json(err.status, {err: err});
            }
            if (returnCategory) {
              res.json(200, returnCategory);
            }
          });
        });

      } else {
        let body = req.body;
        body.type_id = 2;
        Category.create(body).exec((err, returnCategory) => {
          if (err) {
            return res.json(err.status, {err: err});
          }
          if (returnCategory) {
            res.json(200, returnCategory);
          }
        });
      }
    } catch (err) {
      res.json(400, {message: 'wrong'});
    }
  },
  //Method called for updating category
  //Model models/Category.js
  update: function (req, res) {
    try {
      if (req.body.hasImage === 'true') {
        let imageCounter = 1;
        let i;
        let body;
        req.file('image0').upload(imageUploadConfig(), (err, files) => {
          // maxBytes: 10000000;
          if (err) {
            return res.serverError(err);
          }
          var newPath = files[0].fd.split(/[\\//]+/).reverse()[0];
          body = req.body;
          body.image = '/' + newPath;
          Category.update({id: req.param('id')}, body).exec((err, returnCategory) => {
            if (err) {
              return res.json(err.status, {err: err});
            }
            if (returnCategory) {
              res.json(200, returnCategory);
            }
          });
        });

      } else {
        let body = req.body;
        Category.update({id: req.param('id')}, body).exec((err, returnCategory) => {
          if (err) {
            return res.json(err.status, {err: err});
          }
          if (returnCategory) {
            res.json(200, returnCategory);
          }
        });
      }
    } catch (err) {
      res.json(400, {message: 'wrong'});
    }
  },
  //Method called for updating category type
  //Model models/Category.js
  updateType: function (req, res) {
    try {
      if (req.body.hasImage === 'true') {
        let imageCounter = 1;
        let i;
        let body;
        req.file('image0').upload(imageUploadConfig(), (err, files) => {
          // maxBytes: 10000000;
          if (err) {
            return res.serverError(err);
          }
          var newPath = files[0].fd.split(/[\\//]+/).reverse()[0];
          body = req.body;
          body.image = '/' + newPath;
          body.type_id = 1;

          Category.update({id: req.param('id')}, body).exec((err, returnCategory) => {
            if (err) {
              return res.json(err.status, {err: err});
            }
            if (returnCategory) {
              res.json(200, returnCategory);
            }
          });
        });

      } else {
        let body = req.body;
        body.type_id = 1;
        Category.update({id: req.param('id')}, body).exec((err, returnCategory) => {
          if (err) {
            return res.json(err.status, {err: err});
          }
          if (returnCategory) {
            res.json(200, returnCategory);
          }
        });
      }
    } catch (err) {
      res.json(400, {message: 'wrong'});
    }
  },
  //Method called for updating category product
  //Model models/Category.js
  updateProduct: function (req, res) {
    try {
      if (req.body.hasImage === 'true') {
        let imageCounter = 1;
        let i;
        let body;
        req.file('image0').upload(imageUploadConfig(), (err, files) => {
          // maxBytes: 10000000;
          if (err) {
            return res.serverError(err);
          }
          const newPath = files[0].fd.split(/[\\//]+/).reverse()[0];
          body = req.body;
          body.image = '/' + newPath;
          body.type_id = 2;

          Category.update({id: req.param('id')}, body).exec((err, returnCategory) => {
            if (err) {
              return res.json(err.status, {err: err});
            }
            if (returnCategory) {
              res.json(200, returnCategory);
            }
          });
        });

      } else {
        let body = req.body;
        body.type_id = 2;
        Category.update({id: req.param('id')}, body).exec((err, returnCategory) => {
          if (err) {
            return res.json(err.status, {err: err});
          }
          if (returnCategory) {
            res.json(200, returnCategory);
          }
        });
      }
    } catch (err) {
      res.json(400, {message: 'wrong'});
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

      res.json(allCategories);

    } catch (error) {
      res.json(400, {success: false, message: 'There was a problem!', error});
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

      res.status(200).json({
        success: true,
        message: 'product category  withsubcategory',
        data: categories
      });
    } catch (error) {

      res.status(400).json({
        success: false,
        message: '',
        error
      });
    }
  }
};
