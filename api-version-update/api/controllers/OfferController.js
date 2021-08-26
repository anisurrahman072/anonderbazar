/**
 * OfferController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const {pagination} = require('../../libs/pagination');
const moment = require('moment');
const {uploadImages} = require('../../libs/helper');
const {columnsOfIndividualOfferProducts} = require('../../libs/offer');
const xl = require('excel4node');
const {escapeExcel} = require('../../libs/helper');
const _ = require('lodash');
const {performance} = require('perf_hooks');

module.exports = {
  /**Method for getting all the shop, brand and category to add a new offer on a particular shop, brand or category */
  getAllOptions: async (req, res) => {
    try {
      /**checking if the options have the offer time or not*/
      /*await OfferService.offerDurationCheck();*/

      let allOptions;
      if (req.query.offerSelectionType && req.query.offerSelectionType === 'Vendor wise') {
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
        message: 'Get all options for shop / brand / category',
        data: allOptions
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({
        success: false,
        message: 'failed in Getting all options for shop / brand / category',
        error
      });
    }
  },

  /**Method called for creating Regular offer data*/
  /**Model models/Offer.js*/
  offerInsert: async function (req, res) {
    try {
      let body = {...req.body};
      let upload_type = body.upload_type ? body.upload_type : '';

      if (!body.images || (body.images && JSON.parse(body.images).length === 0)) {
        return res.badRequest('No image was uploaded');
      }

      let offerData = {};
      let individualProductsIds = [];
      let individualProductsCalculations;
      let individualProductsAmounts;

      if (body.selection_type === 'individual_product') {
        if (body.upload_type && body.upload_type === 'csv') {
          const codes = body.individuallySelectedCodes.split(',');

          const products = await Product.find({code: codes});
          let x = _.groupBy(products, 'code');

          if (codes && codes.length > 0 && products.length > 0) {
            codes.forEach(code => {
              individualProductsIds.push(x[code][0].id);
            });
          }
        } else {
          individualProductsIds = body.individuallySelectedProductsId.split(',');
        }

        individualProductsCalculations = body.individuallySelectedProductsCalculation.split(',');
        individualProductsAmounts = body.individuallySelectedProductsAmount.split(',');

        offerData = {
          title: body.title,
          image: JSON.parse(body.images),
          selection_type: body.selection_type,
          description: body.description,
          start_date: body.offerStartDate,
          end_date: body.offerEndDate,
          show_in_homepage: body.showInHome,
          showInCarousel: body.showInCarousel,
          upload_type: upload_type,
          pay_by_sslcommerz: body.pay_by_sslcommerz === '1' ? 1 : 0,
          pay_by_bKash: body.pay_by_bKash === '1' ? 1 : 0,
          pay_by_offline: body.pay_by_offline === '1' ? 1 : 0,
          pay_by_cashOnDelivery: body.pay_by_cashOnDelivery === '1' ? 1 : 0,
          pay_by_nagad: body.pay_by_nagad === '1' ? 1 : 0,
        };
      } else {
        offerData = {
          title: body.title,
          image: JSON.parse(body.images),
          selection_type: body.selection_type,
          description: body.description,
          calculation_type: body.calculationType,
          discount_amount: body.discountAmount,
          start_date: body.offerStartDate,
          end_date: body.offerEndDate,
          show_in_homepage: body.showInHome,
          showInCarousel: body.showInCarousel,
          pay_by_sslcommerz: body.pay_by_sslcommerz === '1' ? 1 : 0,
          pay_by_bKash: body.pay_by_bKash === '1' ? 1 : 0,
          pay_by_offline: body.pay_by_offline === '1' ? 1 : 0,
          pay_by_cashOnDelivery: body.pay_by_cashOnDelivery === '1' ? 1 : 0,
          pay_by_nagad: body.pay_by_nagad === '1' ? 1 : 0,
        };
      }

      if (body.frontend_position) {
        offerData.frontend_position = body.frontend_position;
      }

      if (body.carousel_position) {
        offerData.carousel_position = body.carousel_position;
      }

      if (body.subSubCategory_Id) {
        offerData.subSubCategory_Id = body.subSubCategory_Id;

        const subSubCat = await Offer.findOne({
          subSubCategory_Id: body.subSubCategory_Id,
          offer_deactivation_time: null
        });
        if (subSubCat) {
          return res.status(200).json({
            code: 'INVALID_SUBSUBCAT',
            message: 'Subsub category already in another offer'
          });
        }
      }

      if (body.subCategory_Id) {
        offerData.subCategory_Id = body.subCategory_Id;
      }

      if (body.category_id) {
        offerData.category_id = body.category_id;
      }

      if (body.brand_id) {
        offerData.brand_id = body.brand_id;
      }

      if (body.vendor_id) {
        offerData.vendor_id = body.vendor_id;
      }

      let data = await Offer.create(offerData).fetch();

      /** for individually selected products: from excel or individual input*/
      if (individualProductsIds && individualProductsIds.length > 0) {

        let offeredProducts = await RegularOfferProducts.find({product_deactivation_time: null, deletedAt: null});
        let offeredProductsIDS = offeredProducts.map(products => products.product_id);

        for (let id = 0; id < individualProductsIds.length; id++) {
          let product_id = parseInt(individualProductsIds[id], 10);
          let calculationType = individualProductsCalculations[id];
          let discountAmount = parseFloat(individualProductsAmounts[id]);

          if (product_id) {
            if (offeredProductsIDS.includes(product_id)) {
              await RegularOfferProducts.update({product_id: product_id}).set({
                regular_offer_id: data.id,
                calculation_type: calculationType,
                discount_amount: discountAmount,
                product_deactivation_time: null,
                deletedAt: null
              });
            } else {
              await RegularOfferProducts.create({
                regular_offer_id: data.id,
                product_id: product_id,
                calculation_type: calculationType,
                discount_amount: discountAmount,
              });
            }
          }
        }
      }

      /** for individually selected products but having same discount amount*/
      let regular_offer_product_ids;
      if (body.selectedProductIds) {
        regular_offer_product_ids = body.selectedProductIds.split(',');
      }

      if (regular_offer_product_ids && regular_offer_product_ids.length > 0) {

        let offeredProducts = await RegularOfferProducts.find({product_deactivation_time: null, deletedAt: null});
        let offeredProductsIDS = offeredProducts.map(products => products.product_id);

        for (let id = 0; id < regular_offer_product_ids.length; id++) {
          let product_id = parseInt(regular_offer_product_ids[id], 10);

          if (offeredProductsIDS.includes(product_id)) {
            await RegularOfferProducts.update({product_id: product_id}).set({
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
        message: 'Offer created successfully',
        data
      });


    } catch (error) {
      console.log('error in insert offer: ', error);
      return res.status(400).json({
        success: false,
        message: 'Error in creating the offer',
        error
      });
    }
  },

  /**Method called for getting all regular offer data in admin section*/
  /**Model models/Offer.js*/
  allRegularOffer: async (req, res) => {
    try {
      /*await OfferService.offerDurationCheck();*/

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

  /** Method called to delete a regular offer */
  /** model: RegularOfferProducts.js */
  destroy: async (req, res) => {
    try {
      const regularOffer = await Offer.updateOne({id: req.param('id')}).set({deletedAt: new Date()});
      const regularOfferInfo = await Offer.findOne({id: req.param('id')});
      if (regularOfferInfo.selection_type === 'Product wise') {
        await RegularOfferProducts.update({regular_offer_id: req.param('id')}).set({deletedAt: new Date()});
      }
      if (regularOfferInfo.selection_type === 'individual_product') {
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

  /** Method called to get a regular offer in order to edit in admin section */
  getRegularOfferById: async (req, res) => {
    try {
      /*await OfferService.offerDurationCheck();*/
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

  /** Method called in the admin to see the products exists under an offer */
  getRelatedOfferProducts: async (req, res) => {
    try {
      /*await OfferService.offerDurationCheck();*/
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

  /** Method called in admin section to get the individual offered products under an offer */
  getRelatedOfferIndividualProducts: async (req, res) => {
    try {
      /*await OfferService.offerDurationCheck();*/
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
        message: 'All individual products with detail info related to this regular offer',
        data: products.rows,
        total: totalProducts
      });
    } catch (error) {
      console.log('getRelatedOfferProducts error: ', error);
      res.status(400).json({
        success: false,
        message: 'Failed to get related offer individual products',
        error
      });
    }
  },

  /** Method called in admin section to remove a single product from an offer: product wise */
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

  /** Method called in admin section to remove a single product from an offer: individual_product */
  removeIndividualProductFromOffer: async (req, res) => {
    try {
      const removedProduct = await RegularOfferProducts.updateOne({
        product_id: req.query.productId,
        regular_offer_id: req.query.offerId
      }).set({deletedAt: new Date(), product_deactivation_time: new Date()});
      return res.status(201).json(removedProduct);
    } catch (error) {
      console.log('removeIndividualProductFromOffer error: ', error);
      res.status(400).json({
        message: 'Failed to delete the offered product'
      });
    }
  },

  /** Method called in admin to update an offer */
  updateOffer: async (req, res) => {
    try {
      let body = {...req.body};
      let upload_type = body.upload_type ? body.upload_type : '';

      let offer = await Offer.findOne({id: body.id});

      /*if (body.hasImage === 'true' || body.hasBannerImage === 'true' || body.hasSmallImage === 'true') {

        const files = await uploadImages(req.file('image'));

        /!*console.log('files', files);*!/

        if (files.length === 0) {
          return res.badRequest('No file was uploaded');
        }

        const newPath = files[0].fd.split(/[\\//]+/).reverse()[0];
        if (body.hasBannerImage === 'true' && body.hasImage === 'true' && body.hasSmallImage === 'true') {

          body.image = '/' + newPath;

          if (typeof files[1] !== 'undefined') {
            const newPathBanner = files[1].fd.split(/[\\//]+/).reverse()[0];
            body.banner_image = '/' + newPathBanner;
          }

          if (typeof files[2] !== 'undefined') {
            const newPathMobile = files[2].fd.split(/[\\//]+/).reverse()[0];
            body.small_image = '/' + newPathMobile;
          }

        } else if (body.hasImage === 'true' && body.hasBannerImage === 'true') {

          body.image = '/' + newPath;

          if (typeof files[1] !== 'undefined') {
            const newPathBanner = files[1].fd.split(/[\\//]+/).reverse()[0];
            body.banner_image = '/' + newPathBanner;
          }
        } else if (body.hasImage === 'true' && body.hasSmallImage === 'true') {

          body.image = '/' + newPath;

          if (typeof files[1] !== 'undefined') {
            const newPathBanner = files[1].fd.split(/[\\//]+/).reverse()[0];
            body.small_image = '/' + newPathBanner;
          }
        } else if (body.hasBannerImage === 'true' && body.hasSmallImage === 'true') {

          body.banner_image = '/' + newPath;

          if (typeof files[1] !== 'undefined') {
            const newPathBanner = files[1].fd.split(/[\\//]+/).reverse()[0];
            body.small_image = '/' + newPathBanner;
          }
        } else if (body.hasImage === 'true') {
          body.image = '/' + newPath;
        } else if (body.hasBannerImage === 'true') {
          body.banner_image = '/' + newPath;
        } else if (body.hasSmallImage === 'true') {
          body.small_image = '/' + newPath;
        }

      }*/

      let images;
      if (body.images) {
        images = JSON.parse(body.images);
      }
      console.log('Images are: ', images);

      let offerData = {image: {}};
      if (images && images.image) {
        offerData.image.image = images.image;
      } else {
        offerData.image.image = offer.image && offer.image.image ? offer.image.image : '';
      }
      if (images && images.small_image) {
        offerData.image.small_image = images.small_image;
      } else {
        offerData.image.small_image = offer.image && offer.image.small_image ? offer.image.small_image : '';
      }
      if (images && images.banner_image) {
        offerData.image.banner_image = images.banner_image;
      } else {
        offerData.image.banner_image = offer.image && offer.image.banner_image ? offer.image.banner_image : '';
      }

      /*console.log('offerData.image: ',offerData.image);*/

      let individualProductsIds = [];
      let individualProductsCalculations;
      let individualProductsAmounts;

      if (body.selection_type === 'individual_product') {
        if (body.upload_type && body.upload_type === 'csv') {
          const codes = body.individuallySelectedCodes.split(',');

          const products = await Product.find({code: codes});
          let x = _.groupBy(products, 'code');

          if (codes && codes.length > 0 && products.length > 0) {
            codes.forEach(code => {
              individualProductsIds.push(x[code][0].id);
            });
          }
        } else {
          individualProductsIds = body.individuallySelectedProductsId.split(',');
        }

        individualProductsCalculations = body.individuallySelectedProductsCalculation.split(',');
        individualProductsAmounts = body.individuallySelectedProductsAmount.split(',');

        offerData = {
          ...offerData,
          title: body.title,
          selection_type: body.selection_type,
          description: body.description,
          start_date: body.offerStartDate,
          end_date: body.offerEndDate,
          show_in_homepage: body.showInHome,
          showInCarousel: body.showInCarousel,
          upload_type: upload_type,
          pay_by_sslcommerz: body.pay_by_sslcommerz === '1' ? 1 : 0,
          pay_by_bKash: body.pay_by_bKash === '1' ? 1 : 0,
          pay_by_offline: body.pay_by_offline === '1' ? 1 : 0,
          pay_by_cashOnDelivery: body.pay_by_cashOnDelivery === '1' ? 1 : 0,
          pay_by_nagad: body.pay_by_nagad === '1' ? 1 : 0
        };
      } else {
        offerData = {
          ...offerData,
          title: body.title,
          selection_type: body.selection_type,
          description: body.description,
          calculation_type: body.calculationType,
          discount_amount: body.discountAmount,
          start_date: body.offerStartDate,
          end_date: body.offerEndDate,
          show_in_homepage: body.showInHome,
          showInCarousel: body.showInCarousel,
          pay_by_sslcommerz: body.pay_by_sslcommerz === '1' ? 1 : 0,
          pay_by_bKash: body.pay_by_bKash === '1' ? 1 : 0,
          pay_by_offline: body.pay_by_offline === '1' ? 1 : 0,
          pay_by_cashOnDelivery: body.pay_by_cashOnDelivery === '1' ? 1 : 0,
          pay_by_nagad: body.pay_by_nagad === '1' ? 1 : 0
        };
      }

      if (body.frontend_position) {
        offerData.frontend_position = body.frontend_position;
      }

      if (body.carousel_position) {
        offerData.carousel_position = body.carousel_position;
      }

      if (body.subSubCategory_Id) {
        offerData.subSubCategory_Id = body.subSubCategory_Id;
        const subSubCat = await Offer.find({
          subSubCategory_Id: body.subSubCategory_Id,
          offer_deactivation_time: null,
          deletedAt: null
        });

        if (subSubCat && subSubCat.length > 1) {
          return res.status(200).json({
            code: 'INVALID_SUBSUBCAT',
            message: 'Subsub category already in another offer'
          });
        }
      }

      if (body.subCategory_Id) {
        offerData.subCategory_Id = body.subCategory_Id;
      }

      if (body.category_id) {
        offerData.category_id = body.category_id;
      }

      if (body.brand_id) {
        offerData.brand_id = body.brand_id;
      }

      if (body.vendor_id) {
        offerData.vendor_id = body.vendor_id;
      }

      let data = await Offer.updateOne({id: body.id}).set(offerData);

      /** for individually selected products */
      if (individualProductsIds && individualProductsIds.length > 0) {

        let offeredProducts = await RegularOfferProducts.find({product_deactivation_time: null, deletedAt: null});
        let offeredProductsIDS = offeredProducts.map(products => products.product_id);

        for (let id = 0; id < individualProductsIds.length; id++) {
          let product_id = parseInt(individualProductsIds[id], 10);
          let calculationType = individualProductsCalculations[id];
          let discountAmount = parseFloat(individualProductsAmounts[id]);

          if (product_id) {
            if (offeredProductsIDS.includes(product_id)) {
              await RegularOfferProducts.updateOne({product_id: product_id}).set({
                regular_offer_id: data.id,
                calculation_type: calculationType,
                discount_amount: discountAmount,
                product_deactivation_time: null,
                deletedAt: null
              });
            } else {
              await RegularOfferProducts.create({
                regular_offer_id: data.id,
                product_id: product_id,
                calculation_type: calculationType,
                discount_amount: discountAmount
              });
            }
          }
        }
      }

      let regular_offer_product_ids;
      if (body.selectedProductIds) {
        regular_offer_product_ids = body.selectedProductIds.split(',');
      }

      if (regular_offer_product_ids && regular_offer_product_ids.length > 0) {

        let offeredProducts = await RegularOfferProducts.find({product_deactivation_time: null, deletedAt: null});
        let offeredProductsIDS = offeredProducts.map(products => products.product_id);

        for (let id = 0; id < regular_offer_product_ids.length; id++) {
          let product_id = parseInt(regular_offer_product_ids[id], 10);

          if (offeredProductsIDS.includes(product_id)) {
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
        message: 'Offer updated successfully',
        data
      });

    } catch (error) {
      console.log('updateOffer error: ', error);
      res.status(400).json({
        success: false,
        message: 'Failed to update the offer',
        error
      });
    }
  },

  /** Method called in admin to show the already selected products when products are being selected to add to an offer */
  getSelectedProductsInfo: async (req, res) => {
    try {

      if (!req.query.data) {
        return res.status(422).json({
          message: 'Invalid Request',
        });
      }

      let selectedIDS = req.query.data.split(',');
      let foundProducts = [];

      if (selectedIDS && selectedIDS.length > 0) {
        for (let id = 0; id < selectedIDS.length; id++) {
          let product_id = parseInt(selectedIDS[id], 10);
          if (product_id) {
            let product = await Product.findOne({id: product_id});
            foundProducts.push(product);
          }
        }
      }

      return res.status(200).json({
        success: true,
        message: 'Successfully fetched selected products with their detail info',
        data: foundProducts,
      });
    } catch (error) {
      console.log('error: ', error);
      return res.status(400).json({
        success: false,
        message: 'failed to get selected products info',
        error
      });
    }
  },

  /** Method called from admin to change to the status of an offer */
  activeStatusChange: async (req, res) => {
    try {
      if (req.body.event) {
        await Offer.updateOne({id: req.body.offerId}).set({offer_deactivation_time: null});
        const regularOfferInfo = await Offer.findOne({id: req.body.offerId});
        if (regularOfferInfo.selection_type === 'Product wise') {
          await RegularOfferProducts.update({regular_offer_id: req.body.offerId}).set({product_deactivation_time: null});
        } else if (regularOfferInfo.selection_type === 'individual_product') {
          await RegularOfferProducts.update({regular_offer_id: req.body.offerId}).set({product_deactivation_time: null});
        }
      } else {
        await Offer.updateOne({id: req.body.offerId}).set({offer_deactivation_time: new Date()});
        const regularOfferInfo = await Offer.findOne({id: req.body.offerId});
        if (regularOfferInfo.selection_type === 'Product wise') {
          await RegularOfferProducts.update({regular_offer_id: req.body.offerId}).set({product_deactivation_time: new Date()});
        } else if (regularOfferInfo.selection_type === 'individual_product') {
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
      /*await OfferService.offerDurationCheck();*/

      let webRegularOffers =  await sails.helpers.cacheRead('getWebRegularOffers');
      console.log('######### getWebRegularOffers from cache ############', webRegularOffers);
      if(!webRegularOffers){
        sails.log.error('######### getWebRegularOffers from cache got Undefined ############');
        throw new Error('webRegularOffers not found!');
      }

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

  /**Method called from the web to get the regular offer data with its related offered products data
   * of a specific brand: web address: http://localhost:4200/offers/offered-products-brands/212/88*/
  webRegularOfferById: async (req, res) => {
    const brandId = parseInt(req.query.brandId);

    try {
      /*await OfferService.offerDurationCheck();*/
      let webRegularOfferedProducts;

      let presentTime = moment().format('YYYY-MM-DD HH:mm:ss');
      let _where = {};
      _where.id = req.query.offerId;
      _where.start_date = {'<=': presentTime};
      _where.end_date = {'>=': presentTime};
      _where.offer_deactivation_time = null;
      _where.deletedAt = null;

      const requestedOffer = await Offer.findOne({where: _where});

      if (requestedOffer === undefined) {
        return res.status(400).json({
          success: false,
          message: 'offer does not exists',
        });
      }

      let _sort = [];
      let sortData;
      if (req.query.sortData) {
        sortData = JSON.parse(req.query.sortData);
        if (sortData.code === 'newest') {
          let obj = {
            createdAt: sortData.order
          };
          _sort.push(obj);
        } else if (sortData.code === 'price') {
          let obj = {
            price: sortData.order
          };
          _sort.push(obj);
        }
      }

      /**if selection_type === 'Vendor wise'*/
      if (requestedOffer.selection_type === 'Vendor wise') {
        let _where = {};
        _where.warehouse_id = requestedOffer.vendor_id;
        _where.status = 2;
        _where.approval_status = 2;
        _where.deletedAt = null;
        _where.brand_id = brandId;
        webRegularOfferedProducts = await Product.find({where: _where}).sort(_sort);
      }

      /**if selection_type === 'Brand wise'*/
      if (requestedOffer.selection_type === 'Brand wise') {
        let _where = {};
        _where.brand_id = brandId;
        _where.status = 2;
        _where.approval_status = 2;
        _where.deletedAt = null;
        webRegularOfferedProducts = await Product.find({where: _where}).sort(_sort);
      }

      /**if selection_type === 'Category wise'*/
      if (requestedOffer.selection_type === 'Category wise') {
        let _where = {};
        _where.status = 2;
        _where.approval_status = 2;
        _where.deletedAt = null;
        _where.brand_id = brandId;

        if (requestedOffer.subSubCategory_Id) {
          _where.subcategory_id = requestedOffer.subSubCategory_Id;
        } else if (requestedOffer.subCategory_Id) {
          _where.category_id = requestedOffer.subCategory_Id;
        } else if (requestedOffer.category_id) {
          _where.type_id = requestedOffer.category_id;
        }

        webRegularOfferedProducts = await Product.find({where: _where}).sort(_sort);
      }

      /**if selection_type === 'Product wise'*/
      if (requestedOffer.selection_type === 'Product wise') {
        let _where = {};
        _where.regular_offer_id = req.query.offerId;
        _where.product_deactivation_time = null;
        _where.deletedAt = null;
        webRegularOfferedProducts = await RegularOfferProducts.find({where: _where})
          .populate('product_id');

        if (sortData && sortData.code === 'newest') {
          if (sortData.order === 'ASC') {
            webRegularOfferedProducts = webRegularOfferedProducts.sort((a, b) => {
              let firstCreatedAt = moment(a.createdAt, 'YYYY-MM-DD HH:mm:ss');
              let secondCreatedAt = moment(b.createdAt, 'YYYY-MM-DD HH:mm:ss');
              if (firstCreatedAt.isBefore(secondCreatedAt)) {
                return 1;
              } else {
                return -1;
              }
            });
          } else if (sortData.order === 'DESC') {
            webRegularOfferedProducts = webRegularOfferedProducts.sort((a, b) => {
              let firstCreatedAt = moment(a.createdAt, 'YYYY-MM-DD HH:mm:ss');
              let secondCreatedAt = moment(b.createdAt, 'YYYY-MM-DD HH:mm:ss');
              if (firstCreatedAt.isBefore(secondCreatedAt)) {
                return -1;
              } else {
                return 1;
              }
            });
          }
        } else if (sortData && sortData.code === 'price') {
          if (sortData.order === 'ASC') {
            webRegularOfferedProducts = webRegularOfferedProducts.sort((a, b) => {
              if (a.price > b.price) {
                return 1;
              } else {
                return -1;
              }
            });
          } else if (sortData.order === 'DESC') {
            webRegularOfferedProducts = webRegularOfferedProducts.sort((a, b) => {
              if (a.price > b.price) {
                return -1;
              } else {
                return 1;
              }
            });
          }
        }

        webRegularOfferedProducts = webRegularOfferedProducts.filter(data => {
          return (data.product_id.brand_id === brandId);
        });

        webRegularOfferedProducts = webRegularOfferedProducts.map(data => {
          return data.product_id;
        });
      }

      /**if selection_type === 'individual_product'*/
      if (requestedOffer.selection_type === 'individual_product') {
        let _where = {};
        _where.regular_offer_id = req.query.offerId;
        _where.product_deactivation_time = null;
        _where.deletedAt = null;
        webRegularOfferedProducts = await RegularOfferProducts.find({where: _where})
          .populate('product_id');

        if (sortData && sortData.code === 'newest') {
          if (sortData.order === 'ASC') {
            webRegularOfferedProducts = webRegularOfferedProducts.sort((a, b) => {
              let firstCreatedAt = moment(a.createdAt, 'YYYY-MM-DD HH:mm:ss');
              let secondCreatedAt = moment(b.createdAt, 'YYYY-MM-DD HH:mm:ss');
              if (firstCreatedAt.isBefore(secondCreatedAt)) {
                return 1;
              } else {
                return -1;
              }
            });
          } else if (sortData.order === 'DESC') {
            webRegularOfferedProducts = webRegularOfferedProducts.sort((a, b) => {
              let firstCreatedAt = moment(a.createdAt, 'YYYY-MM-DD HH:mm:ss');
              let secondCreatedAt = moment(b.createdAt, 'YYYY-MM-DD HH:mm:ss');
              if (firstCreatedAt.isBefore(secondCreatedAt)) {
                return -1;
              } else {
                return 1;
              }
            });
          }
        } else if (sortData && sortData.code === 'price') {
          if (sortData.order === 'ASC') {
            webRegularOfferedProducts = webRegularOfferedProducts.sort((a, b) => {
              if (a.price > b.price) {
                return 1;
              } else {
                return -1;
              }
            });
          } else if (sortData.order === 'DESC') {
            webRegularOfferedProducts = webRegularOfferedProducts.sort((a, b) => {
              if (a.price > b.price) {
                return -1;
              } else {
                return 1;
              }
            });
          }
        }

        webRegularOfferedProducts = webRegularOfferedProducts.filter(data => {
          return (data.product_id.brand_id === brandId);
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

  /**Method called to get all offered products to store in redux*/
  /**model: Offer.js, RegularOfferProducts.js*/
  getAllOfferedProducts: async (req, res) => {
    try {
      const time1 = performance.now();
      const finalCollectionOfProducts = await sails.helpers.cacheRead('getAllOfferedProducts');
      console.log('######### getAllOfferedProducts from cache ############', finalCollectionOfProducts);

      const time2 = performance.now();
      console.log(`getAllOfferedProducts Time Elapsed: ${(time2 - time1) / 1000} seconds.`);

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

  /** Method called to check the validity of the codes input by the admin for adding to the individual product offer */
  checkIndividualProductsCodesValidity: async (req, res) => {
    try {
      let invalidCodes = [];
      let codes = req.body + '';
      codes = codes.split(',');

      for (let index = 0; index < codes.length; index++) {
        let exists = await Product.findOne({code: codes[index]});
        if (!exists) {
          invalidCodes.push(codes[index]);
        }
      }

      if (invalidCodes && invalidCodes.length > 0) {
        return res.status(200).json({
          success: true,
          message: 'Invalid codes found',
          data: invalidCodes
        });
      } else {
        return res.status(200).json({
          success: true,
          message: 'Every code is valid',
        });
      }
    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: 'Failed to check Individual Products Code Validity',
        error
      });
    }
  },

  /** Method called to create an empty excel sheet as a sample file to add products individually in the offer */
  generateExcel: async (req, res) => {
    try {

      // Create a new instance of a Workbook class
      const wb = new xl.Workbook({
        jszip: {
          compression: 'DEFLATE',
        },
        defaultFont: {
          size: 12,
          name: 'Calibri',
          color: '#100f0f',
        },
        dateFormat: 'd/m/yyyy hh:mm:ss a',
        author: 'Anonder Bazar', // Name for use in features such as comments
      });


      // Add Worksheets to the workbook
      const options = {
        margins: {
          left: 1.5,
          right: 1.5,
        }
      };

      const ws = wb.addWorksheet('Offered Product List', options);
      const calculationTypeSheet = wb.addWorksheet('Calculation', options);

      let calculationTypeList = [
        {name: 'percentage'},
        {name: 'absolute'}
      ];

      calculationTypeList.forEach((item, i) => {
        calculationTypeSheet.cell(i + 1, 1).string(escapeExcel(item.name));
      });

      // Create a reusable style
      const headerStyle = wb.createStyle({
        font: {
          color: '#070c02',
          size: 14,
        },
      });

      const columnNamesObject = columnsOfIndividualOfferProducts;

      const letters = ['A', 'B', 'C'];

      const columnNameKeys = Object.keys(columnNamesObject);

      const cNLen = columnNameKeys.length;

      for (let i = 0; i < cNLen; i++) {
        ws.column((i + 1)).setWidth(columnNamesObject[columnNameKeys[i]].width);
        ws.cell(1, (i + 1)).string(columnNameKeys[i]).style(headerStyle);
        if (typeof columnNamesObject[columnNameKeys[i]].validation !== 'undefined') {
          if (columnNamesObject[columnNameKeys[i]].validation === 'decimal') {
            ws.addDataValidation({
              type: 'decimal',
              allowBlank: false,
              sqref: letters[i] + '2:' + letters[i] + '10000',
            });
          } else if (columnNamesObject[columnNameKeys[i]].validation === 'list') {
            ws.addDataValidation({
              type: 'list',
              allowBlank: false,
              prompt: 'Choose from Dropdown',
              error: 'Invalid Choice was Chosen',
              showDropDown: true,
              sqref: letters[i] + '2:' + letters[i] + '10000',
              formulas: ['=' + columnNamesObject[columnNameKeys[i]].sheetName + '!$A:$A'],
            });
          }
        }
      }

      wb.write('Excel-' + Date.now() + '.xlsx', res);

    } catch (error) {
      console.error(error);
      return res.status(400).json({
        success: false,
        message: 'error in generating excel',
        error
      });
    }
  },

  /** Method called to generate excel file with existing offered products in offer
   *  edit to see the existing offered products and to modify them if the user want */
  generateOfferedExcel: async (req, res) => {
    try {
      const wb = new xl.Workbook({
        jszip: {
          compression: 'DEFLATE',
        },
        defaultFont: {
          size: 12,
          name: 'Calibri',
          color: '#100f0f',
        },
        dateFormat: 'd/m/yyyy hh:mm:ss a',
        author: 'Anonder Bazar', // Name for use in features such as comments
      });

      const options = {
        margins: {
          left: 1.5,
          right: 1.5,
        }
      };

      const ws = wb.addWorksheet('Offered Product List', options);
      const calculationTypeSheet = wb.addWorksheet('Calculation', options);

      let calculationTypeList = [
        {name: 'percentage'},
        {name: 'absolute'}
      ];

      calculationTypeList.forEach((item, i) => {
        calculationTypeSheet.cell(i + 1, 1).string(escapeExcel(item.name));
      });

      // Create a reusable style
      const headerStyle = wb.createStyle({
        font: {
          color: '#070c02',
          size: 14,
        },
      });
      const myStyle = wb.createStyle({
        alignment: {
          wrapText: true
        }
      });

      const columnNamesObject = columnsOfIndividualOfferProducts;

      const letters = ['A', 'B', 'C'];

      const columnNameKeys = Object.keys(columnNamesObject);

      const cNLen = columnNameKeys.length;

      for (let i = 0; i < cNLen; i++) {
        ws.column((i + 1)).setWidth(columnNamesObject[columnNameKeys[i]].width);
        ws.cell(1, (i + 1)).string(columnNameKeys[i]).style(headerStyle);
        if (typeof columnNamesObject[columnNameKeys[i]].validation !== 'undefined') {
          if (columnNamesObject[columnNameKeys[i]].validation === 'decimal') {
            ws.addDataValidation({
              type: 'decimal',
              allowBlank: false,
              sqref: letters[i] + '2:' + letters[i] + '10000',
            });
          } else if (columnNamesObject[columnNameKeys[i]].validation === 'list') {
            ws.addDataValidation({
              type: 'list',
              allowBlank: false,
              prompt: 'Choose from Dropdown',
              error: 'Invalid Choice was Chosen',
              showDropDown: true,
              sqref: letters[i] + '2:' + letters[i] + '10000',
              formulas: ['=' + columnNamesObject[columnNameKeys[i]].sheetName + '!$A:$A'],
            });
          }
        }
      }

      let offerId = req.query.id;
      let rawSQL = `
          SELECT
              rop.calculation_type,
              rop.discount_amount,
              products.code AS product_code
          FROM
              regular_offer_products AS rop
          LEFT JOIN products ON products.id = rop.product_id
          WHERE
              rop.regular_offer_id = ${offerId} AND rop.product_deactivation_time IS NULL AND rop.deleted_at IS NULL
      `;


      const rawResult = await sails.sendNativeQuery(rawSQL, []);

      const offerInfo = rawResult.rows;
      console.log('offer infffffff: ', offerInfo);

      let row = 2;

      offerInfo.forEach(item => {

        let column = 1;

        if (item.product_code) {
          ws.cell(row, column++).string(item.product_code);
        } else {
          ws.cell(row, column++).string(null);
        }

        if (item.calculation_type) {
          ws.cell(row, column++).string(escapeExcel(item.calculation_type));
        } else {
          ws.cell(row, column++).string(null);
        }

        if (item.discount_amount) {
          ws.cell(row, column++).number(item.discount_amount);
        } else {
          ws.cell(row, column++).number(0);
        }

        row++;
      });

      wb.write('Excel-' + Date.now() + '.xlsx', res);

    } catch (error) {
      console.log(error);
      let message = 'Error in Get All products with excel';
      res.status(400).json({
        success: false,
        message,
        error
      });
    }
  },

  /** Method for fetching offered products brands => used in web*/
  getOfferedProductsBrands: async (req, res) => {
    try {
      let presentTime = moment().format('YYYY-MM-DD HH:mm:ss');

      let _where = {};
      _where.id = req.query.offerId;
      _where.offer_deactivation_time = null;
      _where.deletedAt = null;
      _where.start_date = {'<=': presentTime};
      _where.end_date = {'>=': presentTime};

      let offerInfo = await Offer.findOne({where: _where});
      let brands;

      if (offerInfo === undefined) {
        return res.status(400).json({
          message: 'offer does not exists',
        });
      }

      /**if selection_type === 'Vendor wise'*/
      if (offerInfo && offerInfo.selection_type === 'Vendor wise') {
        let vendorId = offerInfo.vendor_id;
        const rawSQL = `
        SELECT
              COUNT(products.id) AS number_of_products,
              brands.id,
              brands.name,
              brands.image
          FROM
              products
          LEFT JOIN brands ON products.brand_id = brands.id
          WHERE
              products.warehouse_id = ${vendorId} AND products.deleted_at IS NULL AND products.status = 2 AND products.approval_status = 2 AND brands.deleted_at IS NULL
          GROUP BY
              brand_id
          ORDER BY
              brands.frontend_position,
              COUNT(products.id)
          DESC
        `;

        const rawBrands = await sails.sendNativeQuery(rawSQL, []);
        brands = rawBrands.rows;
      }

      /**if selection_type === 'Brand wise'*/
      if (offerInfo && offerInfo.selection_type === 'Brand wise') {
        const rawSQL = `
        SELECT
              COUNT(products.id) AS number_of_products,
              brands.id,
              brands.name,
              brands.image
          FROM
              products
          LEFT JOIN brands ON products.brand_id = brands.id
          WHERE
             products.status = 2 AND products.approval_status = 2 AND products.deleted_at IS NULL AND brands.deleted_at IS NULL AND
              products.brand_id = ${offerInfo.brand_id}
        `;

        const rawBrands = await sails.sendNativeQuery(rawSQL, []);
        brands = rawBrands.rows;
      }

      /**if selection_type === 'Category wise'*/
      if (offerInfo && offerInfo.selection_type === 'Category wise') {

        let _where = {};
        _where.status = 2;
        _where.approval_status = 2;
        _where.deletedAt = null;

        if (offerInfo.subSubCategory_Id) {
          _where.subcategory_id = offerInfo.subSubCategory_Id;
        } else if (offerInfo.subCategory_Id) {
          _where.category_id = offerInfo.subCategory_Id;
        } else if (offerInfo.category_id) {
          _where.type_id = offerInfo.category_id;
        }

        const products = await Product.find({where: _where});
        const productIds = products.map(products => products.id);

        const rawSQL = `
        SELECT
              COUNT(products.id) AS number_of_products,
              brands.id,
              brands.name,
              brands.image
          FROM
              products
          LEFT JOIN brands ON products.brand_id = brands.id
          WHERE
              products.id IN (${productIds}) AND products.deleted_at IS NULL AND products.status = 2 AND products.approval_status = 2 AND brands.deleted_at IS NULL
          GROUP BY
              brand_id
          ORDER BY
              brands.frontend_position,
              COUNT(products.id)
          DESC
        `;
        const rawBrands = await sails.sendNativeQuery(rawSQL, []);
        brands = rawBrands.rows;
      }

      /**if selection_type === 'Product wise'*/
      if (offerInfo && offerInfo.selection_type === 'Product wise') {
        let _where = {};
        _where.regular_offer_id = offerInfo.id;
        _where.product_deactivation_time = null;
        _where.deletedAt = null;
        const regularOfferedProducts = await RegularOfferProducts.find({where: _where});

        const productIds = regularOfferedProducts.map(data => {
          return data.product_id;
        });

        const rawSQL = `
        SELECT
              COUNT(products.id) AS number_of_products,
              brands.id,
              brands.name,
              brands.image
          FROM
              products
          LEFT JOIN brands ON products.brand_id = brands.id
          WHERE
              products.id IN (${productIds}) AND products.deleted_at IS NULL AND products.status = 2 AND products.approval_status = 2 AND brands.deleted_at IS NULL
          GROUP BY
              brand_id
          ORDER BY
              brands.frontend_position,
              COUNT(products.id)
          DESC
        `;
        const rawBrands = await sails.sendNativeQuery(rawSQL, []);
        brands = rawBrands.rows;
      }

      /**if selection_type === 'individual_product'*/
      if (offerInfo.selection_type === 'individual_product') {

        let _where = {};
        _where.regular_offer_id = offerInfo.id;
        _where.product_deactivation_time = null;
        _where.deletedAt = null;
        const regularOfferedProducts = await RegularOfferProducts.find({where: _where});

        const productIds = regularOfferedProducts.map(data => {
          return data.product_id;
        });

        const rawSQL = `
        SELECT
              COUNT(products.id) AS number_of_products,
              brands.id,
              brands.name,
              brands.image
          FROM
              products
          LEFT JOIN brands ON products.brand_id = brands.id
          WHERE
              products.id IN (${productIds}) AND products.deleted_at IS NULL AND products.status = 2 AND products.approval_status = 2 AND brands.deleted_at IS NULL
          GROUP BY
              brand_id
          ORDER BY
              brands.frontend_position,
              COUNT(products.id)
          DESC
        `;
        const rawBrands = await sails.sendNativeQuery(rawSQL, []);
        brands = rawBrands.rows;
      }

      return res.status(200).json({
        success: true,
        message: 'successfully fetched all the brands in this offer',
        data: [brands, offerInfo]
      });

    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: 'Failed to fetch all the brands in this offer',
        error
      });
    }
  }

};

