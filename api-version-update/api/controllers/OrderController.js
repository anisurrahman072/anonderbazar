/**
 * OrderController
 *
 * @description :: Server-side logic for managing orders
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const moment = require('moment');
const Promise = require('bluebird');
const _ = require('lodash');
const {ORDER_STATUSES} = require('../../libs/orders');
const {getPaymentService} = require('../../libs/paymentMethods');
const {getGlobalConfig} = require('../../libs/helper');
const {getAuthUser} = require('../../libs/helper');
const {pagination} = require('../../libs/pagination');
const {asyncForEach} = require('../../libs/helper');
const {cashOnDeliveryNotAllowedForCategory} = require('../../config/softbd');
const logger = require('../../libs/softbd-logger').Logger;
const {
  CANCELED_ORDER,
  PARTIAL_ORDER_TYPE,
  CASHBACK_PAYMENT_TYPE,
  PAYMENT_STATUS_NA,
  PAYMENT_STATUS_PAID,
  REJECTED_PAYMENT_APPROVAL_STATUS,
  APPROVED_PAYMENT_APPROVAL_STATUS,
  CUSTOMER_USER_GROUP_NAME,
  REGULAR_OFFER_TYPE,
  ANONDER_JHOR_OFFER_TYPE
} = require('../../libs/constants');
const {globalSmsFlag} = require('../../config/smsFlag.js');
const {performance} = require('perf_hooks');

module.exports = {
  findOne: async (req, res) => {
    try {
      const time1 = performance.now();

      const orders = await Order.findOne({id: req.param('id')})
        .populate('user_id')
        .populate('billing_address')
        .populate('shipping_address')
        .populate('payment')
        .populate('couponProductCodes', {deletedAt: null})
        .populate('suborders', {deletedAt: null});

      console.log('orders rouzex', orders);

      const authUser = getAuthUser(req);

      if (authUser.group_id.name == CUSTOMER_USER_GROUP_NAME && orders.user_id.id != authUser.id) {
        return res.status(400).json({
          success: false,
          code: 'userIdMissMatched',
          message: 'Yo are only authorized to see your orders Invoice!'
        });
      }

      const time2 = performance.now();
      sails.log.debug(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.status(200).json(orders);

    } catch (error) {
      console.log('Error', error);
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      return res.status(400).json({
        message: false, error
      });
    }
  },

  getOrderInvoiceData: async (req, res) => {
    try {
      const time1 = performance.now();

      let orderId = req.query.orderId;
      /** Fetch order details */
      const orders = await Order.findOne({id: orderId})
        .populate('user_id')
        .populate('billing_address')
        .populate('shipping_address')
        .populate('payment')
        .populate('couponProductCodes', {deletedAt: null})
        .populate('suborders', {deletedAt: null});

      console.log('orders: ', orders);

      const authUser = getAuthUser(req);

      if (authUser.group_id.name == CUSTOMER_USER_GROUP_NAME && orders.user_id.id != authUser.id) {
        return res.status(400).json({
          success: false,
          code: 'userIdMissMatched',
          message: 'Yo are only authorized to see your orders Invoice!'
        });
      }
      /** Fetch order details. END */


      /** Fetch global config data */
      let configData = await GlobalConfigs.find({
        deletedAt: null
      });
      /** Fetch global config data. END */


      /** Fetch all payments log for the given order ID */
      let payments = await Payment.find({
        order_id: orderId, deletedAt: null
      });
      /** Fetch all payments log for the given order ID. END */

      const time2 = performance.now();
      sails.log.debug(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.status(200).json({
        success: true,
        message: 'Successfully fetched all data',
        orders,
        configData,
        payments
      });
    }
    catch (error){
      console.log('Error occurred while fetching order invoice data', error);
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      return res.status(400).json({
        message: false, error
      });
    }
  },

  index: (req, res) => {
    try {
      const time1 = performance.now();

      const time2 = performance.now();
      sails.log.debug(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.json({message: 'Not Authorized'});
    } catch (error) {
      console.log(error);
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      return res.json({error: error});
    }
  }, // destroy a row
  destroy: async (req, res) => {
    try {
      const time1 = performance.now();

      const order = await Order.updateOne({id: req.param('id')}).set({deletedAt: new Date()});
      const time2 = performance.now();
      sails.log.debug(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.status(200).json(order);
    } catch (error) {
      console.log(error);
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      return res.status(error.status).json({error: error});
    }
  },

  //Method called for creating a custom order data from frontend
  //Model models/Order.js,models/SubOrder.js,models/SuborderItem.js,models/PaymentAddress.js
  placeOrderForCashOnDelivery: async function (req, res) {

    try {
      const time1 = performance.now();

      const authUser = getAuthUser(req);

      let globalConfigs = await getGlobalConfig();

      let cart = await Cart.findOne({
        user_id: authUser.id, deletedAt: null
      });

      if (!cart) {
        return res.badRequest('No Cart Found!');
      }

      let cartItems = await CartItem.find({
        cart_id: cart.id, deletedAt: null
      })
        .populate('cart_item_variants')
        .populate('product_id');

      let onlyCouponProduct = false;
      let paymentMethodNotAllowed = false;
      if (cartItems && cartItems.length > 0) {
        const couponProductFound = cartItems.filter((cartItem) => {
          return cartItem.product_id && !!cartItem.product_id.is_coupon_product;
        });

        const notAllowedProductFound = cartItems.filter((cartItem) => {
          // eslint-disable-next-line eqeqeq
          return cartItem.product_id && cartItem.product_id.subcategory_id == cashOnDeliveryNotAllowedForCategory;
        });

        onlyCouponProduct = couponProductFound && couponProductFound.length > 0;
        paymentMethodNotAllowed = notAllowedProductFound && notAllowedProductFound.length > 0;
      }

      if (onlyCouponProduct || paymentMethodNotAllowed) {
        return res.status(422).json({
          message: 'Payment method is invalid for this particular order.'
        });
      }

      const {
        order, orderForMail, subordersTemp
      } = await sails.getDatastore()
        .transaction(async (db) => {

          let courierCharge = 0;

          if (req.param('shipping_address')) {
            if (!req.param('shipping_address').id || req.param('shipping_address').id === '') {

              let shippingAddres = await PaymentAddress.create({
                user_id: req.param('user_id'),
                first_name: req.param('shipping_address').firstName,
                last_name: req.param('shipping_address').lastName,
                address: req.param('shipping_address').address,
                country: req.param('shipping_address').address,
                phone: req.param('shipping_address').phone,
                postal_code: req.param('shipping_address').postCode,
                upazila_id: req.param('shipping_address').upazila_id,
                zila_id: req.param('shipping_address').zila_id,
                division_id: req.param('shipping_address').division_id,
                status: 1
              }).fetch().usingConnection(db);
              req.param('shipping_address').id = shippingAddres.id;

            }
            // eslint-disable-next-line eqeqeq
            courierCharge = req.body.courierCharge;
          } else {
            courierCharge = globalConfigs.outside_dhaka_charge;
          }

          let {
            grandOrderTotal, totalQty
          } = await PaymentService.calcCartTotal(cart, cartItems);

          grandOrderTotal += courierCharge;

          /*.................Billing Address....................*/
          if (req.param('billing_address') && (!req.param('billing_address').id || req.param('billing_address').id === '') && req.param('is_copy') === false) {
            let paymentAddress = await PaymentAddress.create({
              user_id: req.param('user_id'),
              first_name: req.param('billing_address').firstName,
              last_name: req.param('billing_address').lastName,
              address: req.param('billing_address').address,
              country: req.param('billing_address').address,
              phone: req.param('billing_address').phone,
              postal_code: req.param('billing_address').postCode,
              upazila_id: req.param('billing_address').upazila_id,
              zila_id: req.param('billing_address').zila_id,
              division_id: req.param('billing_address').division_id,
              status: 1
            }).fetch().usingConnection(db);
            req.param('billing_address').id = paymentAddress.id;

          } else if (req.param('is_copy') === true) {
            req.param('billing_address').id = req.param('shipping_address').id;
          }

          /** Create  order from cart........................START...........................*/

          let order = await Order.create({
            user_id: req.param('user_id'),
            cart_id: cart.id,
            total_price: grandOrderTotal,
            total_quantity: totalQty,
            billing_address: req.param('billing_address').id,
            shipping_address: req.param('shipping_address').id,
            status: 1,
            courier_charge: courierCharge,
            courier_status: 1,
          }).fetch().usingConnection(db);

          /** Get unique warehouse Id for suborder................START.........................*/

          let uniqueTempWarehouses = _.uniqBy(cartItems, 'product_id.warehouse_id');

          let uniqueWarehouseIds = uniqueTempWarehouses.map(o => o.product_id.warehouse_id);

          /** get unique warehouse Id for suborder..................END.........................*/

          let subordersTemp = [];

          let i = 0; // i init for loop

          let allOrderedProductsInventory = [];

          for (i = 0; i < uniqueWarehouseIds.length; i++) {
            let thisWarehouseID = uniqueWarehouseIds[i];

            let cartItemsTemp = cartItems.filter(asset => asset.product_id.warehouse_id === thisWarehouseID);

            let suborderTotalPrice = _.sumBy(cartItemsTemp, 'product_total_price');
            let suborderTotalQuantity = _.sumBy(cartItemsTemp, 'product_quantity');

            let suborder = await Suborder.create({
              product_order_id: order.id,
              warehouse_id: uniqueWarehouseIds[i],
              total_price: suborderTotalPrice,
              total_quantity: suborderTotalQuantity,
              status: 1
            }).fetch().usingConnection(db);

            let suborderItemsTemp = [];
            for (let k = 0; k < cartItemsTemp.length; k++) {
              let thisCartItem = cartItemsTemp[k];

              let newSuborderItemPayload = {
                product_suborder_id: suborder.id,
                product_id: thisCartItem.product_id.id,
                warehouse_id: thisCartItem.product_id.warehouse_id,
                product_quantity: thisCartItem.product_quantity,
                product_total_price: thisCartItem.product_total_price,
                status: 1
              };

              const orderedProductInventory = {
                product_id: thisCartItem.product_id.id,
                ordered_quantity: thisCartItem.product_quantity,
                existing_quantity: thisCartItem.product_id.quantity
              };

              let newEndDate = new Date();
              newEndDate.setDate(new Date(new Date(order.createdAt).getTime() + ((thisCartItem.product_id.produce_time * thisCartItem.product_quantity) / 60 / 8) * 86400000).getDate() + 1);

              let suborderItem = await SuborderItem.create(newSuborderItemPayload).fetch().usingConnection(db);

              let suborderItemVariantsTemp = [];

              if (thisCartItem.cart_item_variants.length > 0) {

                for (let j = 0; j < thisCartItem.cart_item_variants.length; j++) {

                  let thisCartItemVariant = thisCartItem.cart_item_variants[j];

                  let newSuborderItemVariantPayload = {
                    product_suborder_item_id: suborderItem.id,
                    product_id: thisCartItemVariant.product_id,
                    variant_id: thisCartItemVariant.variant_id,
                    warehouse_variant_id: thisCartItemVariant.warehouse_variant_id,
                    product_variant_id: thisCartItemVariant.product_variant_id
                  };

                  if (typeof orderedProductInventory.variantPayload === 'undefined') {
                    orderedProductInventory.variantPayload = [];
                  }

                  orderedProductInventory.variantPayload.push({
                    product_id: thisCartItemVariant.product_id,
                    variant_id: thisCartItemVariant.variant_id,
                    warehouse_variant_id: thisCartItemVariant.warehouse_variant_id,
                  });

                  let suborderItemVariant = await SuborderItemVariant.create(newSuborderItemVariantPayload).fetch().usingConnection(db);
                  suborderItemVariantsTemp.push(suborderItemVariant);
                }
              }

              let d = Object.assign({}, suborderItem);
              d.suborderItemVariants = suborderItemVariantsTemp;
              suborderItemsTemp.push(d);

              allOrderedProductsInventory.push(orderedProductInventory);
            }

            let d = Object.assign({}, suborder);
            d.suborderItems = suborderItemsTemp;
            subordersTemp.push(d);
          }

          /** .............Payment Section ........... */

          let paymentTemp = [];

          for (let i = 0; i < subordersTemp.length; i++) {
            let paymentType = await Payment.create({
              user_id: req.param('user_id'),
              order_id: order.id,
              suborder_id: subordersTemp[i].id,
              payment_type: req.param('paymentType'),
              payment_amount: subordersTemp[i].total_price,
              status: 1
            }).fetch().usingConnection(db);

            paymentTemp.push(paymentType);
          }

          let orderForMail = await Order.findOne({id: order.id})
            .populate('user_id')
            .populate('shipping_address')
            .usingConnection(db);

          let allOrderedProducts = [];
          for (let i = 0; i < subordersTemp.length; i++) {
            let items = await SuborderItem.find({where: {product_suborder_id: subordersTemp[i].id}})
              .populate('product_id')
              .usingConnection(db);

            for (let index = 0; index < items.length; index++) {
              allOrderedProducts.push(items[index]);
            }
          }

          orderForMail.orderItems = allOrderedProducts;

          await Cart.update({id: cart.id}, {deletedAt: new Date()}).usingConnection(db);

          for (let i = 0; i < cartItems.length; i++) {
            await CartItem.update({id: cartItems[i].id}, {deletedAt: new Date()}).usingConnection(db);
            await CartItemVariant.update({cart_item_id: cartItems[i].id}, {deletedAt: new Date()}).usingConnection(db);
          }

          for (let i = 0; i < allOrderedProductsInventory.length; i++) {
            const thisInventoryProd = allOrderedProductsInventory[i];
            const quantityToUpdate = parseFloat(thisInventoryProd.existing_quantity) - parseFloat(thisInventoryProd.ordered_quantity);
            await Product.update({id: thisInventoryProd.product_id}, {quantity: quantityToUpdate}).usingConnection(db);
          }
          return {
            order, orderForMail, subordersTemp
          };
        });

      try {
        const smsPhone = authUser.phone;
        let smsText = `anonderbazar.com এ আপনার অর্ডারটি সফলভাবে গৃহীত হয়েছে। অর্ডার নাম্বার: ${order.id}`;
        console.log('smsTxt', smsText);
        SmsService.sendingOneSmsToOne([smsPhone], smsText);
      } catch (err) {
        console.log('SMS sending error');
        console.log(err);
      }

      try {
        EmailService.orderSubmitMail(orderForMail);
      } catch (err) {
        console.log('Email Sending Error', err);
      }

      // End /Delete Cart after submitting the order
      let d = Object.assign({}, order);
      d.suborders = subordersTemp;

      const time2 = performance.now();
      sails.log.debug(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.ok({
        order: d
      });

    } catch (finalError) {
      console.log('finalError', finalError);
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      return res.status(400).json({
        message: 'There was a problem in processing the order.', additionalMessage: finalError.message
      });

    }

  }, //Method called for creating a custom order data from frontend with sslcommerz
  //Model models/Order.js,models/SubOrder.js,models/SuborderItem.js,models/PaymentAddress.js
  //,models/Cart.js,models/CartItem.js,models/Payment.js, models/SuborderItemVariant.js
  placeOrder: async function (req, res) {
    /*console.log('rozuiex n placeorder: ');*/

    try {
      const time1 = performance.now();

      const authUser = getAuthUser(req);
      const globalConfigs = await getGlobalConfig();

      let cart = await PaymentService.getCart(authUser.id);
      let cartItems = await PaymentService.getCartItems(cart.id);

      /** Cart items can only be exists in a single offer.
       * Even a regular product can't be ordered with a offer product. START. */

      await PaymentService.checkOfferProductsFromCartItems(cartItems);

      /** Cart items can only be exists in a single offer.
       * Even a regular product can't be ordered with a offer product. END. */

      const shippingAddress = await PaymentService.getShippingAddress(authUser, req);
      const billingAddress = await PaymentService.getBillingAddress(authUser, req, shippingAddress);

      if (_.isNull(shippingAddress) || _.isEmpty(shippingAddress)) {
        throw new Error('No shipping address has been provided.');
      }

      logger.orderLog(authUser.id, '######## PLACING ORDER ########');
      logger.orderLog(authUser.id, 'Payment Method: ', req.param('paymentType'));
      console.log('Payment Method', req.param('paymentType'));
      logger.orderLog(authUser.id, 'Order Body: ', req.body);
      logger.orderLog(authUser.id, 'Order - shipping_address: ', shippingAddress);
      logger.orderLog(authUser.id, 'Order - billing_address: ', billingAddress);

      let paymentGatewayService = getPaymentService(req.param('paymentType'), req.body.order_type);

      let response = await paymentGatewayService.placeOrder(authUser, req.body, req.allParams(), {
        paymentType: req.param('paymentType')
      }, {
        billingAddress, shippingAddress
      }, globalConfigs, cart, cartItems, req.file);
      const time2 = performance.now();
      sails.log.debug(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.status(200).json(response);

    } catch (finalError) {
      console.log(finalError);
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);
      logger.orderLogAuth(req, finalError);

      return res.status(400).json({
        message: 'There was a problem in processing the order.', additionalMessage: finalError.message
      });
    }
  },

  allOrders: async (req, res) => {
    try {
      const time1 = performance.now();

      let _pagination = pagination(req.query);

      const orderQuery = Promise.promisify(Order.getDatastore().sendNativeQuery);

      let rawSelect = `
      SELECT
            orders.id as id,
            orders.total_quantity,
            orders.total_price,
            orders.paid_amount,
            orders.status,
            orders.created_at as createdAt,
            orders.updated_at as updatedAt,
            orders.payment_status as paymentStatus,
            orders.order_type as orderType,
            GROUP_CONCAT(payment.payment_type) as paymentType,
            GROUP_CONCAT(COALESCE(payment.transection_key, '') SEPARATOR ', ') as transactionKey,
            GROUP_CONCAT(payment.payment_amount) as paymentAmount,
            GROUP_CONCAT(payment.created_at) as transactionTime,
            payment.payment_type,
            payment_addresses.postal_code,
            payment_addresses.address,
            divArea.name as division_name,
            zilaArea.name as zila_name,
            upazilaArea.name as upazila_name,
            CONCAT(users.first_name, \' \', users.last_name) as  full_name,
            CONCAT(changedBy.first_name, \' \', changedBy.last_name) as changedByName
      `;

      let fromSQL = `
            FROM
              product_orders as orders
              LEFT JOIN users as changedBy ON orders.changed_by = changedBy.id
              LEFT JOIN users as users ON orders.user_id = users.id
              LEFT JOIN payments as payment ON  orders.id  =   payment.order_id
              LEFT JOIN payment_addresses ON orders.shipping_address = payment_addresses.id
              LEFT JOIN areas as divArea ON divArea.id = payment_addresses.division_id
              LEFT JOIN areas as zilaArea ON zilaArea.id = payment_addresses.zila_id
              LEFT JOIN areas as upazilaArea ON upazilaArea.id = payment_addresses.upazila_id
        `;

      let _where = ' WHERE orders.deleted_at IS NULL ';

      if (req.query.status) {
        _where += ` AND orders.status = ${req.query.status} `;
      }

      if (req.query.payment_status) {
        // eslint-disable-next-line eqeqeq
        if (req.query.payment_status == PAYMENT_STATUS_PAID) {
          _where += ` AND (orders.payment_status =  ${req.query.payment_status} OR orders.payment_status = ${PAYMENT_STATUS_NA}) `;
        } else {
          _where += ` AND orders.payment_status = ${req.query.payment_status} `;
        }
      }

      if (req.query.order_type) {
        _where += ` AND orders.order_type = ${req.query.order_type} `;
      }

      if (req.query.payment_type) {
        _where += ` AND payment.payment_type = '${req.query.payment_type}' `;
      }

      console.log('_where: ', _where);

      if (req.query.orderNumber) {
        _where += ` AND orders.id = ${req.query.orderNumber} `;
      }
      if (req.query.name) {
        _where += ` AND LOWER(users.first_name) LIKE '%${req.query.status.toLowerCase()}%' `;
      }
      if (req.query.customerName) {
        const customerName = req.query.customerName.toLowerCase();
        _where += ` AND ( LOWER(users.first_name) LIKE '%${customerName}%' OR LOWER(users.last_name) LIKE '%${customerName}%') `;
      }

      if (req.query.created_at) {
        let created_at = JSON.parse(req.query.created_at);
        let from = moment(created_at.from).format('YYYY-MM-DD HH:mm:ss');
        let to = moment(created_at.to).format('YYYY-MM-DD HH:mm:ss');
        _where += ` AND orders.created_at >= '${from}' AND orders.created_at <= '${to}' `;
      }

      const totalOrderRaw = await orderQuery('SELECT COUNT(*) as totalCount FROM product_orders as orders WHERE orders.deleted_at IS NULL', []);
      _where += ' GROUP BY orders.id  ORDER BY orders.created_at DESC   ';
      let totalOrder = 0;
      let orders = [];

      if (totalOrderRaw && totalOrderRaw.rows && totalOrderRaw.rows.length > 0) {
        totalOrder = totalOrderRaw.rows[0].totalCount;
        _pagination.limit = _pagination.limit ? _pagination.limit : totalOrder;

        let limitSQL = ` LIMIT ${_pagination.skip}, ${_pagination.limit} `;

        const rawResult = await orderQuery(rawSelect + fromSQL + _where + limitSQL, []);

        orders = rawResult.rows;
      }

      const time2 = performance.now();
      sails.log.debug(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.status(200).json({
        success: true,
        total: totalOrder,
        limit: _pagination.limit,
        skip: _pagination.skip,
        page: _pagination.page,
        message: 'Get All orders with pagination',
        data: orders
      });

    } catch (error) {
      console.log('error', error);
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      let message = 'Error in getting all orders with pagination';
      return res.status(400).json({
        success: false, message, error
      });
    }
  }, //Method called for getting all order data
  //Model models/Order.js,models/SubOrder.js,models/SuborderItem.js, models/SuborderItemVariant.js
  getAllOrder: async (req, res) => {
    try {
      const time1 = performance.now();

      /* WHERE condition for .......START.....................*/
      let _where = {};
      _where.deletedAt = null;
      console.log('req.query.created_at', req.query.created_at);

      if (req.query.created_at) {
        let created_at = JSON.parse(req.query.created_at);
        /*        let from = moment((moment().format('YYYY-MM-DD'))).toISOString();
                let to = moment((moment(created_at.to).format('YYYY-MM-DD'))).toISOString();*/
        _where.createdAt = {'>=': created_at.from, '<=': created_at.to};
      }
      if (req.query.courier_status) {
        _where.courier_status = req.query.courier_status;
      }

      if (req.query.status) {
        _where.status = req.query.status;
      }

      /* WHERE condition..........END................*/

      console.log('_where', _where);

      let orders = await Order.find({where: _where, sort: [{createdAt: 'DESC'}]})
        .populate('billing_address')
        .populate('shipping_address')
        .populate('couponProductCodes', {deletedAt: null})
        .populate('payment')
        .populate('suborders');

      await asyncForEach(orders, async element => {

        if (typeof element.suborders !== 'undefined' && Array.isArray(element.suborders) && element.suborders.length > 0) {
          element.suborders[0].items = await SuborderItem.find({where: {product_suborder_id: element.suborders[0].id}})
            .populate('product_id')
            .populate('warehouse_id')
            .populate('suborderItemVariants', {deletedAt: null})
            .populate('product_suborder_id');

          if (element.suborders[0].items && Array.isArray(element.suborders[0].items) && element.suborders[0].items.length > 0) {

            await asyncForEach(element.suborders[0].items, async item => {
              let varientitems = [];

              await asyncForEach(item.suborderItemVariants, async varientitem => {
                varientitems.push(await SuborderItemVariant.find({product_suborder_item_id: item.id})
                  .populate('product_id')
                  .populate('variant_id')
                  .populate('product_suborder_item_id')
                  .populate('warehouse_variant_id')
                  .populate('product_variant_id'));
              });
              item.suborderItemVariants = varientitems;
            });
          }
        }
      });

      const time2 = performance.now();
      sails.log.debug(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.status(200).json(orders);

    } catch (error) {
      console.log(error);
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      let message = 'Error in getting all orders with pagination';
      res.status(400).json({
        success: false, message, error
      });
    }
  }, //Method called for updating order
  update: async (req, res) => {
    console.log('The body is: ', req.body);
    try {
      const time1 = performance.now();

      let updatedOrder = await Order.updateOne({
        deletedAt: null, id: req.param('id')
      }).set(req.body);

      let paymentDetail = await Payment.find({
        order_id: updatedOrder.id, deletedAt: null
      });

      if (paymentDetail.length > 0 && paymentDetail[0].payment_type === 'CashBack' && req.body.status === ORDER_STATUSES.canceled) {
        let returnCashbackAmount = updatedOrder.total_price;

        let prevCashbackDetail = await CouponLotteryCashback.findOne({
          deletedAt: null, user_id: paymentDetail[0].user_id
        });

        await CouponLotteryCashback.updateOne({
          user_id: paymentDetail[0].user_id
        }).set({
          amount: prevCashbackDetail.amount + returnCashbackAmount
        });
      }

      if(globalSmsFlag.ORDER_STATUS_CHANGE_SEND_SMS && req.body.status && req.param('id')){
        const customer = await User.findOne({id: updatedOrder.user_id});
        await PaymentService.sendSmsForOrderStatusChange({
          orderId:req.param('id'),
          status: req.body.status
        },  customer);
      }

      const time2 = performance.now();
      sails.log.debug(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.status(200).json({
        success: true, message: 'Successfully updated status of order', data: updatedOrder
      });
    } catch (error) {
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      return res.status(400).json({
        success: false, message: 'Error occurred while updating Order'
      });
    }
  },

  updatePaymentStatus: async (req, res) => {
    try {
      const time1 = performance.now();

      let order = await Order.findOne({
        id: req.param('id'),
        deletedAt: null
      });

      if (order.order_type == PARTIAL_ORDER_TYPE) {
        return res.status(200).json({
          success: false, message: 'Use Order => Financial Transaction grid to update Partial Orders payment status.'
        });
      }

      let _set = {
        paid_amount: 0,
        payment_status: req.body.payment_status,
        changed_by: req.body.changed_by,
        status: ORDER_STATUSES.canceled
      };

      let payment_set = {
        approval_status: REJECTED_PAYMENT_APPROVAL_STATUS
      };

      if (req.body.payment_status == PAYMENT_STATUS_PAID) {
        _set.paid_amount = order.total_price;
        _set.status = ORDER_STATUSES.processing;

        payment_set.approval_status = APPROVED_PAYMENT_APPROVAL_STATUS;
      }

      let updatedOrder = await Order.updateOne({
        id: req.param('id'),
        deletedAt: null
      }).set(_set);

      await Payment.update({
        order_id: req.param('id'),
        deletedAt: null
      }).set(payment_set);

      let userDetail = await User.find({
        id: updatedOrder.user_id, deletedAt: null
      });

      let shippingAddresses = await ShippingAddress.find({
        user_id: userDetail.id, deletedAt: null
      });

      console.log('The set are: ', payment_set, _set);
      // await PaymentService.sendSms(userDetail[0], updatedOrder, [], shippingAddresses[0]);

      const time2 = performance.now();
      sails.log.debug(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.status(200).json({
        success: true, message: 'Successfully updated payment status of order', data: updatedOrder
      });
    } catch (error) {
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      return res.status(400).json({
        success: false, message: 'Error occurred while updating payment status'
      });
    }
  },

  deleteOrder: async (req, res) => {
    try {
      const time1 = performance.now();

      let updatedOrder = await Order.updateOne({
        deletedAt: null, id: req.param('id')
      }).set({
        status: CANCELED_ORDER
      });

      let subOrders = await Suborder.update({
        product_order_id: req.param('id'), deletedAt: null
      }).set({
        status: CANCELED_ORDER
      }).fetch();

      console.log('all suborders', subOrders);

      let len = subOrders.length;
      for (let i = 0; i < len; i++) {
        let subOrderItem = await SuborderItem.find({
          product_suborder_id: subOrders[i].id, deletedAt: null
        });

        let subItemLen = subOrderItem.length;
        for (let index = 0; index < subItemLen; index++) {
          let product = await Product.findOne({
            id: subOrderItem[index].product_id, deletedAt: null
          });

          let newQuantity = product.quantity + subOrderItem[index].product_quantity;
          await Product.updateOne({
            id: product.id, deletedAt: null
          }).set({
            quantity: newQuantity
          });
        }
      }

      const time2 = performance.now();
      sails.log.debug(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.status(200).json({
        success: true, message: 'successfully deleted the order.', order: updatedOrder
      });
    } catch (error) {
      console.log(error);
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      return res.status(400).json({
        success: false, message: 'Error occurred while deleting the order. ', error
      });
    }
  },

  getCancelledOrder: async (req, res) => {
    let params = req.allParams();

    try {
      const time1 = performance.now();

      let paginate = pagination(params);

      const orderNativeQuery = Promise.promisify(Order.getDatastore().sendNativeQuery);

      let rawSelect = `
        SELECT
            orders.*,
            users.first_name,
            users.last_name
    `;
      let fromSQL = ` FROM product_orders as orders
        LEFT JOIN users ON users.id = orders.user_id
      `;

      let _where = `
          WHERE
              orders.deleted_at IS NULL AND
              orders.order_type = ${PARTIAL_ORDER_TYPE} AND
              orders.status = ${CANCELED_ORDER}
       `;

      if(!_.isNull(params.status) && !_.isUndefined(params.status)){
        let refundStatus = parseInt(params.status);
        _where += ` AND orders.refund_status =  ${refundStatus} `;
      }

      if(params.removeZeroPayment && params.removeZeroPayment === 'true'){
        _where += ` AND orders.paid_amount !=  0 `;
      }

      if (params.orderNumber) {
        _where += ` AND orders.id = ${params.orderNumber} `;
      }

      if (params.created_at) {
        let created_at = JSON.parse(params.created_at);
        let from = moment(created_at.from).format('YYYY-MM-DD 00:00:00');
        let to = moment(created_at.to).format('YYYY-MM-DD 23:59:59');
        _where += ` AND orders.created_at >= '${from}' AND orders.created_at <= '${to}' `;
      }

      if (params.customerName) {
        const customerName = params.customerName.toLowerCase();
        _where += ` AND ( (CONCAT(users.first_name," ",users.last_name)='${customerName}') OR (CONCAT(users.first_name,"",users.last_name)='${customerName}') OR LOWER(users.first_name) LIKE '%${customerName}%' OR LOWER(users.last_name) LIKE '%${customerName}%') `;
      }

      _where += ` ORDER BY orders.created_at DESC `;

      /*console.log('_where: ', _where);*/
      const totalOrderRaw = await orderNativeQuery('SELECT COUNT(*) as totalCount ' + fromSQL + _where, []);

      let canceledOrder;
      let totalOrder;

      if (totalOrderRaw && totalOrderRaw.rows && totalOrderRaw.rows.length > 0) {
        totalOrder = totalOrderRaw.rows[0].totalCount;

        paginate.limit = paginate.limit ? paginate.limit : totalOrder;
        let limitSQL = ` LIMIT ${paginate.skip}, ${paginate.limit} `;

        let rawDataResult = await orderNativeQuery(rawSelect + fromSQL + _where + limitSQL, []);

        canceledOrder = rawDataResult.rows;
      }


      const time2 = performance.now();
      sails.log.debug(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.status(200).json({
        success: true, message: 'successfully fetched cancelled order', data: canceledOrder, totalOrder
      });
    } catch (error) {
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      return res.status(200).json({
        success: false, message: 'Error occurred while fetching cancelled order', error
      });
    }
  },

  refundCancelOrder: async (req, res) => {
    try {
      const time1 = performance.now();

      const authUser = getAuthUser(req);
      const orderId = req.param('id');

      let order = await Order.findOne({
        id: orderId, deletedAt: null
      });

      console.log('The order is', order);

      if (!order) {
        throw new Error('Order not found!');
      }

      if (order.refund_status) {
        throw new Error('This order already has been refunded!');
      }

      let cashBackTransactions = await Payment.find({
        order_id: orderId, payment_type: CASHBACK_PAYMENT_TYPE, deletedAt: null
      });

      let cashBackAmountToRefund = 0;
      cashBackTransactions.forEach(transaction => {
        cashBackAmountToRefund += transaction.payment_amount;
      });


      let couponLotteryCashback = await CouponLotteryCashback.findOne({
        user_id: order.user_id, deletedAt: null
      });

      let newCashbackAmount = couponLotteryCashback.amount + cashBackAmountToRefund;

      await sails.getDatastore()
        .transaction(async (db) => {
          if (cashBackAmountToRefund > 0) {
            await CouponLotteryCashback.update({
              user_id: order.user_id, deletedAt: null
            }).set({
              amount: newCashbackAmount
            }).usingConnection(db);
          }

          await Order.updateOne({
            id: orderId, deletedAt: null
          }).set({
            refund_status: 1
          }).usingConnection(db);
        });


      await PaymentService.sendSmsForRefund(orderId, authUser);

      const time2 = performance.now();
      sails.log.debug(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.status(200).json({
        success: true, message: 'Successfully refunded.',

      });
    } catch (error) {
      console.log('Error occurred while refunding the order');
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      return res.status(400).json({
        success: false, message: 'Error occurred while refunding the order. ', error,
      });
    }
  },

  getAllProductsByOrderId: async (req, res) => {
    try {
      const time1 = performance.now();

      const ProductQuery = Promise.promisify(Product.getDatastore().sendNativeQuery);
      let rawSelect = `
      SELECT
      product.offline_payment,
      product.id,
      suborderItems.offer_id_number,
      suborderItems.offer_type
       `;
      let fromSQL = ' FROM product_orders as orders ';
      fromSQL += ' LEFT JOIN product_suborders as suborders ON suborders.product_order_id = orders.id';
      fromSQL += ' LEFT JOIN product_suborder_items as suborderItems ON suborderItems.product_suborder_id = suborders.id';
      fromSQL += ' LEFT JOIN products as product ON product.id = suborderItems.product_id';

      let _where = ' WHERE orders.deleted_at IS NULL AND suborders.deleted_at IS NULL AND suborderItems.deleted_at IS NULL ';

      if (req.query.orderId) {
        _where += ` AND orders.id = ${req.query.orderId}  `;
      }
      const rawResult = await ProductQuery(rawSelect + fromSQL + _where, []);

      /** If suborder item exists in any offer then send suborder item offer payment gateway info with suborder item info. START */
      let anonderJhorInfo = await AnonderJhor.findOne({id: 1, deletedAt: null});
      console.log('anonderJhorInfo: ', anonderJhorInfo);

      let regularOfferIds = rawResult.rows.map(item => {
        if(item.offer_type && item.offer_type === REGULAR_OFFER_TYPE){
          return item.offer_id_number;
        }
      });
      console.log('regularOfferIds: ', regularOfferIds);

      let regularOfferDetails = await Offer.find({
        id: regularOfferIds
      });
      console.log('regularOfferDetails: ', regularOfferDetails);

      let regularOfferDetailsByOfferId = _.groupBy(regularOfferDetails, 'id');
      console.log('regularOfferDetailsByOfferId: ', regularOfferDetailsByOfferId);

      let subOrderItems = rawResult.rows.map(item => {
        if(item.offer_type && item.offer_type === REGULAR_OFFER_TYPE){
          let itemOfferInfo = regularOfferDetailsByOfferId[item.offer_id_number][0];
          item.pay_by_sslcommerz = itemOfferInfo.pay_by_sslcommerz;
          item.pay_by_bKash = itemOfferInfo.pay_by_bKash;
          item.pay_by_offline = itemOfferInfo.pay_by_offline;
          item.pay_by_cashOnDelivery = itemOfferInfo.pay_by_cashOnDelivery;
          item.pay_by_nagad = itemOfferInfo.pay_by_nagad;
          item.offered_product = true;
          console.log('item info: ', item.offer_id_number, regularOfferDetailsByOfferId[item.offer_id_number]);
        } else if(item.offer_type && item.offer_type === ANONDER_JHOR_OFFER_TYPE){
          item.pay_by_sslcommerz = anonderJhorInfo.pay_by_sslcommerz;
          item.pay_by_bKash = anonderJhorInfo.pay_by_bKash;
          item.pay_by_offline = anonderJhorInfo.pay_by_offline;
          item.pay_by_cashOnDelivery = anonderJhorInfo.pay_by_cashOnDelivery;
          item.pay_by_nagad = anonderJhorInfo.pay_by_nagad;
          item.offered_product = true;
        }
        return item;
      });
      console.log('subOrderItems: ', subOrderItems);
      /** If suborder item exists in any offer then send suborder item offer payment gateway info with suborder item info. END */

      const time2 = performance.now();
      sails.log.debug(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.status(200).json(subOrderItems);
    } catch (error) {
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      return res.status(400).json({
        message: 'Failed to fetch the products!'
      });
    }
  }
};
