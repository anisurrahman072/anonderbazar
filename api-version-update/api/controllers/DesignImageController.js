const _ = require('lodash');
const {Helper} = require('../../libs/HelperClass');
const {pagination} = require('../../libs/pagination');
const {uploadImagesWithConfig} = require('../../libs/helper');
const {imageUploadConfig} = require('../../libs/helper');

module.exports = {
  //Method called for getting all design image list data
  //Model models/DesignImage.js
  getAll: async (req, res) => {
    try {
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
      console.log(error);
      let message = 'Error in Get All designImage with pagination';
      res.status(400).json({
        success: false,
        message,
        error
      });
    }
  },
  //Method called for getting a design image data
  //Model models/DesignImage.js
  findOne: async (req, res) => {
    try {
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
      console.log(error);
      let message = 'error in read single designImage';
      res.status(400).json({
        success: false,
        message,
        error
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
        console.log(error);
        return res.json(err.status, {
          error
        });
      }
    }

    if (req.body.hasImage === 'true') {
      let newImages = [];
      const uploadConfig = imageUploadConfig();
      for (let i = 0; i < req.body.newImageCounter; i++) {
        let tempImg = await uploadImagesWithConfig(req.file('image' + i), {
          ...uploadConfig,
          saveAs: Date.now() + i.toString() + '_brand.jpg'
        });
        if (tempImg.length === 0) {
          return res.badRequest('No file was uploaded');
        }
        let newPath = '/' + tempImg[0].fd.split(/[\\//]+/).reverse()[0];
        newImages.push(newPath);
      }

      req.body.images = newImages;

    }

    await createDesignImage(req.body);
  },
  //Method called for getting all design image list data by product id
  //Model models/DesignImage.js
  getAllByProductId: async (req, res) => {
    try {

      let productId = req.params._id;
      let productDesignData = await ProductDesign.find({
        where: {
          product_id: productId,
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
      console.log(error);
      res.status(400).json({
        success: false,
        message: 'error from designCombination',
        error
      });
    }
  },
  //Method called for getting single design image combination data
  //Model models/DesignImage.js
  getSingleDesignCombinationImage: async (req, res) => {
    try {
      let designImageData = await DesignImage.findOne({
        where: {
          product_id: req.params._id,
          deletedAt: null,
          combination: req.query.combination
        }
      });

      return res.status(200).json({
        success: true,
        message: 'get design image by designCombination',
        data: designImageData
      });
    } catch (error) {
      console.log(error);
      return res.status(400).json({
        success: false,
        message: 'error in get design image by designCombination',
        error
      });
    }
  },
  //Method called for updating design image by product id
  //Model models/DesignImage.js
  updateByProductId: async (req, res) => {
    try {

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
          let tempImg = await uploadImagesWithConfig(req.file('image' + i), {
            ...uploadConfig,
            saveAs: Date.now() + '_design.jpg'
          });
          if (tempImg.length === 0) {
            return res.badRequest('No file was uploaded');
          }
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
        ).fetch();

        try {
          let d = productDesignData.images.filter(p => !oldImages.includes(p));
          await Helper.deleteImages(d, '');
        } catch (error1) {
          console.log(error1);
        }

        return res.status(200).json({
          success: true,
          data: updated[0]
        });

      } else {
        let newData = await DesignImage.create({
          product_id: req.params._id,
          combination: req.body.combination,
          images: newImages,
          warehouse_id: warehouseId
        }).fetch();

        return res.status(200).json({
          success: true,
          message: 'get from designImages updateByProductId',
          data: newData
        });
      }
    } catch (error) {
      console.log(error);
      res.status(400).json({
        success: false,
        message: 'error from designimages updateByProductId',
        error
      });
    }
  }
};

