const {
  asyncForEach,
  Helper,
  initLogPlaceholder,
  pagination,
  uploadImgAsync
} = require('../../libs');
const fs = require('fs');
const _ = require('lodash');
const {imageUploadConfig} = require('../../libs/helper');

module.exports = {
  //Method called for getting all design image list data
  //Model models/DesignImage.js
  getAll: async (req, res) => {
    try {
      initLogPlaceholder(req, 'brand');

      let _pagination = pagination(req.query);

      /* WHERE condition for .......START.....................*/
      let _where = {};
      _where.deletedAt = null;

      if (req.token) {
        _where.warehouse_id = req.token.userInfo.warehouse_id.id;
      }
      if (req.query.warehouse_id) {
        _where.warehouse_id = req.query.warehouse_id;
      }

      if (req.query.search_term) {

        _where.or = [
          {
            name: {
              like: `%${req.query.search_term}%`
            }
          }
        ];
      }
      /* WHERE condition..........END................*/

      /*sort................*/
      let _sort = {};
      if (req.query.sortName) {
        _sort.name = req.query.sortName;
      }

      if (req.query.sortCode) {
        _sort.code = req.query.sortCode;
      }

      if (req.query.sortSlug) {
        _sort.slug = req.query.sortSlug;
      }
      /*.....SORT END..............................*/

      let totalDesignImage = await DesignImage.count().where(_where);
      _pagination.limit = _pagination.limit || totalDesignImage;
      let designImageList = await DesignImage.find({
        where: _where,
        limit: _pagination.limit,
        skip: _pagination.skip,
        sort: _sort
      })
        .populate('product_id')
        .populate('warehouse_id');

      res.status(200).json({
        success: true,
        total: totalDesignImage,
        limit: _pagination.limit,
        skip: _pagination.skip,
        page: _pagination.page,
        message: 'Get All designImage with pagination',
        data: designImageList
      });
    } catch (error) {
      let message = 'Error in Get All designImage with pagination';
      res.status(400).json({
        success: false,
        message
      });
    }
  },
  //Method called for getting a design image data
  //Model models/DesignImage.js
  findOne: async (req, res) => {
    try {
      initLogPlaceholder(req, 'designImage findOne');

      let designImage = await DesignImage.findOne({
        where: {
          id: req.params._id
        }
      });

      res.status(200).json({
        success: true,
        message: 'read single designImage',
        data: designImage
      });
    } catch (error) {
      let message = 'error in read single designImage';
      res.status(400).json({
        success: false,
        message
      });
    }
  },
  //Method called for creating design image data
  //Model models/DesignImage.js
  create: async (req, res) => {
    async function createDesignImage(body) {
      try {
        return res.json(200, await DesignImage.create(body));
      } catch (error) {
        return res.json(err.status, {
          err: err
        });
      }
    }

    if (req.body.hasImage === 'true') {
      let newImages = [];

      // for (let i = 0; i < req.body.oldImages.length; i++) {}

      const uploadConfig = imageUploadConfig();
      for (let i = 0; i < req.body.newImageCounter; i++) {
        let tempImg = await uploadImgAsync(req.file('image' + i), {
          ...uploadConfig,
          saveAs: Date.now() + '_brand.jpg'
        });
        let newPath = '/' + tempImg[0].fd.split(/[\\//]+/).reverse()[0];
        newImages.push(newPath);
      }

      req.body.images = newImages;
      createDesignImage(req.body);
    } else {
    }
  },
  //Method called for getting all design image list data by product id
  //Model models/DesignImage.js
  getAllByProductId: async (req, res) => {
    try {
      initLogPlaceholder(req, 'designCombination');

      let productId = req.params._id;
      let productDesignData = await ProductDesign.find({
        where: {
          product_id: req.params._id,
          deletedAt: null
        }
      })
        .populate('product_id')
        .populate('warehouse_id');

      let result = _.chain(productDesignData)
        .groupBy('part_id.id')
        .map((v, i) => {
          return {
            part: _.get(_.find(v, 'part_id'), 'part_id'),
            designs: _.map(v, 'design_id')
          };
        })
        .value();

      res.status(200).json({
        success: true,
        message: 'get from product designCombination',
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'error from designCombination'
      });
    }
  },
  //Method called for getting single design image combination data
  //Model models/DesignImage.js
  getSingleDesignCombinationImage: async (req, res) => {
    try {
      initLogPlaceholder(req, 'getSingleDesignCombinationImage');

      let designImageData = await DesignImage.findOne({
        where: {
          product_id: req.params._id,
          deletedAt: null,
          combination: req.query.combination
        }
      });

      res.status(200).json({
        success: true,
        message: 'get design image by designCombination',
        data: designImageData
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'error in get design image by designCombination'
      });
    }
  },
  //Method called for updating design image by product id
  //Model models/DesignImage.js
  updateByProductId: async (req, res) => {
    try {
      initLogPlaceholder(req, 'updateByProductId');

      let warehouseId = req.token.userInfo.warehouse_id.id;

      let productDesignData = await DesignImage.findOne({
        where: {
          product_id: req.params._id,
          deletedAt: null,
          combination: req.body.combination
        }
      });

      let oldImages = JSON.parse(req.body.oldImages);
      oldImages = oldImages.map(m => '/images/' + m);

      let newImages = [];

      if (req.body.hasImage === 'true') {
        const uploadConfig = imageUploadConfig();
        for (let i = 0; i < parseInt(req.body.newImageCounter); i++) {
          let tempImg = await uploadImgAsync(req.file('image' + i), {
            ...uploadConfig,
            saveAs: Date.now() + '_design.jpg'
          });
          let newPath =
            '/' + tempImg[0].fd.split(/[\\//]+/).reverse()[0];
          newImages.push(newPath);
        }
      }

      if (productDesignData) {
        /*already have..........................................*/

        let updated = await DesignImage.update(
          {id: productDesignData.id},
          {
            images: [...oldImages, ...newImages]
          }
        );
        res.status(200).json({
          success: true,
          data: updated[0]
        });
        let d = productDesignData.images.filter(p => !oldImages.includes(p));
        Helper.deleteImages(d, '');
      } else {
        let newData = await DesignImage.create({
          product_id: req.params._id,
          combination: req.body.combination,
          images: newImages,
          warehouse_id: warehouseId
        });
        res.status(200).json({
          success: true,
          message: 'get from designImages updateByProductId',
          data: newData
        });
      }
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'error from designimages updateByProductId'
      });
    }
  }
};
//Method called for deleting design image
//Model models/DesignImage.js
const deleteImages1 = async (imageList, path) => {
  asyncForEach(imageList, item => {
    let dir = __dirname.split('/api');
    let assestsdir = dir[0] + '/assets';

    try {
      fs.unlinkSync(assestsdir + item);
    } catch (err) {
    }
  });
};
