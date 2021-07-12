/**
 * OfferController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const {pagination} = require('../../libs/pagination');
const moment = require('moment');
const {uploadImages} = require('../../libs/helper');

module.exports = {
  /**Method for getting all the shop, brand and category */
  getAllOptions: async (req, res) => {
    try {
      /**checking if the options have the offer time or not*/
      await OfferService.offerDurationCheck();

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

      const files = await uploadImages(req.file('image'));

      if (files.length === 0) {
        return res.badRequest('No image was uploaded');
      }

      const newPath = files[0].fd.split(/[\\//]+/).reverse()[0];
      body.image = '/' + newPath;

      let smallImagePath = files[1].fd.split(/[\\//]+/).reverse()[0];
      body.small_image = '/' + smallImagePath;

      let bannerImagePath = files[2].fd.split(/[\\//]+/).reverse()[0];
      body.banner_image = '/' + bannerImagePath;

      let offerData = {};
      let individualProductsIds = [];
      let individualProductsCalculations;
      let individualProductsAmounts;

      if (body.selection_type === 'individual_product') {
        if (body.uploadType && body.uploadType === 'csv') {
          const codes = body.individuallySelectedCodes.split(',');
          const products = await Product.find({code: codes});
          products.forEach(product => {
            individualProductsIds.push(product.id);
          });
          console.log('individualProductsIds: ', individualProductsIds);
        } else {
          individualProductsIds = body.individuallySelectedProductsId.split(',');
        }

        individualProductsCalculations = body.individuallySelectedProductsCalculation.split(',');
        individualProductsAmounts = body.individuallySelectedProductsAmount.split(',');

        offerData = {
          title: body.title,
          image: {
            image: body.image,
            small_image: body.small_image,
            banner_image: body.banner_image,
          },
          selection_type: body.selection_type,
          description: body.description,
          start_date: body.offerStartDate,
          end_date: body.offerEndDate,
          show_in_homepage: body.showInHome
        };
      } else {
        offerData = {
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
      }

      if (body.frontend_position) {
        offerData.frontend_position = body.frontend_position;
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

      /** for individually selected products*/
      if (individualProductsIds && individualProductsIds.length > 0) {
        for (let id = 0; id < individualProductsIds.length; id++) {
          let product_id = parseInt(individualProductsIds[id], 10);
          let calculationType = individualProductsCalculations[id];
          let discountAmount = parseInt(individualProductsAmounts[id], 10);

          if (product_id) {
            let existedProduct = await RegularOfferProducts.findOne({
              product_id: product_id,
              product_deactivation_time: null
            });
            if (existedProduct) {
              await RegularOfferProducts.update({product_id: product_id}).set({
                regular_offer_id: data.id,
                calculation_type: calculationType,
                discount_amount: discountAmount
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
        for (let id = 0; id < regular_offer_product_ids.length; id++) {
          let product_id = parseInt(regular_offer_product_ids[id], 10);
          let existedProduct = await RegularOfferProducts.findOne({
            product_id: product_id,
            product_deactivation_time: null
          });
          if (existedProduct) {
            await RegularOfferProducts.update({product_id: product_id}).set({regular_offer_id: data.id});
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

  /**Method called for getting all regular offer data*/
  /**Model models/Offer.js*/
  allRegularOffer: async (req, res) => {
    try {
      await OfferService.offerDurationCheck();

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

  getRelatedOfferIndividualProducts: async (req, res) => {
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

  updateOffer: async (req, res) => {
    try {

      let body = {...req.body};

      console.log('body', body);

      let offer = await Offer.findOne({id: body.id});

      if (body.hasImage === 'true' || body.hasBannerImage === 'true' || body.hasSmallImage === 'true') {

        const files = await uploadImages(req.file('image'));

        console.log('files', files);

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

      }

      let offerData = {image: {}};
      if (body.image) {
        offerData.image.image = body.image;
      } else {
        offerData.image.image = offer.image && offer.image.image ? offer.image.image : '';
      }
      if (body.small_image) {
        offerData.image.small_image = body.small_image;
      } else {
        offerData.image.small_image = offer.image && offer.image.small_image ? offer.image.small_image : '';
      }
      if (body.banner_image) {
        offerData.image.banner_image = body.banner_image;
      } else {
        offerData.image.banner_image = offer.image && offer.image.banner_image ? offer.image.banner_image : '';
      }

      let individualProductsIds;
      let individualProductsCalculations;
      let individualProductsAmounts;

      if (body.selection_type === 'individual_product') {
        individualProductsIds = body.individuallySelectedProductsId.split(',');
        individualProductsCalculations = body.individuallySelectedProductsCalculation.split(',');
        individualProductsAmounts = body.individuallySelectedProductsAmount.split(',');

        offerData = {
          ...offerData,
          title: body.title,
          selection_type: body.selection_type,
          description: body.description,
          start_date: body.offerStartDate,
          end_date: body.offerEndDate,
          show_in_homepage: body.showInHome
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
          show_in_homepage: body.showInHome
        };
      }

      if (body.frontend_position) {
        offerData.frontend_position = body.frontend_position;
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
        for (let id = 0; id < individualProductsIds.length; id++) {
          let product_id = parseInt(individualProductsIds[id], 10);
          let calculationType = individualProductsCalculations[id];
          let discountAmount = parseInt(individualProductsAmounts[id], 10);

          if (product_id) {
            let existedProduct = await RegularOfferProducts.findOne({
              product_id: product_id,
              product_deactivation_time: null
            });
            if (existedProduct) {
              await RegularOfferProducts.updateOne({product_id: product_id}).set({
                regular_offer_id: data.id,
                calculation_type: calculationType,
                discount_amount: discountAmount
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

      /** TODO: need to improve the logic. Below code is not optimized in terms of db operation */
      if (regular_offer_product_ids && regular_offer_product_ids.length > 0) {
        for (let id = 0; id < regular_offer_product_ids.length; id++) {
          let product_id = parseInt(regular_offer_product_ids[id], 10);
          let existedProduct = await RegularOfferProducts.findOne({
            product_id: product_id
          });

          if (existedProduct) {
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
      await OfferService.offerDurationCheck();

      let _where = {};
      _where.deletedAt = null;
      _where.offer_deactivation_time = null;

      let webRegularOffers = await Offer.find({where: _where})
        .sort([
          {frontend_position: 'ASC'},
          {id: 'DESC'}
        ]);

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
    console.log('req.query.sortData: ', req.query.sortData);
    try {
      await OfferService.offerDurationCheck();

      let webRegularOfferedProducts;

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
        webRegularOfferedProducts = await Product.find({where: _where}).sort(_sort);
      }

      /**if selection_type === 'Brand wise'*/
      if (requestedOffer.selection_type === 'Brand wise') {
        let _where = {};
        _where.brand_id = requestedOffer.brand_id;
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
        _where.regular_offer_id = req.query.id;
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

        webRegularOfferedProducts = webRegularOfferedProducts.map(data => {
          return data.product_id;
        });


      }

      /**if selection_type === 'individual_product'*/
      if (requestedOffer.selection_type === 'individual_product') {
        let _where = {};
        _where.regular_offer_id = req.query.id;
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
      const finalCollectionOfProducts = await OfferService.getAllOfferedProducts();

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
      let codes = (req.query.codes).split(',');

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
  }

};

