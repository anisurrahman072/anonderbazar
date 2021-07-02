/**
 * OfferController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const {imageUploadConfig} = require('../../libs/helper');
const {pagination} = require('../../libs/pagination');
const OfferService = require('../services/OfferService');
const moment = require('moment');

module.exports = {
  /**Method for getting all the shop, brand and category */
  getAllOptions: async (req, res) => {
    try {
      /**checking if the options have the offer time or not*/
      await OfferService.offerDurationCheck();

      let allOptions;
      if (req.query.offerSelectionType && req.query.offerSelectionType === 'Vendor wise') {
        /*let rawSQL = `SELECT warehouses.id, warehouses.name FROM warehouses  LEFT JOIN offers ON warehouses.id = offers.vendor_id
              WHERE warehouses.deleted_at IS NULL AND (offers.deleted_at IS NOT NULL OR offers.vendor_id IS NULL) `;
        allOptions = await sails.sendNativeQuery(rawSQL, []);*/

        allOptions = await Warehouse.find({deletedAt: null});
      } else if (req.query.offerSelectionType && req.query.offerSelectionType === 'Brand wise') {
        allOptions = await Brand.find({deletedAt: null});
      } else if (req.query.offerSelectionType && req.query.offerSelectionType === 'Category wise') {
        allOptions = await Category.find({deletedAt: null, parent_id: 0, type_id: 2});
      }

      if (req.query.catId) {
        let categoryId = await Category.find({deletedAt: null, name: req.query.catId, type_id: 2, parent_id: 0});
        if (categoryId.length > 0) {
          allOptions = await Category.find({deletedAt: null, parent_id: categoryId[0].id, type_id: 2});
        } else {
          allOptions = await Category.find({deletedAt: null, parent_id: parseInt(req.query.catId), type_id: 2});
        }
      }

      if (req.query.subCatId) {
        allOptions = await Category.find({deletedAt: null, parent_id: parseInt(req.query.subCatId), type_id: 2});
      }

      res.status(200).json({
        success: true,
        message: 'Get all options for shop/ brand/ category',
        data: allOptions
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({
        success: false,
        message: 'failed in Getting all options for shop/ brand/ category',
        error
      });
    }
  },

  /**Method called for creating Regular offer data*/
  /**Model models/Offer.js*/
  offerInsert: async (req, res) => {
    try {
      let body = req.body;
      if (req.body.hasImage === 'true') {
        req.file('image').upload(imageUploadConfig(), async (err, files) => {
          if (err) {
            return res.serverError(err);
          }

          if (files.length === 0) {
            return res.badRequest('No image was uploaded');
          }

          const newPath = files[0].fd.split(/[\\//]+/).reverse()[0];

          if (files.length === 2) {
            if (req.body.hasBannerImage) {
              let bannerImagePath = files[1].fd.split(/[\\//]+/).reverse()[0];
              body.banner_image = '/' + bannerImagePath;
            } else if (req.body.hasSmallImage) {
              let smallImagePath = files[1].fd.split(/[\\//]+/).reverse()[0];
              body.small_image = '/' + smallImagePath;
            }
          } else if (files.length === 3) {
            let smallImagePath = files[1].fd.split(/[\\//]+/).reverse()[0];
            body.small_image = '/' + smallImagePath;

            let bannerImagePath = files[2].fd.split(/[\\//]+/).reverse()[0];
            body.banner_image = '/' + bannerImagePath;
          }

          body.image = '/' + newPath;

          let offerData = {
            title: body.title,
            image: {
              image: body.image,
              small_image: body.small_image,
              banner_image: body.banner_image,
            },
            selection_type: body.selection_type,
            description: body.description,
            calculation_type: body.calculationType,
            discount_amount: body.discountAmount,
            start_date: body.offerStartDate,
            end_date: body.offerEndDate,
            show_in_homepage: body.showInHome
          };

          if (body.frontend_position) {
            offerData.frontend_position = body.frontend_position;
          }

          if (body.subSubCategory_Id && body.subSubCategory_Id !== 'null' && body.subSubCategory_Id !== 'undefined') {
            offerData.subSubCategory_Id = body.subSubCategory_Id;
            const subSubCat = await Offer.findOne({
              subSubCategory_Id: body.subSubCategory_Id,
              offer_deactivation_time: null
            });
            if (subSubCat !== undefined) {
              return res.status(200).json({
                code: 'INVALID_SUBSUBCAT',
                message: 'Subsub category already in another offer'
              });
              /*await Offer.updateOne({subSubCategory_Id: body.subSubCategory_Id}).set({offer_deactivation_time: new Date()});*/
            }
          }
          if (body.subCategory_Id && body.subCategory_Id !== 'null' && body.subCategory_Id !== 'undefined') {
            offerData.subCategory_Id = body.subCategory_Id;
          }
          if (body.category_id && body.category_id !== 'null' && body.category_id !== 'undefined') {
            offerData.category_id = body.category_id;
          }

          if (body.brand_id && body.brand_id !== 'null' && body.brand_id !== 'undefined') {
            offerData.brand_id = body.brand_id;
          }

          if (body.vendor_id && body.vendor_id !== 'null' && body.vendor_id !== 'undefined') {
            offerData.vendor_id = body.vendor_id;
          }

          let data = await Offer.create(offerData).fetch();
          /**console.log('offer fetched data from database: with image: ', data);*/

          let regular_offer_product_ids;
          if (body.selectedProductIds && body.selectedProductIds !== 'null' && body.selectedProductIds !== 'undefined') {
            regular_offer_product_ids = body.selectedProductIds.split(',');
          }

          if (regular_offer_product_ids && regular_offer_product_ids.length > 0) {
            for (let id = 0; id < regular_offer_product_ids.length; id++) {
              let product_id = parseInt(regular_offer_product_ids[id]);
              let existedProduct = await RegularOfferProducts.findOne({
                product_id: product_id,
                product_deactivation_time: null
              });
              if (existedProduct !== undefined) {
                await RegularOfferProducts.updateOne({product_id: product_id}).set({regular_offer_id: data.id});
              } else {
                await RegularOfferProducts.create({regular_offer_id: data.id, product_id: product_id});
              }
            }
          }

          return res.status(200).json({
            success: true,
            message: 'Offer created successfully',
            data
          });

        });

      } else {
        let offerData = {
          title: body.title,
          description: body.description,
          selection_type: body.selection_type,
          calculation_type: body.calculationType,
          discount_amount: body.discountAmount,
          start_date: body.offerStartDate,
          end_date: body.offerEndDate,
          show_in_homepage: body.showInHome
        };

        if (body.frontend_position) {
          offerData.frontend_position = body.frontend_position;
        }

        if (body.subSubCategory_Id && body.subSubCategory_Id !== 'null' && body.subSubCategory_Id !== 'undefined') {
          offerData.subSubCategory_Id = body.subSubCategory_Id;
          const subSubCat = await Offer.findOne({
            subSubCategory_Id: body.subSubCategory_Id,
            offer_deactivation_time: null
          });
          if (subSubCat !== undefined) {
            return res.status(200).json({
              code: 'INVALID_SUBSUBCAT',
              message: 'Subsub category already in another offer'
            });
            /*await Offer.updateOne({subSubCategory_Id: body.subSubCategory_Id}).set({offer_deactivation_time: new Date()});*/
          }
        }
        if (body.subCategory_Id && body.subCategory_Id !== 'null' && body.subCategory_Id !== 'undefined') {
          offerData.subCategory_Id = body.subCategory_Id;
        }
        if (body.category_id && body.category_id !== 'null' && body.category_id !== 'undefined') {
          offerData.category_id = body.category_id;
        }

        if (body.brand_id && body.brand_id !== 'null' && body.brand_id !== 'undefined') {
          offerData.brand_id = body.brand_id;
        }

        if (body.vendor_id && body.vendor_id !== 'null' && body.vendor_id !== 'undefined') {
          offerData.vendor_id = body.vendor_id;
        }

        let data = await Offer.create(offerData).fetch();
        /**console.log('offer fetched data from database: ', data);*/

        let regular_offer_product_ids;
        if (body.selectedProductIds && body.selectedProductIds !== 'null' && body.selectedProductIds !== 'undefined') {
          regular_offer_product_ids = body.selectedProductIds.split(',');
        }

        if (regular_offer_product_ids && regular_offer_product_ids.length > 0) {
          for (let id = 0; id < regular_offer_product_ids.length; id++) {
            let product_id = parseInt(regular_offer_product_ids[id]);
            let existedProduct = await RegularOfferProducts.findOne({
              product_id: product_id,
              product_deactivation_time: null
            });
            if (existedProduct !== undefined) {
              await RegularOfferProducts.updateOne({product_id: product_id}).set({regular_offer_id: data.id});
            } else {
              await RegularOfferProducts.create({regular_offer_id: data.id, product_id: product_id});
            }
          }
        }

        return res.status(200).json({
          success: true,
          message: 'Offer created successfully',
          data
        });
      }
    } catch (error) {
      console.log('error in insert offer: ', error);
      return res.status(400).json({
        success: false,
        message: 'Error in creating the offer',
        error
      });
    }
  },

  /**Method called for getting all regular offer data*/
  /**Model models/Offer.js*/
  allRegularOffer: async (req, res) => {
    try {
      await OfferService.offerDurationCheck();

      /**console.log('regular offer request: ', req.query);*/
      let _pagination = pagination(req.query);

      let _where = {};
      _where.deletedAt = null;

      let allRegularOffer = await Offer.find({
        where: _where,
        limit: _pagination.limit,
        skip: _pagination.skip
      }).sort([
        {id: 'DESC'},
        {end_date: 'DESC'},
      ]);

      let totalRegularOffer = await Offer.count().where(_where);

      res.status(200).json({
        success: true,
        total: totalRegularOffer,
        limit: _pagination.limit,
        skip: _pagination.skip,
        page: _pagination.page,
        message: 'All regular offers with pagination',
        data: allRegularOffer
      });

    } catch (error) {
      console.log(error);
      let message = 'Failed to get all regular offers with pagination';
      res.status(400).json({
        success: false,
        message,
        error
      });
    }
  },

  /**Method called to delete a regular offer*/
  /**model: RegularOfferProducts.js*/
  destroy: async (req, res) => {
    try {
      const regularOffer = await Offer.updateOne({id: req.param('id')}).set({deletedAt: new Date()});
      const regularOfferInfo = await Offer.findOne({id: req.param('id')});
      if (regularOfferInfo.selection_type === 'Product wise') {
        await RegularOfferProducts.update({regular_offer_id: req.param('id')}).set({deletedAt: new Date()});
      }
      return res.status(201).json(regularOffer);
    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: 'Failed to delete a regular offer',
        error
      });
    }
  },

  getRegularOfferById: async (req, res) => {
    try {
      await OfferService.offerDurationCheck();
      let regularOffer = await Offer.findOne({id: req.query.id, deletedAt: null})
        .populate('category_id')
        .populate('subCategory_Id')
        .populate('subSubCategory_Id')
        .populate('brand_id')
        .populate('vendor_id');

      res.status(200).json({
        success: true,
        message: 'Regular Offer data by id',
        regularOffer
      });
    } catch (error) {
      console.log('error in getRegularOfferById: ', error);
      res.status(400).json({
        success: false,
        message: 'failed to get regular offer by id',
        error
      });
    }
  },

  getRelatedOfferProducts: async (req, res) => {
    try {
      await OfferService.offerDurationCheck();
      let _pagination = pagination(req.query);
      let rawSQL = `
      SELECT
            regular_offer_products.*,
            products.*
        FROM
            regular_offer_products
        LEFT JOIN products ON regular_offer_products.product_id = products.id
        WHERE
            regular_offer_products.regular_offer_id = ${req.query.id} and regular_offer_products.deleted_at is null
        LIMIT ${_pagination.skip}, ${_pagination.limit}
      `;

      const products = await sails.sendNativeQuery(rawSQL, []);
      const totalProducts = await RegularOfferProducts.count().where({
        regular_offer_id: req.query.id,
        deletedAt: null,
        product_deactivation_time: null
      });

      res.status(200).json({
        success: true,
        message: 'All products with detail info related to this regular offer',
        data: products.rows,
        total: totalProducts
      });
    } catch (error) {
      console.log('getRelatedOfferProducts error: ', error);
      res.status(400).json({
        success: false,
        message: 'Failed to get related offer products',
        error
      });
    }
  },

  removeProductFromOffer: async (req, res) => {
    try {
      const removedProduct = await RegularOfferProducts.updateOne({
        product_id: req.query.productId,
        regular_offer_id: req.query.offerId
      }).set({deletedAt: new Date(), product_deactivation_time: new Date()});
      return res.status(201).json(removedProduct);
    } catch (error) {
      console.log('removeProductFromOffer error: ', error);
      res.status(400).json({
        message: 'Failed to delete the offered product'
      });
    }
  },

  updateOffer: async (req, res) => {
    try {
      let body = req.body;
      if (req.body.hasImage === 'true') {
        req.file('image').upload(imageUploadConfig(), async (err, files) => {
          if (err) {
            return res.serverError(err);
          }

          if (files.length === 0) {
            return res.badRequest('No image was uploaded');
          }

          const newPath = files[0].fd.split(/[\\//]+/).reverse()[0];

          if (files.length === 2) {
            if (req.body.hasBannerImage) {
              let bannerImagePath = files[1].fd.split(/[\\//]+/).reverse()[0];
              body.banner_image = '/' + bannerImagePath;
            } else if (req.body.hasSmallImage) {
              let smallImagePath = files[1].fd.split(/[\\//]+/).reverse()[0];
              body.small_image = '/' + smallImagePath;
            }
          } else if (files.length === 3) {
            let smallImagePath = files[1].fd.split(/[\\//]+/).reverse()[0];
            body.small_image = '/' + smallImagePath;

            let bannerImagePath = files[2].fd.split(/[\\//]+/).reverse()[0];
            body.banner_image = '/' + bannerImagePath;
          }

          body.image = '/' + newPath;

          let offerData = {
            title: body.title,
            image: {
              image: body.image,
              small_image: body.small_image,
              banner_image: body.banner_image,
            },
            selection_type: body.selection_type,
            description: body.description,
            calculation_type: body.calculationType,
            discount_amount: body.discountAmount,
            start_date: body.offerStartDate,
            end_date: body.offerEndDate,
            show_in_homepage: body.showInHome
          };

          if (body.frontend_position) {
            offerData.frontend_position = body.frontend_position;
          }

          if (body.subSubCategory_Id && body.subSubCategory_Id !== 'null' && body.subSubCategory_Id !== 'undefined') {
            offerData.subSubCategory_Id = body.subSubCategory_Id;
            const subSubCat = await Offer.find({
              subSubCategory_Id: body.subSubCategory_Id,
              offer_deactivation_time: null,
              deletedAt: null
            });

            if (subSubCat !== undefined && subSubCat.length > 1) {
              return res.status(200).json({
                code: 'INVALID_SUBSUBCAT',
                message: 'Subsub category already in another offer'
              });
              /*await Offer.updateOne({subSubCategory_Id: body.subSubCategory_Id}).set({offer_deactivation_time: new Date()});*/
            }
          }
          if (body.subCategory_Id && body.subCategory_Id !== 'null' && body.subCategory_Id !== 'undefined') {
            offerData.subCategory_Id = body.subCategory_Id;
          }
          if (body.category_id && body.category_id !== 'null' && body.category_id !== 'undefined') {
            offerData.category_id = body.category_id;
          }

          if (body.brand_id && body.brand_id !== 'null' && body.brand_id !== 'undefined') {
            offerData.brand_id = body.brand_id;
          }

          if (body.vendor_id && body.vendor_id !== 'null' && body.vendor_id !== 'undefined') {
            offerData.vendor_id = body.vendor_id;
          }

          let data = await Offer.updateOne({id: body.id}).set(offerData);
          /**console.log('offer fetched data from database: with image: ', data);*/

          let regular_offer_product_ids;
          if (body.selectedProductIds && body.selectedProductIds !== 'null' && body.selectedProductIds !== 'undefined') {
            regular_offer_product_ids = body.selectedProductIds.split(',');
          }

          if (regular_offer_product_ids && regular_offer_product_ids.length > 0) {
            for (let id = 0; id < regular_offer_product_ids.length; id++) {
              let product_id = parseInt(regular_offer_product_ids[id]);
              let existedProduct = await RegularOfferProducts.findOne({
                product_id: product_id
              });

              if (existedProduct !== undefined) {
                await RegularOfferProducts.updateOne({product_id: product_id}).set({
                  regular_offer_id: data.id,
                  product_deactivation_time: null,
                  deletedAt: null
                });
              } else {
                await RegularOfferProducts.create({regular_offer_id: data.id, product_id: product_id});
              }
            }
          }

          return res.status(200).json({
            success: true,
            message: 'Offer update successfully',
            data
          });

        });

      } else {
        let offerData = {
          title: body.title,
          description: body.description,
          selection_type: body.selection_type,
          calculation_type: body.calculationType,
          discount_amount: body.discountAmount,
          start_date: body.offerStartDate,
          end_date: body.offerEndDate,
          show_in_homepage: body.showInHome
        };

        if (body.frontend_position) {
          offerData.frontend_position = body.frontend_position;
        }

        if (body.subSubCategory_Id && body.subSubCategory_Id !== 'null' && body.subSubCategory_Id !== 'undefined') {
          offerData.subSubCategory_Id = body.subSubCategory_Id;
          const subSubCat = await Offer.find({
            subSubCategory_Id: body.subSubCategory_Id,
            offer_deactivation_time: null,
            deletedAt: null
          });

          if (subSubCat !== undefined && subSubCat.length > 1) {
            return res.status(200).json({
              code: 'INVALID_SUBSUBCAT',
              message: 'Subsub category already in another offer'
            });
            /*await Offer.updateOne({subSubCategory_Id: body.subSubCategory_Id}).set({offer_deactivation_time: new Date()});*/
          }
        }
        if (body.subCategory_Id && body.subCategory_Id !== 'null' && body.subCategory_Id !== 'undefined') {
          offerData.subCategory_Id = body.subCategory_Id;
        }
        if (body.category_id && body.category_id !== 'null' && body.category_id !== 'undefined') {
          offerData.category_id = body.category_id;
        }

        if (body.brand_id && body.brand_id !== 'null' && body.brand_id !== 'undefined') {
          offerData.brand_id = body.brand_id;
        }

        if (body.vendor_id && body.vendor_id !== 'null' && body.vendor_id !== 'undefined') {
          offerData.vendor_id = body.vendor_id;
        }

        let data = await Offer.updateOne({id: body.id}).set(offerData);
        /**console.log('offer fetched data from database: ', data);*/

        let regular_offer_product_ids;
        if (body.selectedProductIds && body.selectedProductIds !== 'null' && body.selectedProductIds !== 'undefined') {
          regular_offer_product_ids = body.selectedProductIds.split(',');
        }

        if (regular_offer_product_ids && regular_offer_product_ids.length > 0) {
          for (let id = 0; id < regular_offer_product_ids.length; id++) {
            let product_id = parseInt(regular_offer_product_ids[id]);
            let existedProduct = await RegularOfferProducts.findOne({
              product_id: product_id
            });

            if (existedProduct !== undefined) {
              await RegularOfferProducts.updateOne({product_id: product_id}).set({
                regular_offer_id: data.id,
                product_deactivation_time: null,
                deletedAt: null
              });
            } else {
              await RegularOfferProducts.create({regular_offer_id: data.id, product_id: product_id});
            }
          }
        }

        return res.status(200).json({
          success: true,
          message: 'Offer update successfully',
          data
        });
      }

    } catch (error) {
      console.log('updateOffer error: ', error);
      res.status(400).json({
        success: false,
        message: 'Failed to update the offer',
        error
      });
    }
  },

  getSelectedProductsInfo: async (req, res) => {
    try {
      let selectedIDS = req.query.data.split(',');
      let foundProducts = [];

      if (selectedIDS && selectedIDS.length > 0) {
        for (let id = 0; id < selectedIDS.length; id++) {
          let product_id = parseInt(selectedIDS[id]);
          if (product_id) {
            let product = await Product.findOne({id: product_id});
            foundProducts.push(product);
          }
        }
      }

      res.status(200).json({
        success: true,
        message: 'Successfully fetched selected products with their detail info',
        data: foundProducts,
      });
    } catch (error) {
      console.log('error: ', error);
      res.status(400).json({
        success: false,
        message: 'failed to get selected products info',
        error
      });
    }
  },

  activeStatusChange: async (req, res) => {
    try {
      if (req.body.event) {
        await Offer.updateOne({id: req.body.offerId}).set({offer_deactivation_time: null});
        const regularOfferInfo = await Offer.findOne({id: req.body.offerId});
        if (regularOfferInfo.selection_type === 'Product wise') {
          await RegularOfferProducts.update({regular_offer_id: req.body.offerId}).set({product_deactivation_time: null});
        }
      } else {
        await Offer.updateOne({id: req.body.offerId}).set({offer_deactivation_time: new Date()});
        const regularOfferInfo = await Offer.findOne({id: req.body.offerId});
        if (regularOfferInfo.selection_type === 'Product wise') {
          await RegularOfferProducts.update({regular_offer_id: req.body.offerId}).set({product_deactivation_time: new Date()});
        }
      }

      res.status(200).json({
        success: true,
        message: 'Successfully updated offer status',
      });
    } catch (error) {
      console.log('error: ', error);
      res.status(400).json({
        success: false,
        message: 'failed to update offer status',
        error
      });
    }
  },

  /**Method called from the web to get the regular offer data*/
  webRegularOffers: async (req, res) => {
    try {
      await OfferService.offerDurationCheck();

      let _where = {};
      _where.deletedAt = null;
      _where.offer_deactivation_time = null;

      let webRegularOffers = await Offer.find({where: _where});

      res.status(200).json({
        success: true,
        message: 'All regular offers for the web',
        data: webRegularOffers
      });
    } catch (error) {
      console.log('error: ', error);
      res.status(400).json({
        success: false,
        message: 'failed to get regular offer for the web',
        error
      });
    }
  },

  /**Method called from the web to get the regular offer data with its related offered products data*/
  webRegularOfferById: async (req, res) => {
    try {
      await OfferService.offerDurationCheck();

      let webRegularOfferedProducts;

      let _where = {};
      _where.id = req.query.id;
      _where.deletedAt = null;
      _where.offer_deactivation_time = null;
      const requestedOffer = await Offer.findOne({where: _where});

      /**if selection_type === 'Vendor wise'*/
      if (requestedOffer.selection_type === 'Vendor wise') {
        let _where = {};
        _where.warehouse_id = requestedOffer.vendor_id;
        _where.status = 2;
        _where.approval_status = 2;
        _where.deletedAt = null;
        webRegularOfferedProducts = await Product.find({where: _where});
      }

      /**if selection_type === 'Brand wise'*/
      if (requestedOffer.selection_type === 'Brand wise') {
        let _where = {};
        _where.brand_id = requestedOffer.brand_id;
        _where.status = 2;
        _where.approval_status = 2;
        _where.deletedAt = null;
        webRegularOfferedProducts = await Product.find({where: _where});
      }

      /**if selection_type === 'Category wise'*/
      if (requestedOffer.selection_type === 'Category wise') {
        let _where = {};
        _where.status = 2;
        _where.approval_status = 2;
        _where.deletedAt = null;

        if (requestedOffer.subSubCategory_Id) {
          _where.subcategory_id = requestedOffer.subSubCategory_Id;
        } else if (requestedOffer.subCategory_Id) {
          _where.category_id = requestedOffer.subCategory_Id;
        } else if (requestedOffer.category_id) {
          _where.type_id = requestedOffer.category_id;
        }

        webRegularOfferedProducts = await Product.find({where: _where});
      }

      /**if selection_type === 'Product wise'*/
      if (requestedOffer.selection_type === 'Product wise') {
        let _where = {};
        _where.regular_offer_id = req.query.id;
        _where.product_deactivation_time = null;
        _where.deletedAt = null;
        webRegularOfferedProducts = await RegularOfferProducts.find({where: _where})
          .populate('product_id');

        webRegularOfferedProducts = webRegularOfferedProducts.map(data => {
          return data.product_id;
        });
      }

      res.status(200).json({
        success: true,
        message: 'All regular offers for the web with related products data',
        data: [requestedOffer, webRegularOfferedProducts]
      });
    } catch (error) {
      console.log('error: ', error);
      res.status(400).json({
        success: false,
        message: 'failed to get regular offer for the web with related products data',
        error
      });
    }
  },

  /**Method called to get all regular offered products in a store in redux*/
  /**model: Offer.js, RegularOfferProducts.js*/
  getRegularOfferStore: async (req, res) => {
    try {

      let finalCollectionOfProducts = {};
      await OfferService.offerDurationCheck();
      await OfferService.anonderJhorOfferDurationCheck();
      let presentTime = moment().format('YYYY-MM-DD HH:mm:ss');

      let _where = {};
      _where.deletedAt = null;
      _where.offer_deactivation_time = null;
      _where.start_date =  {'<=': presentTime};
      _where.end_date = {'>=': presentTime};
      const requestedOffer = await Offer.find({
        where: _where
      });

      let _where1 = {};
      _where1.deletedAt = null;
      _where1.status = 1;
      _where1.start_date = {'<=': presentTime};
      _where1.end_date = {'>=': presentTime};
      const requetedJhorOffer = await AnonderJhorOffers.find({
        where: _where1
      });


      if (requestedOffer.length === 0 && requetedJhorOffer.length === 0) {
        return res.status(200).json({
          success: true,
          message: 'Successfully fetched all existing offered products to store in redux',
          finalCollectionOfProducts: {}
        });
      }

      for (let offer = 0; offer < requestedOffer.length; offer++) {
        const thisOffer = requestedOffer[offer];
        let offerObj = {
          calculation_type: thisOffer.calculation_type,
          discount_amount: thisOffer.discount_amount * 1.0,
        };

        /**if selection_type === 'Vendor wise'*/
        if (thisOffer.selection_type === 'Vendor wise') {

          let products = await Product.find({
            status: 2,
            approval_status: 2,
            deletedAt: null,
            warehouse_id: thisOffer.vendor_id
          });

          if (products.length > 0) {
            products.forEach(product => {
              finalCollectionOfProducts[product.id] = offerObj;
            });
          }
        }
        /**if selection_type === 'Brand wise'*/
        if (thisOffer.selection_type === 'Brand wise') {
          let _where = {};
          _where.brand_id = thisOffer.brand_id;
          _where.status = 2;
          _where.approval_status = 2;
          _where.deletedAt = null;
          let products = await Product.find({where: _where});

          if (products.length > 0) {
            products.forEach(product => {
              finalCollectionOfProducts[product.id] = offerObj;
            });
          }
        }

        /**if selection_type === 'Category wise'*/
        if (thisOffer.selection_type === 'Category wise') {
          let _where = {};
          _where.status = 2;
          _where.approval_status = 2;
          _where.deletedAt = null;

          if (thisOffer.subSubCategory_Id) {
            _where.subcategory_id = thisOffer.subSubCategory_Id;
          } else if (thisOffer.subCategory_Id) {
            _where.category_id = thisOffer.subCategory_Id;
          } else if (thisOffer.category_id) {
            _where.type_id = thisOffer.category_id;
          }

          let products = await Product.find({where: _where});

          if (products.length > 0) {
            products.forEach(product => {
              finalCollectionOfProducts[product.id] = offerObj;
            });
          }
        }

        /** if selection_type === 'Product wise' */
        if (thisOffer.selection_type === 'Product wise') {
          let _where = {};
          _where.regular_offer_id = thisOffer.id;
          _where.product_deactivation_time = null;
          _where.deletedAt = null;
          let products = await RegularOfferProducts.find({where: _where});

          if (products.length > 0) {
            products.forEach(product => {
              finalCollectionOfProducts[product.product_id] = offerObj;
            });
          }
        }
      }

      for (let jhorOffer = 0; jhorOffer < requetedJhorOffer.length; jhorOffer++) {
        const thisJhorOffer = requetedJhorOffer[jhorOffer];

        let jhorOfferObj = {
          calculation_type: thisJhorOffer.calculation_type,
          discount_amount: thisJhorOffer.discount_amount
        };

        let _where2 = {};
        _where2.status = 2;
        _where2.approval_status = 2;
        _where2.deletedAt = null;

        if (thisJhorOffer.sub_sub_category_id) {
          _where2.subcategory_id = thisJhorOffer.sub_sub_category_id;
        } else if (thisJhorOffer.sub_category_id) {
          _where2.category_id = thisJhorOffer.sub_category_id;
        } else if (thisJhorOffer.category_id) {
          _where2.type_id = thisJhorOffer.category_id;
        }

        let products = await Product.find({where: _where2});
        if (products.length > 0) {
          products.forEach(product => {
            finalCollectionOfProducts[product.id] = jhorOfferObj;
          });
        }
      }

      return res.status(200).json({
        success: true,
        message: 'Successfully fetched all existing offered products to store in redux',
        finalCollectionOfProducts
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: 'Failed to fetch all existing offered products',
        error
      });
    }
  },

};

