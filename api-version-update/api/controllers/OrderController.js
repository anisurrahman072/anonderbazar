/**
 * OrderController
 *
 * @description :: Server-side logic for managing orders
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const moment = require('moment');
const Promise = require('bluebird');
const _ = require('lodash');
const {getPaymentService} = require('../../libs/paymentMethods');
const {getGlobalConfig} = require('../../libs/helper');
const {getAuthUser} = require('../../libs/helper');
const {pagination} = require('../../libs/pagination');
const {asyncForEach} = require('../../libs/helper');
const {cashOnDeliveryNotAllowedForCategory} = require('../../config/softbd');
const logger = require("../../libs/softbd-logger").Logger;

module.exports = {
  findOne: async (req, res) => {
    try {
      const orders = await Order.findOne({id: req.param('id')})
        .populate('user_id')
        .populate('billing_address')
        .populate('shipping_address')
        .populate('payment')
        .populate('couponProductCodes', {deletedAt: null})
        .populate('suborders', {deletedAt: null});

      console.log('orders', orders.couponProductCodes);

      return res.status(200).json(orders);

    } catch (error) {
      console.log(error);
      return res.status(400).json({
        message: false,
        error
      });
    }
  },
  index: (req, res) => {
    try {
      return res.json({message: 'Not Authorized'});
    } catch (error) {
      console.log(error);
      return res.json({error: error});
    }
  },
  // destroy a row
  destroy: async (req, res) => {
    try {
      const order = await Order.updateOne({id: req.param('id')}).set({deletedAt: new Date()});
      return res.status(200).json(order);
    } catch (error) {
      console.log(error);
      return res.status(error.status).json({error: error});
    }
  },

  //Method called for creating a custom order data from frontend
  //Model models/Order.js,models/SubOrder.js,models/SuborderItem.js,models/PaymentAddress.js
  placeOrderForCashOnDelivery: async function (req, res) {

    try {

      const authUser = getAuthUser(req);

      let globalConfigs = await getGlobalConfig();

      let cart = await Cart.findOne({
        user_id: authUser.id,
        deletedAt: null
      });

      if (!cart) {
        return res.badRequest('No Cart Found!');
      }

      let cartItems = await CartItem.find({
        cart_id: cart.id,
        deletedAt: null
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
        order,
        orderForMail,
        subordersTemp
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
            grandOrderTotal,
            totalQty
          } = PaymentService.calcCartTotal(cart, cartItems);

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

          let uniqueWarehouseIds = uniqueTempWarehouses.map(
            o => o.product_id.warehouse_id
          );

          /** get unique warehouse Id for suborder..................END.........................*/

          let subordersTemp = [];

          let i = 0; // i init for loop

          let allOrderedProductsInventory = [];

          for (i = 0; i < uniqueWarehouseIds.length; i++) {
            let thisWarehouseID = uniqueWarehouseIds[i];

            let cartItemsTemp = cartItems.filter(
              asset => asset.product_id.warehouse_id === thisWarehouseID
            );

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
              newEndDate.setDate(new Date(
                new Date(order.createdAt).getTime() +
                ((thisCartItem.product_id.produce_time *
                  thisCartItem.product_quantity) /
                  60 /
                  8) *
                86400000
              ).getDate() + 1);

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

                  let suborderItemVariant = await SuborderItemVariant.create(
                    newSuborderItemVariantPayload
                  ).fetch().usingConnection(db);
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
            await CartItemVariant.update(
              {cart_item_id: cartItems[i].id},
              {deletedAt: new Date()}
            ).usingConnection(db);
          }

          for (let i = 0; i < allOrderedProductsInventory.length; i++) {
            const thisInventoryProd = allOrderedProductsInventory[i];
            const quantityToUpdate = parseFloat(thisInventoryProd.existing_quantity) - parseFloat(thisInventoryProd.ordered_quantity);
            await Product.update({id: thisInventoryProd.product_id}, {quantity: quantityToUpdate}).usingConnection(db);
          }
          return {
            order,
            orderForMail,
            subordersTemp
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

      return res.ok({
        order: d
      });

    } catch (finalError) {
      console.log('finalError', finalError);
      return res.status(400).json({
        message: 'There was a problem in processing the order.',
        additionalMessage: finalError.message
      });

    }

  },
  //Method called for creating a custom order data from frontend with sslcommerz
  //Model models/Order.js,models/SubOrder.js,models/SuborderItem.js,models/PaymentAddress.js
  //,models/Cart.js,models/CartItem.js,models/Payment.js, models/SuborderItemVariant.js
  placeOrder: async function (req, res) {

    try {
      const authUser = getAuthUser(req);
      const globalConfigs = await getGlobalConfig();

      let cart = await PaymentService.getCart(authUser.id);
      let cartItems = await PaymentService.getCartItems(cart.id);

      const shippingAddress = await PaymentService.getShippingAddress(req);
      const billingAddress = await PaymentService.getBillingAddress(req, shippingAddress);

      if (_.isNull(shippingAddress) || _.isEmpty(shippingAddress)) {
        throw new Error('No shipping address has been provided.');
      }

      logger.orderLog(authUser.id, '######## PLACING ORDER ########');
      logger.orderLog(authUser.id, 'Payment Method: ', req.param('paymentType'));
      logger.orderLog(authUser.id, 'Order Body: ', req.body);
      logger.orderLog(authUser.id,'Order - shipping_address: ', shippingAddress);
      logger.orderLog(authUser.id,'Order - billing_address: ', billingAddress);

      let paymentGatewayService = getPaymentService(req.param('paymentType'), req.body.order_type);

      let response = await paymentGatewayService.placeOrder(
        authUser,
        req.body,
        req.allParams(),
        {
          paymentType: req.param('paymentType')
        },
        {
          billingAddress,
          shippingAddress
        },
        globalConfigs,
        cart,
        cartItems
      );

      return res.status(200).json(response);

    } catch (finalError) {
      logger.orderLogAuth(req, finalError);

      return res.status(400).json({
        message: 'There was a problem in processing the order.',
        additionalMessage: finalError.message
      });
    }
  },

  allOrders: async (req, res) => {
    try {
      let _pagination = pagination(req.query);

      const orderQuery = Promise.promisify(Order.getDatastore().sendNativeQuery);

      let rawSelect = 'SELECT orders.id as id,';
      rawSelect += ' orders.total_quantity, orders.total_price, orders.status, orders.created_at as createdAt, orders.updated_at as updatedAt, ';
      rawSelect += ' CONCAT(users.first_name, \' \', users.last_name) as  full_name,  CONCAT(changedBy.first_name, \' \', changedBy.last_name) as changedByName  ';

      let fromSQL = ' FROM product_orders as orders  ';
      fromSQL += '  LEFT JOIN users as changedBy ON orders.changed_by = changedBy.id  ';
      fromSQL += '  LEFT JOIN users as users ON users.id = orders.user_id  ';

      let _where = ' WHERE orders.deleted_at IS NULL ';

      if (req.query.status) {
        _where += ` AND orders.status = ${req.query.status} `;
      }

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

      _where += ' ORDER BY orders.created_at DESC ';
      const totalOrderRaw = await orderQuery('SELECT COUNT(*) as totalCount ' + fromSQL + _where, []);
      let totalOrder = 0;
      let orders = [];
      if (totalOrderRaw && totalOrderRaw.rows && totalOrderRaw.rows.length > 0) {
        totalOrder = totalOrderRaw.rows[0].totalCount;
        _pagination.limit = _pagination.limit ? _pagination.limit : totalOrder;

        let limitSQL = ` LIMIT ${_pagination.skip}, ${_pagination.limit} `;

        const rawResult = await orderQuery(rawSelect + fromSQL + _where + limitSQL, []);

        orders = rawResult.rows;
      }

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
      let message = 'Error in getting all orders with pagination';
      return res.status(400).json({
        success: false,
        message,
        error
      });
    }
  },
  //Method called for getting all order data
  //Model models/Order.js,models/SubOrder.js,models/SuborderItem.js, models/SuborderItemVariant.js
  getAllOrder: async (req, res) => {
    try {
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
                  .populate('product_variant_id')
                );
              });
              item.suborderItemVariants = varientitems;
            });
          }
        }
      });

      return res.status(200).json(orders);

    } catch (error) {
      console.log(error);
      let message = 'Error in getting all orders with pagination';
      res.status(400).json({
        success: false,
        message,
        error
      });
    }
  },
  //Method called for updating order
  update: async (req, res) => {
    try {
      let updatedOrder = await Order.updateOne({
        deletedAt: null,
        id: req.param('id')
      }).set(req.body);

      let paymentDetail = await Payment.find({
        order_id: updatedOrder.id,
        deletedAt: null
      });

      if (paymentDetail[0].payment_type === 'CashBack' && req.body.status === 12) {
        let returnCashbackAmount = updatedOrder.total_price;

        let prevCashbackDetail = await CouponLotteryCashback.findOne({
          deletedAt: null,
          user_id: paymentDetail[0].user_id
        });

        await CouponLotteryCashback.updateOne({
          user_id: paymentDetail[0].user_id
        }).set({
          amount: prevCashbackDetail.amount + returnCashbackAmount
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Successfully updated status of order',
        data: updatedOrder
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Error occurred while updating Order'
      });
    }
  }
};
