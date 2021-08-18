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
const _ = require('lodash');
const xl = require('excel4node');
const {escapeExcel} = require('../../libs/helper');
const {columnsOfIndividualOfferProducts} = require('../../libs/offer');

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

      /** if (req.body):  means, true is sent as status of jhor */
      if (req.body) {
        let _where = {};

        _where.deletedAt = null;
        _where.force_stop = {'!=': 1};

        await AnonderJhorOffers.update({where: _where}).set({status: 1});
        let offers = await AnonderJhorOffers.find({where: _where});

        for (let index = 0; index < offers.length; index++) {
          await AnonderJhorOfferedProducts.update({anonder_jhor_offer_id: offers[index].id})
            .set({status: 1});
        }
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
    /*console.log('the bodty of : ', req.body);*/
    try {
      let body = {...req.body};

      let jhorData = {
        start_date: body.startDate,
        end_date: body.endDate,
        banner_image: body.banner_image ? body.banner_image : '',
        homepage_banner_image: body.homepage_banner_image ? body.homepage_banner_image : '',
        show_in_homepage: body.showHome,
        pay_by_sslcommerz: body.pay_by_sslcommerz === '1' ? 1 : 0,
        pay_by_bKash: body.pay_by_bKash === '1' ? 1 : 0,
        pay_by_offline: body.pay_by_offline === '1' ? 1 : 0,
        pay_by_cashOnDelivery: body.pay_by_cashOnDelivery === '1' ? 1 : 0,
        pay_by_nagad: body.pay_by_nagad === '1' ? 1 : 0,
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
        console.log('noe hre');
        anonderJhorOffer = await AnonderJhorOffers.updateOne({id: req.body.offerId})
          .set({status: req.body.event});

        await AnonderJhorOfferedProducts.update({anonder_jhor_offer_id: req.body.offerId}).set({status: req.body.event});
      } else {
        /** check time and change force status; */
        // if (presentTime > jhorOfferStartTime && presentTime < jhorOfferEndTime) {
        if (presentTime.isAfter(jhorOfferStartTime) && presentTime.isBefore(jhorOfferEndTime)) {
          anonderJhorOffer = await AnonderJhorOffers.updateOne({id: req.body.offerId})
            .set({status: req.body.event, force_stop: 1});

          await AnonderJhorOfferedProducts.update({anonder_jhor_offer_id: req.body.offerId}).set({status: req.body.event});
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
        await AnonderJhorOfferedProducts.update({anonder_jhor_offer_id: req.body.offerId}).set({status: 0});
      } else {
        anonderJhorOffer = await AnonderJhorOffers.updateOne({id: req.body.offerId})
          .set({force_stop: req.body.event, status: 1});
        await AnonderJhorOfferedProducts.update({anonder_jhor_offer_id: req.body.offerId}).set({status: 1});
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

      await AnonderJhorOfferedProducts.update({anonder_jhor_offer_id: req.body}).set({
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
    /*console.log('anonderjhor insert: body', req.body);*/
    try {
      let body = {...req.body};

      let offerData = {
        image: body.image,
        calculation_type: body.calculationType,
        discount_amount: body.discountAmount,
        start_date: body.offerStartDate,
        end_date: body.offerEndDate,
        /*category_id: body.categoryId,*/
        anonder_jhor_id: 1,
        status: 1,
        force_stop: 0,
        offer_name: body.offer_name
      };

      /*if (body.subCategoryId) {
        offerData.sub_category_id = body.subCategoryId;
      }

      if (body.subSubCategoryId) {
        offerData.sub_sub_category_id = body.subSubCategoryId;
      }*/

      let data = await AnonderJhorOffers.create(offerData).fetch();

      /** codes for saving the individual product to the table anonder_jhor_offered_products */
      let individualProductsIds = [];
      let individualProductsCalculations;
      let individualProductsAmounts;

      const codes = body.individuallySelectedCodes.split(',');

      const products = await Product.find({code: codes});
      let x = _.groupBy(products, 'code');

      if (codes && codes.length > 0 && products.length > 0) {
        codes.forEach(code => {
          individualProductsIds.push(x[code][0].id);
        });
      }

      individualProductsCalculations = body.individuallySelectedProductsCalculation.split(',');
      individualProductsAmounts = body.individuallySelectedProductsAmount.split(',');

      if (individualProductsIds && individualProductsIds.length > 0) {
        let offeredProducts = await AnonderJhorOfferedProducts.find({deletedAt: null});
        let offeredProductsIDS = offeredProducts.map(products => products.product_id);

        for (let id = 0; id < individualProductsIds.length; id++) {
          let product_id = parseInt(individualProductsIds[id], 10);
          let calculationType = individualProductsCalculations[id];
          let discountAmount = parseFloat(individualProductsAmounts[id]);

          if (product_id) {
            if (offeredProductsIDS.includes(product_id)) {
              await AnonderJhorOfferedProducts.update({product_id: product_id}).set({
                anonder_jhor_offer_id: data.id,
                calculation_type: calculationType,
                discount_amount: discountAmount,
                deletedAt: null,
                status: data.status
              });
            } else {
              await AnonderJhorOfferedProducts.create({
                anonder_jhor_offer_id: data.id,
                product_id: product_id,
                calculation_type: calculationType,
                discount_amount: discountAmount,
                status: data.status
              });
            }
          }
        }
      }

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
      }

      if (body.subCategoryId) {
        offerData.sub_category_id = body.subCategoryId;
      } else {
        offerData.sub_category_id = null;
      }

      const data = await AnonderJhorOffers.updateOne({id: body.id}).set(offerData);

      /** codes for saving the individual product to the table anonder_jhor_offered_products */
      let individualProductsIds = [];
      let individualProductsCalculations;
      let individualProductsAmounts;

      const codes = body.individuallySelectedCodes.split(',');

      const products = await Product.find({code: codes});
      let x = _.groupBy(products, 'code');

      if (codes && codes.length > 0 && products.length > 0) {
        codes.forEach(code => {
          individualProductsIds.push(x[code][0].id);
        });
      }

      individualProductsCalculations = body.individuallySelectedProductsCalculation.split(',');
      individualProductsAmounts = body.individuallySelectedProductsAmount.split(',');

      if (individualProductsIds && individualProductsIds.length > 0) {
        let offeredProducts = await AnonderJhorOfferedProducts.find({deletedAt: null});
        let offeredProductsIDS = offeredProducts.map(products => products.product_id);

        for (let id = 0; id < individualProductsIds.length; id++) {
          let product_id = parseInt(individualProductsIds[id], 10);
          let calculationType = individualProductsCalculations[id];
          let discountAmount = parseFloat(individualProductsAmounts[id]);

          if (product_id) {
            if (offeredProductsIDS.includes(product_id)) {
              await AnonderJhorOfferedProducts.update({product_id: product_id}).set({
                anonder_jhor_offer_id: data.id,
                calculation_type: calculationType,
                discount_amount: discountAmount,
                deletedAt: null,
                status: data.status
              });
            } else {
              await AnonderJhorOfferedProducts.create({
                anonder_jhor_offer_id: data.id,
                product_id: product_id,
                calculation_type: calculationType,
                discount_amount: discountAmount,
                status: data.status
              });
            }
          }
        }
      }

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

  getAnonderJhorInfo: async (req, res) => {
    try {
      await OfferService.anonderJhorOfferDurationCheck();

      let rawSQL = `SELECT * FROM anonder_jhor WHERE id = 1`;
      const anonderJhorRaw = await sails.sendNativeQuery(rawSQL, []);
      let anonderJhor = anonderJhorRaw.rows;

      res.status(200).json({
        success: true,
        message: 'Successfully fetched anonder jhor information',
        data: anonderJhor
      });
    } catch (error) {
      console.log('error: ', error);
      res.status(400).json({
        success: false,
        message: 'failed to fetched anonder jhor information',
        error
      });
    }
  },

  getWebAnonderJhorOfferById: async (req, res) => {
    try {
      await OfferService.anonderJhorOfferDurationCheck();

      let webJhorOfferedProducts;

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

      const requestedJorOffer = await AnonderJhorOffers.findOne({where: _where})
        .populate('category_id')
        .populate('sub_category_id')
        .populate('sub_sub_category_id');

      let _where1 = {};
      _where1.anonder_jhor_offer_id = req.query.id;
      _where1.deletedAt = null;
      _where1.status = 1;

      webJhorOfferedProducts = await AnonderJhorOfferedProducts.find({where: _where1})
        .sort(_sort)
        .populate('product_id');

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
           psi.product_total_price,

           psi.id,
           psi.product_id,
           products.price as originalPrice,
           products.vendor_price as vendorPrice,

           products.promo_price as discountPrice,
           psi.warehouse_id,

           psi.status,
           psi.\`date\`,
           psi.created_at,
           product_orders.status as order_status,
           product_orders.courier_charge as courier_charge,
           product_orders.total_price as total_price,


           product_orders.user_id,
           product_orders.created_at as orderCreatedAt,
           product_suborders.status as sub_order_status,

           payment.payment_type as paymentType,
           payment.transection_key as transactionKey,
           payment.payment_amount as paymentAmount,
           payment.created_at as transactionTime,

           CONCAT(customer.first_name, ' ',customer.last_name) as customer_name,
           CONCAT(orderChangedBy.first_name, ' ',orderChangedBy.last_name) as order_changed_by_name,
           CONCAT(subOrderChangedBy.first_name, ' ',subOrderChangedBy.last_name) as suborder_changed_by_name,

           customer.phone as customer_phone,

           warehouses.phone as vendor_phone,
           warehouses.address as vendor_address,
           payment_addresses.postal_code,
           payment_addresses.address,
           divArea.name as division_name,
           zilaArea.name as zila_name,
           upazilaArea.name as upazila_name,

           categories.name as categoryName,
           (product_orders.total_price - product_orders.paid_amount) as dueAmount
            `;
      if (isRegularIndividualProductOffer) {
        rawSQL += `,
            regular_offer_products.discount_amount AS discountAmount,
            regular_offer_products.calculation_type AS discountType
        `;
      }
      let fromSQL = `FROM
            product_suborder_items AS psi
        LEFT JOIN products ON psi.product_id = products.id
        LEFT JOIN product_suborders ON psi.product_suborder_id = product_suborders.id
        LEFT JOIN product_orders ON product_suborders.product_order_id = product_orders.id
        LEFT JOIN warehouses ON psi.warehouse_id = warehouses.id

        LEFT JOIN payments as payment ON  product_suborders.id  =   payment.suborder_id
        LEFT JOIN categories   ON categories.id = products.type_id
        LEFT JOIN users as customer ON customer.id = product_orders.user_id
        LEFT JOIN users as orderChangedBy ON orderChangedBy.id = product_orders.changed_by
        LEFT JOIN users as subOrderChangedBy ON subOrderChangedBy.id = product_suborders.changed_by
        LEFT JOIN payment_addresses ON product_orders.shipping_address = payment_addresses.id
        LEFT JOIN areas as divArea ON divArea.id = payment_addresses.division_id
        LEFT JOIN areas as zilaArea ON zilaArea.id = payment_addresses.zila_id
        LEFT JOIN areas as upazilaArea ON upazilaArea.id = payment_addresses.upazila_id

        `;
      if (isRegularIndividualProductOffer) {
        fromSQL += `
        LEFT JOIN regular_offer_products ON regular_offer_products.regular_offer_id = psi.offer_id_number
        `;
      }

      let whereSQL = ` WHERE psi.offer_type = ${offer_type} AND psi.offer_id_number = ${offer_id} `;
      if (isRegularIndividualProductOffer) {
        whereSQL += ` AND psi.product_id = regular_offer_products.product_id `;
      }
      whereSQL += ` ORDER BY product_orders.id ASC, psi.created_at DESC, psi.id  DESC,  payment.created_at  DESC `;

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
  },

  /** Method called to generate excel file with existing offered products in offer
   *  edit to see the existing offered products and to modify them if the user want */
  generateJhorOfferedExcel: async (req, res) => {
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
              ajop.calculation_type,
              ajop.discount_amount,
              products.code AS product_code
          FROM
              anonder_jhor_offered_products AS ajop
          LEFT JOIN products ON products.id = ajop.product_id
          WHERE
              ajop.anonder_jhor_offer_id = ${offerId} AND ajop.deleted_at IS NULL
      `;


      const rawResult = await sails.sendNativeQuery(rawSQL, []);

      const offerInfo = rawResult.rows;

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

};

