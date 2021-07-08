/**
 * AnonderJhorController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const {imageUploadConfig} = require('../../libs/helper');
const {uploadImages} = require('../../libs/helper');
const {pagination} = require('../../libs/pagination');
const moment = require('moment');
const {REGULAR_OFFER_TYPE, INDIVIDUAL_PRODUCT_WISE_OFFER_SELECTION_TYPE} = require('../../libs/constants');

module.exports = {
  getAnonderJhor: async (req, res) => {
    try {
      let anonderJhorData = await AnonderJhor.findOne({id: 1});

      return res.status(200).json({
        success: true,
        message: 'AnonderJhor Data fetched successfully',
        data: anonderJhorData
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: 'Failed to get AnonderJhor Data',
        error
      });
    }
  },

  jhorActiveStatusChange: async (req, res) => {
    try {
      let anonderJhorData = await AnonderJhor.findOne({id: 1});

      const endDate = moment(anonderJhorData.end_date);
      const presentTime = moment();

      /*endDate < presentTime*/
      if (endDate.isSameOrBefore(presentTime)) {
        await AnonderJhor.updateOne({id: 1}).set({status: 0});
        return res.status(200).json({
          code: 'INVALID_ACTION',
          message: 'status can not be changed'
        });
      }

      if (req.body) {
        let _where = {};

        _where.deletedAt = null;
        _where.force_stop = {'!=': 1};

        await AnonderJhorOffers.update({where: _where}).set({status: 1});
      }

      const jhorStatus = await AnonderJhor.updateOne({id: 1}).set({status: req.body});

      return res.status(200).json({
        success: true,
        message: 'AnonderJhor status changed successfully',
        status: jhorStatus.status
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: 'Failed to change AnonderJhor status',
        error
      });
    }
  },

  updateAnonderJhor: async (req, res) => {
    try {

      let body = {...req.body};
      if (body.hasImage === 'true') {
        const files = await uploadImages(req.file('image'));
        if (files.length === 0) {
          return res.badRequest('No image was uploaded');
        }

        const newPath = files[0].fd.split(/[\\//]+/).reverse()[0];
        body.banner_image = '/' + newPath;

      }

      let jhorData = {
        start_date: body.startDate,
        end_date: body.endDate,
        banner_image: body.banner_image,
        status: 0
      };

      let data = await AnonderJhor.updateOne({id: 1}).set(jhorData);

      return res.status(200).json({
        success: true,
        message: 'Anonder Jhor has been updated successfully',
        data
      });

    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: 'Failed to update AnonderJhor Data',
        error
      });
    }
  },

  getAllAnonderJhorOffersData: async (req, res) => {
    try {
      await OfferService.anonderJhorOfferDurationCheck();

      let _pagination = pagination(req.query);

      let _where = {};
      _where.deletedAt = null;

      let allAnonderJhorOffersData = await AnonderJhorOffers.find({
        where: _where,
        limit: _pagination.limit,
        skip: _pagination.skip
      }).sort([
        {id: 'DESC'},
        {end_date: 'DESC'},
        {status: 'DESC'},
      ])
        .populate('category_id')
        .populate('sub_category_id')
        .populate('sub_sub_category_id');

      let totalAnonderJhorOffersData = await AnonderJhorOffers.count().where(_where);

      res.status(200).json({
        success: true,
        total: totalAnonderJhorOffersData,
        limit: _pagination.limit,
        skip: _pagination.skip,
        page: _pagination.page,
        message: 'All Anonder Jhor offers with pagination',
        data: allAnonderJhorOffersData
      });

    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: 'Failed to get all Anonder Jhor Offers Data',
        error
      });
    }
  },

  offerActiveStatusChange: async (req, res) => {
    try {
      await OfferService.anonderJhorOfferDurationCheck();

      const anonderJhorData = await AnonderJhor.findOne({id: 1});
      const presentTime = moment();

      const jhorOfferData = await AnonderJhorOffers.findOne({id: req.body.offerId});
      // let jhorOfferStartTime = jhorOfferData.start_date.getTime();
      // let jhorOfferEndTime = jhorOfferData.end_date.getTime();

      const jhorOfferStartTime = moment(jhorOfferData.start_date);
      const jhorOfferEndTime = moment(jhorOfferData.end_date);

      // if (presentTime > jhorOfferEndTime || anonderJhorData.status === 0 || jhorOfferData.force_stop === 1) {
      if (presentTime.isAfter(jhorOfferEndTime) || anonderJhorData.status === 0 || jhorOfferData.force_stop === 1) {
        return res.status(200).json({
          code: 'NOT_ALLOWED',
          message: 'status can not be changed'
        });
      }

      let anonderJhorOffer;

      if (req.body.event) {
        anonderJhorOffer = await AnonderJhorOffers.updateOne({id: req.body.offerId})
          .set({status: req.body.event});
      } else {
        /** check time and change force status; */
        // if (presentTime > jhorOfferStartTime && presentTime < jhorOfferEndTime) {
        if (presentTime.isAfter(jhorOfferStartTime) && presentTime.isBefore(jhorOfferEndTime)) {
          anonderJhorOffer = await AnonderJhorOffers.updateOne({id: req.body.offerId})
            .set({status: req.body.event, force_stop: 1});
        } else {
          anonderJhorOffer = await AnonderJhorOffers.updateOne({id: req.body.offerId})
            .set({status: req.body.event});
        }
      }


      res.status(200).json({
        success: true,
        message: 'Successfully updated offer status',
        status: anonderJhorOffer.status
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

  offerForceStop: async (req, res) => {
    try {
      await OfferService.anonderJhorOfferDurationCheck();

      let anonderJhorData = await AnonderJhor.findOne({id: 1});
      const presentTime = moment();
      const jhorOfferData = await AnonderJhorOffers.findOne({id: req.body.offerId});
      const jhorOfferEndTime = moment(jhorOfferData.end_date);

      // if (presentTime > jhorOfferEndTime || anonderJhorData.status === 0) {
      if (presentTime.isAfter(jhorOfferEndTime) || anonderJhorData.status === 0) {
        return res.status(200).json({
          code: 'NOT_ALLOWED',
          message: 'status can not be changed'
        });
      }

      /** when event value is true it means, request to force stop, value for force stop is 1 */
      let anonderJhorOffer;
      if (req.body.event) {
        anonderJhorOffer = await AnonderJhorOffers.updateOne({id: req.body.offerId})
          .set({force_stop: req.body.event, status: 0});
      } else {
        anonderJhorOffer = await AnonderJhorOffers.updateOne({id: req.body.offerId})
          .set({force_stop: req.body.event, status: 1});
      }

      res.status(200).json({
        success: true,
        message: 'Successfully updated offer status',
        status: anonderJhorOffer.status
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

  deleteAnonderJhorOffer: async (req, res) => {
    try {
      const anonderJhorOffer = await AnonderJhorOffers.updateOne({id: req.body}).set({
        status: 0,
        deletedAt: new Date()
      });

      return res.status(201).json({
        success: true,
        message: 'Successfully deleted an anonder jhor offer',
        anonderJhorOffer
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: 'Failed to delete an anonder jhor offer',
        error
      });
    }
  },

  anonderJhorOfferInsert: async (req, res) => {
    try {
      let body = {...req.body};
      if (body.hasImage === 'true') {
        const files = await uploadImages(req.file('image'));

        if (files.length === 0) {
          return res.badRequest('No image was uploaded');
        }

        const newPath = files[0].fd.split(/[\\//]+/).reverse()[0];

        body.image = '/' + newPath;
      }


      let offerData = {
        image: body.image,
        calculation_type: body.calculationType,
        discount_amount: body.discountAmount,
        start_date: body.offerStartDate,
        end_date: body.offerEndDate,
        category_id: body.categoryId,
        anonder_jhor_id: 1,
        status: 1,
        force_stop: 0
      };

      if (body.subCategoryId) {
        offerData.sub_category_id = body.subCategoryId;
      }

      if (body.subSubCategoryId) {
        offerData.sub_sub_category_id = body.subSubCategoryId;
      }

      let data = await AnonderJhorOffers.create(offerData).fetch();

      return res.status(200).json({
        success: true,
        message: 'Anonder jhor Offer has been created successfully',
        data
      });

    } catch (error) {
      console.log('error in insert offer: ', error);
      return res.status(400).json({
        success: false,
        message: 'Error in creating the Anonder jhor  offer',
        error
      });
    }
  },

  getAllCategories: async (req, res) => {
    try {
      let allCategories = await Category.find({type_id: 2, parent_id: 0, deletedAt: null});
      return res.status(200).json({
        success: true,
        message: 'all categories fetched successfully',
        data: allCategories
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: 'Failed to get all categories',
        error
      });
    }
  },

  getAllSubCategories: async (req, res) => {
    try {
      const allSubCategories = await Category.find({
        type_id: 2,
        parent_id: parseInt(req.query.parentId, 10),
        deletedAt: null
      });

      return res.status(200).json({
        success: true,
        message: 'all sub-categories fetched successfully',
        data: allSubCategories
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: 'Failed to get all sub-categories',
        error
      });
    }
  },

  getAllSubSubCategories: async (req, res) => {
    try {
      let allSubSubCategories = await Category.find({
        type_id: 2,
        parent_id: parseInt(req.query.parentId, 10),
        deletedAt: null
      });
      return res.status(200).json({
        success: true,
        message: 'all sub-sub-categories fetched successfully',
        data: allSubSubCategories
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: 'Failed to get all sub-sub-categories',
        error
      });
    }
  },

  getAnonderJhorOfferById: async (req, res) => {
    try {
      await OfferService.anonderJhorOfferDurationCheck();
      let anonderJhorOffer = await AnonderJhorOffers.findOne({id: req.query.id})
        .populate('category_id')
        .populate('sub_category_id')
        .populate('sub_sub_category_id');

      res.status(200).json({
        success: true,
        message: 'Anonder Jhor Offer data by id',
        anonderJhorOffer
      });
    } catch (error) {
      console.log('error in getAnonderJhorOfferById: ', error);
      res.status(400).json({
        success: false,
        message: 'failed to get Anonder Jhor offer by id',
        error
      });
    }
  },

  updateAnonderJhorOffer: async (req, res) => {
    try {
      let body = {...req.body};
      if (body.hasImage === 'true') {
        const files = await uploadImages(req.file('image'));
        if (files.length === 0) {
          return res.badRequest('No image was uploaded');
        }
        const newPath = files[0].fd.split(/[\\//]+/).reverse()[0];
        body.image = '/' + newPath;
      }

      let offerData = {
        image: body.image,
        calculation_type: body.calculationType,
        discount_amount: body.discountAmount,
        start_date: body.offerStartDate,
        end_date: body.offerEndDate,
        category_id: body.categoryId,
        anonder_jhor_id: 1,
        status: 1,
        force_stop: 0
      };

      if (body.subSubCategoryId) {
        offerData.sub_sub_category_id = body.subSubCategoryId;
        const subSubCat = await AnonderJhorOffers.findOne({
          sub_sub_category_id: body.subSubCategoryId,
          status: 1
        });
        if (subSubCat) {
          return res.status(200).json({
            code: 'INVALID_SUBSUBCAT',
            message: 'Subsub category already in another anonder jhor offer'
          });
        }
      } else {
        offerData.sub_sub_category_id = null;
      }

      if (body.subCategoryId) {
        offerData.sub_category_id = body.subCategoryId;
      } else {
        offerData.sub_category_id = null;
      }

      const data = await AnonderJhorOffers.updateOne({id: body.id}).set(offerData);

      return res.status(200).json({
        success: true,
        message: 'Anonder Jhor Offer updated successfully',
        data
      });

    } catch (error) {
      console.log('updateOffer error: ', error);
      res.status(400).json({
        success: false,
        message: 'Failed to update Anonder Jhor Offer',
        error
      });
    }
  },


  getAnonderJhorAndOffers: async (req, res) => {
    try {
      await OfferService.anonderJhorOfferDurationCheck();

      let anonderJhor = await AnonderJhor.findOne({id: 1});
      let jhorStartTime = anonderJhor.start_date;
      let jhorEndTime = anonderJhor.end_date;

      let _where = {};
      _where.deletedAt = null;
      _where.start_date = {'>=': jhorStartTime};
      _where.end_date = {'<=': jhorEndTime};
      _where.force_stop = {'!=': 1};

      let anonderJhorOffers;
      if (anonderJhor.status) {
        anonderJhorOffers = await AnonderJhorOffers.find({where: _where})
          .populate('category_id')
          .populate('sub_category_id')
          .populate('sub_sub_category_id');
      }

      res.status(200).json({
        success: true,
        message: 'All anonder jhor offers for the web',
        data: [anonderJhor, anonderJhorOffers]
      });
    } catch (error) {
      console.log('error: ', error);
      res.status(400).json({
        success: false,
        message: 'failed to get anonder offer for the web',
        error
      });
    }
  },

  getWebAnonderJhorOfferById: async (req, res) => {
    try {
      await OfferService.anonderJhorOfferDurationCheck();

      let webJhorOfferedProducts;

      let _where = {};
      _where.id = req.query.id;
      _where.deletedAt = null;

      const requestedJorOffer = await AnonderJhorOffers.findOne({where: _where})
        .populate('category_id')
        .populate('sub_category_id')
        .populate('sub_sub_category_id');

      let _where1 = {};
      _where1.status = 2;
      _where1.approval_status = 2;
      _where1.deletedAt = null;

      if (requestedJorOffer && requestedJorOffer.sub_sub_category_id) {
        _where1.subcategory_id = requestedJorOffer.sub_sub_category_id.id;
      } else if (requestedJorOffer && requestedJorOffer.sub_category_id) {
        _where1.category_id = requestedJorOffer.sub_category_id.id;
      } else if (requestedJorOffer && requestedJorOffer.category_id) {
        _where1.type_id = requestedJorOffer.category_id.id;
      }

      webJhorOfferedProducts = await Product.find({where: _where1});

      res.status(200).json({
        success: true,
        message: 'All regular offers for the web with related products data',
        data: [requestedJorOffer, webJhorOfferedProducts]
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

  generateOfferExcelById: async (req, res) => {
    try {
      let offer_type = parseInt(req.query.offer_type, 10);
      let offer_id = parseInt(req.query.offer_id, 10);
      let isRegularIndividualProductOffer = false;
      if (offer_type == REGULAR_OFFER_TYPE) {
        let offerInfo = await Offer.findOne({id: offer_id, deletedAt: null});
        if (offerInfo.selection_type === INDIVIDUAL_PRODUCT_WISE_OFFER_SELECTION_TYPE) {
          isRegularIndividualProductOffer = true;
        }
      }
      let rawSQL = `
      SELECT
            product_orders.id AS order_id,
            product_suborders.id as suborder_id,
            products.name AS product_name,
            products.code AS product_code,
            warehouses.name AS warehouse_name,
            psi.product_quantity,
            psi.product_total_price
            `;
      if (isRegularIndividualProductOffer) {
        rawSQL += `,
            regular_offer_products.discount_amount AS discountAmount
        `;
      }
      let fromSQL = `FROM
            product_suborder_items AS psi
        LEFT JOIN products ON psi.product_id = products.id
        LEFT JOIN product_suborders ON psi.product_suborder_id = product_suborders.id
        LEFT JOIN product_orders ON product_suborders.product_order_id = product_orders.id
        LEFT JOIN warehouses ON psi.warehouse_id = warehouses.id`;
      if (isRegularIndividualProductOffer) {
        fromSQL += `
        LEFT JOIN regular_offer_products ON regular_offer_products.regular_offer_id = psi.offer_id_number
        `;
      }

      let whereSQL = `
      WHERE psi.offer_type = ${offer_type} AND psi.offer_id_number = ${offer_id} ORDER BY product_orders.id
        `;

      const offerOrders = await sails.sendNativeQuery(rawSQL + fromSQL + whereSQL, []);

      let offerInfo;
      if (offer_type === 1) {
        offerInfo = await Offer.findOne({id: offer_id})
          .populate('category_id')
          .populate('subCategory_Id')
          .populate('subSubCategory_Id');
      } else {
        offerInfo = await AnonderJhorOffers.findOne({id: offer_id})
          .populate('category_id')
          .populate('sub_category_id')
          .populate('sub_sub_category_id');
      }

      return res.status(200).json({
        success: true,
        message: 'Offer excel Data fetched successfully',
        data: [offerOrders.rows, offerInfo]
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: 'Failed to get offer excel Data',
        error
      });
    }
  }

};

