/**
 * OrderController
 *
 * @description :: Server-side logic for managing orders
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const moment = require('moment');
const Promise = require('bluebird');
const _ = require('lodash');
const {calcCartTotal} = require('../../libs/cartHelper');
const SmsService = require('../services/SmsService');
const EmailService = require('../services/EmailService');
const {pagination} = require('../../libs/pagination');
const {asyncForEach} = require('../../libs/helper');
const {adminPaymentAddressId, dhakaZilaId, sslWebUrl, sslApiUrl} = require('../../config/softbd');
const {sslcommerzInstance} = require('../../libs/sslcommerz');

module.exports = {
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

  //Method called for creating a custom order data
  //Model models/Order.js,models/SubOrder.js,models/SuborderItem.js

  customOrder: async function (req, res) {
    try {
      let cart = await Cart.findOne({
        user_id: req.body.user_id,
        deletedAt: null
      });
      let suborderitem = await sails.getDatastore()
        .transaction(async (db) => {
          let order = await Order.create({
            user_id: req.body.user_id,
            cart_id: cart.id,
            total_price: req.body.price,
            billing_address: req.body.payment_address_id,
            total_quantity: req.body.quantity,
            status: 1,
            type: 1
          }).fetch().usingConnection(db);

          let suborder = await Suborder.create({
            product_order_id: order.id,
            warehouse_id: req.body.warehouse_id,
            total_price: req.body.price,
            total_quantity: req.body.quantity,
            delivery_date: req.body.current_date,
            status: 1
          }).fetch().usingConnection(db);

          let suborderitem = SuborderItem.create({
            product_suborder_id: suborder.id,
            product_id: req.body.product_id,
            warehouse_id: req.body.warehouse_id,
            product_quantity: req.body.quantity,
            product_total_price: req.body.price
          }).fetch().usingConnection(db);

          return suborderitem;
        });

      if (suborderitem) {
        return res.json(200, suborderitem);
      } else {
        return res.status(400).json({success: false});
      }
    } catch (error) {
      console.log('error', error);
      return res.status(400).json({success: false});
    }

  },
  //Method called for creating a custom order data from frontend
  //Model models/Order.js,models/SubOrder.js,models/SuborderItem.js,models/PaymentAddress.js
  //,models/Cart.js,models/CartItem.js,models/Payment.js, models/SuborderItemVariant.js
  customInsert: async function (req, res) {


    const authUser = req.token.userInfo;

    try {

      let globalConfigs = await GlobalConfigs.findOne({
        deletedAt: null
      });

      if (!globalConfigs) {
        return res.badRequest('Global config was not found!');
      }

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
      if (cartItems && cartItems.length > 0) {
        const couponProductFound = cartItems.filter((cartItem) => {
          return cartItem.product_id && !!cartItem.product_id.is_coupon_product;
        });
        onlyCouponProduct = couponProductFound && couponProductFound.length > 0;
      }

      if (onlyCouponProduct) {
        return res.badRequest('Payment method is invalid for this particular order.');
      }

      const {
        order,
        orderForMail,
        subordersTemp
      } = await sails.getDatastore()
        .transaction(async (db) => {
          let courierCharge = 0;
          /*.................Shipping Address....................*/
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
            courierCharge = req.param('shipping_address').zila_id == dhakaZilaId ? globalConfigs.dhaka_charge : globalConfigs.outside_dhaka_charge;
          } else {
            courierCharge = globalConfigs.outside_dhaka_charge;
          }

          let {
            grandOrderTotal,
            totalQty
          } = calcCartTotal(cart, cartItems);

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
        const smsPhone = user.phone;
        let smsText = 'anonderbazar.com এ আপনার অর্ডারটি সফলভাবে গৃহীত হয়েছে।';
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
      return res.badRequest('There was a problem in processing the order.');
    }

  },
  //Method called for creating a custom order data from frontend with sslcommerz
  //Model models/Order.js,models/SubOrder.js,models/SuborderItem.js,models/PaymentAddress.js
  //,models/Cart.js,models/CartItem.js,models/Payment.js, models/SuborderItemVariant.js
  sslcommerz: async function (req, res) {

    const authUser = req.token.userInfo;

    let globalConfigs = await GlobalConfigs.findOne({
      deletedAt: null
    });

    if (!globalConfigs) {
      return res.badRequest('Global config was not found!');
    }

    try {

      let cart = await Cart.findOne({
        user_id: authUser.id,
        deletedAt: null
      });

      let cartItems = await CartItem.find({
        cart_id: cart.id,
        deletedAt: null
      })
        .populate('cart_item_variants')
        .populate('product_id');

      let {
        grandOrderTotal,
        totalQty
      } = calcCartTotal(cart, cartItems);

      let noShippingCharge = false;
      if (cartItems && cartItems.length > 0) {
        const couponProductFound = cartItems.filter((cartItem) => {
          return cartItem.product_id && !!cartItem.product_id.is_coupon_product;
        });
        noShippingCharge = couponProductFound && couponProductFound.length > 0 && cartItems.length === couponProductFound.length;
      }

      let courierCharge = 0;
      let adminPaymentAddress = null;

      /** .................Shipping Address.................... */

      if (!noShippingCharge) {
        if (req.param('shipping_address')) {
          if (!req.param('shipping_address').id || req.param('shipping_address').id === '') {
            let shippingAddres = await PaymentAddress.create({
              user_id: authUser.id,
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
            }).fetch();

            req.param('shipping_address').id = shippingAddres.id;
          }
          // eslint-disable-next-line eqeqeq
          courierCharge = req.param('shipping_address').zila_id == dhakaZilaId ? globalConfigs.dhaka_charge : globalConfigs.outside_dhaka_charge;
        } else {
          courierCharge = globalConfigs.outside_dhaka_charge;
        }

      } else {
        adminPaymentAddress = await PaymentAddress.findOne({
          id: adminPaymentAddressId
        });
      }

      grandOrderTotal += courierCharge;

      /** .................Billing Address.................... */
      if (!noShippingCharge && req.param('billing_address')) {
        if ((!req.param('billing_address').id || req.param('billing_address').id === '') && req.param('is_copy') === false) {

          let paymentAddress = await PaymentAddress.create({
            user_id: authUser.id,
            // order_id: order.id,
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
          }).fetch();
          req.param('billing_address').id = paymentAddress.id;


        } else if (req.param('is_copy') === true && req.param('shipping_address')) {
          req.param('billing_address').id = req.param('shipping_address').id;
        }
      }

      const sslcommerz = sslcommerzInstance(globalConfigs);

      let chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';
      let string_length = 16;
      let randomstring = '';

      for (let i = 0; i < string_length; i++) {
        let rnum = Math.floor(Math.random() * chars.length);
        randomstring += chars.substring(rnum, rnum + 1);
      }

      let finalBillingAddressId = null;
      let finalShippingAddressId = null;

      if (req.param('billing_address') && req.param('billing_address').id) {
        finalBillingAddressId = req.param('billing_address').id;
      } else if (adminPaymentAddress && adminPaymentAddress.id) {
        finalBillingAddressId = adminPaymentAddress.id;
      }

      if (req.param('shipping_address') && req.param('shipping_address').id) {
        finalShippingAddressId = req.param('shipping_address').id;
      } else if (adminPaymentAddress && adminPaymentAddress.id) {
        finalShippingAddressId = adminPaymentAddress.id;
      }

      if (finalShippingAddressId === null || finalBillingAddressId === null) {
        return res.badRequest('No Shipping or Billing Address found!');
      }

      let finalPostalCode = null;
      let finalAddress = null;
      if (req.param('shipping_address') && req.param('shipping_address').postal_code) {
        finalPostalCode = req.param('shipping_address').postal_code;
      } else if (adminPaymentAddress && adminPaymentAddress.postal_code) {
        finalPostalCode = adminPaymentAddress.postal_code;
      }
      if (req.param('shipping_address') && req.param('shipping_address').address) {
        finalAddress = req.param('shipping_address').address;
      } else if (adminPaymentAddress && adminPaymentAddress.address) {
        finalAddress = adminPaymentAddress.address;
      }

      let post_body = {};
      post_body['total_amount'] = grandOrderTotal;
      post_body['currency'] = 'BDT';
      post_body['tran_id'] = randomstring;

      post_body['success_url'] = sslApiUrl + '/order/sslcommerzsuccess/?user_id=' + authUser.id + '&billing_address=' + finalBillingAddressId + '&shipping_address=' + finalShippingAddressId;
      post_body['fail_url'] = sslApiUrl + '/order/sslcommerzfail/?user_id=' + authUser.id + '&billing_address=' + finalBillingAddressId + '&shipping_address=' + finalShippingAddressId;
      post_body['cancel_url'] = sslApiUrl + '/order/sslcommerzerror/?user_id=' + authUser.id + '&billing_address=' + finalBillingAddressId + '&shipping_address=' + finalShippingAddressId;

      post_body['emi_option'] = 0;
      post_body['cus_name'] = authUser.first_name + ' ' + authUser.last_name;
      post_body['cus_email'] = authUser.email;
      post_body['cus_phone'] = authUser.phone;
      post_body['cus_postcode'] = finalPostalCode ? finalPostalCode : '1212';
      post_body['cus_add1'] = finalAddress ? finalAddress : 'Urban Rose, Suite-3B, House-61, Road-24, Gulshan-1';
      post_body['cus_city'] = 'Dhaka';
      post_body['cus_country'] = 'Bangladesh';
      post_body['shipping_method'] = 'NO';
      // post_body['multi_card_name'] = ""
      post_body['num_of_item'] = cart.total_quantity;
      post_body['product_name'] = 'Test';
      post_body['product_category'] = 'Anonder Bazar';
      post_body['product_profile'] = 'general';

      sslcommerz.init_transaction(post_body).then(response => {
        console.log('sslcommerz.init_transaction success', response);
        return res.json(response);
      }).catch(error => {
        console.log('sslcommerz.init_transaction error', error);
        res.writeHead(301,
          {Location: sslWebUrl + '/checkout'}
        );
        res.end();
      });
    } catch (finalError) {
      console.log('finalError', finalError);
      return res.badRequest('There was a problem in processing the order.');
    }
  },
  //Method called when sslcommerz success from frontend
  //Model models/Order.js,models/SubOrder.js,models/SuborderItem.js
  //,models/Cart.js,models/CartItem.js,models/Payment.js, models/SuborderItemVariant.js
  sslcommerzsuccess: async function (req, res) {

    console.log('sslcommerzsuccess', req.body);

    if (!(req.body.tran_id && req.query.user_id && req.body.val_id)) {
      return res.badRequest('Invalid order request');
    }

    let globalConfigs = await GlobalConfigs.findOne({
      deletedAt: null
    });

    if (!globalConfigs) {
      return res.badRequest('Global config was not found!');
    }
    try {
      const sslcommerz = sslcommerzInstance(globalConfigs);
      const validationResponse = await sslcommerz.validate_transaction_order(req.body.val_id);

      console.log('validationResponse', validationResponse);

      if (!(validationResponse && (validationResponse.status === 'VALID' || validationResponse.status === 'VALIDATED'))) {
        return res.badRequest('Invalid order request');
      }

      const numberOfOrderFound = await Order.count().where({
        ssl_transaction_id: req.body.tran_id
      });

      if (numberOfOrderFound > 0) {
        return res.badRequest('Invalid request');
      }

      const paidAmount = parseFloat(validationResponse.amount);

      let user = await User.findOne({id: req.query.user_id, deletedAt: null});

      if (!user) {
        return res.badRequest('User was not found!');
      }

      let cart = await Cart.findOne({
        user_id: req.query.user_id,
        deletedAt: null
      });

      let cartItems = await CartItem.find({
        cart_id: cart.id,
        deletedAt: null
      }).populate('cart_item_variants')
        .populate('product_id');

      let {
        grandOrderTotal,
        totalQty
      } = calcCartTotal(cart, cartItems);

      let noShippingCharge = false;

      if (cartItems && cartItems.length > 0) {

        const couponProductFound = cartItems.filter((cartItem) => {
          return cartItem.product_id && !!cartItem.product_id.is_coupon_product;
        });
        noShippingCharge = couponProductFound && couponProductFound.length > 0 && cartItems.length === couponProductFound.length;
      }

      let courierCharge = 0;
      let shippingAddress = await PaymentAddress.findOne({
        id: req.query.shipping_address
      });

      if (!shippingAddress) {
        return res.badRequest('Associated Shipping Address was not found!');
      }

      if (!noShippingCharge) {
        if (shippingAddress && shippingAddress.id) {
          // eslint-disable-next-line eqeqeq
          courierCharge = shippingAddress.zila_id == dhakaZilaId ? globalConfigs.dhaka_charge : globalConfigs.outside_dhaka_charge;
        } else {
          courierCharge = globalConfigs.outside_dhaka_charge;
        }
      }

      grandOrderTotal += courierCharge;

      if (paidAmount !== grandOrderTotal) {
        return res.badRequest('Paid amount and order amount are different.');
      }

      const {
        orderForMail,
        allCouponCodes,
        order,
        subordersTemp
      } = await sails.getDatastore()
        .transaction(async (db) => {
          let order = await Order.create({
            user_id: req.query.user_id,
            cart_id: cart.id,
            total_price: grandOrderTotal,
            total_quantity: totalQty,
            billing_address: req.query.billing_address,
            shipping_address: req.query.shipping_address,
            courier_charge: courierCharge,
            ssl_transaction_id: req.body.tran_id,
            status: 1
          }).fetch().usingConnection(db);

          /** Get unique warehouse Id for suborder................START......................... */

          let uniqueTempWarehouses = _.uniqBy(cartItems, 'product_id.warehouse_id');

          let uniqueWarehouseIds = uniqueTempWarehouses.map(o => o.product_id.warehouse_id);

          /** Get unique warehouse Id for suborder..................END......................... */

          let subordersTemp = [];

          let i = 0; // i init for loop
          let allOrderedProductsInventory = [];

          let allGeneratedCouponCodes = [];
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

              if (thisCartItem.product_id && !!thisCartItem.product_id.is_coupon_product) {
                for (let t = 0; t < thisCartItem.product_quantity; t++) {
                  allGeneratedCouponCodes.push({
                    quantity: thisCartItem.product_quantity,
                    product_id: thisCartItem.product_id.id,
                    user_id: req.query.user_id,
                    order_id: order.id,
                    suborder_id: suborder.id,
                    suborder_item_id: suborderItem.id
                  });
                }
              }

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

          const allCouponCodes = [];

          for (let i = 0; i < subordersTemp.length; i++) {
            let paymentType = await Payment.create({
              user_id: req.query.user_id,
              order_id: order.id,
              suborder_id: subordersTemp[i].id,
              payment_type: 'SSLCommerce',
              payment_amount: subordersTemp[i].total_price,
              details: JSON.stringify(req.body),
              transection_key: req.body.tran_id,
              status: 1
            }).fetch().usingConnection(db);

            paymentTemp.push(paymentType);
          }

          if (allGeneratedCouponCodes.length > 0) {
            const couponCodeLen = allGeneratedCouponCodes.length;
            for (let i = 0; i < couponCodeLen; i++) {
              let couponObject = await ProductPurchasedCouponCode.create(allGeneratedCouponCodes[i]).fetch().usingConnection(db);
              if (couponObject && couponObject.id) {
                allCouponCodes.push('1' + _.padStart(couponObject.id, 6, '0'));
              }
            }
          }

          // Start/Delete Cart after submitting the order

          let orderForMail = await Order.findOne({id: order.id}).populate('user_id')
            .populate('shipping_address').usingConnection(db);
          let allOrderedProducts = [];
          for (let i = 0; i < subordersTemp.length; i++) {
            let items = await SuborderItem.find({where: {product_suborder_id: subordersTemp[i].id}}).populate('product_id').usingConnection(db);
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
            const quantityToUpdate = parseFloat(allOrderedProductsInventory[i].existing_quantity) - parseFloat(allOrderedProductsInventory[i].ordered_quantity);
            await Product.update({id: allOrderedProductsInventory[i].product_id}, {quantity: quantityToUpdate}).usingConnection(db);
          }

          return {
            orderForMail,
            allCouponCodes,
            order,
            subordersTemp
          };
        });


      try {
        let smsPhone = user.phone;

        if (!noShippingCharge && shippingAddress.phone) {
          smsPhone = shippingAddress.phone;
        }

        if (smsPhone) {
          let smsText = 'anonderbazar.com এ আপনার অর্ডারটি সফলভাবে গৃহীত হয়েছে।';
          if (allCouponCodes && allCouponCodes.length > 0) {
            if (allCouponCodes.length === 1) {
              smsText += ' আপনার স্বাধীনতার ৫০ এর কুপন কোড: ' + allCouponCodes.join(',');
            } else {
              smsText += ' আপনার স্বাধীনতার ৫০ এর কুপন কোডগুলি: ' + allCouponCodes.join(',');
            }
          }
          SmsService.sendingOneSmsToOne([smsPhone], smsText);
        }

      } catch (err) {
        console.log('order sms was not sent!');
        console.log(err);
      }

      try {
        EmailService.orderSubmitMail(orderForMail);
      } catch (err) {
        console.log('order email was not sent!');
        console.log(err);
      }

      let d = Object.assign({}, order);
      d.suborders = subordersTemp;
      res.writeHead(301,
        {Location: webURL + '/checkout?order=' + order.id}
      );
      res.end();
    } catch (finalError) {
      console.log('finalError', finalError);
      return res.badRequest('There was a problem in processing the order.');
    }

  },
  //Method called when sslcommerz fails sends redirectory route
  sslcommerzfail: function (req, res) {
    res.writeHead(301,
      {Location: webURL + '/checkout'}
    );
    res.end();
  },
  //Method called when sslcommerz error sends redirectory route
  sslcommerzerror: function (req, res) {
    res.writeHead(301,
      {Location: webURL + '/checkout'}
    );
    res.end();
  },
  allOrders: async (req, res) => {
    try {
      let _pagination = pagination(req.query);

      const orderQuery = Promise.promisify(Order.getDatastore().sendNativeQuery);

      let rawSelect = 'SELECT orders.id as id,';
      rawSelect += ' orders.total_quantity, orders.total_price, orders.status, orders.created_at as createdAt, orders.updated_at as updatedAt, ';
      rawSelect += ' CONCAT(users.first_name, \' \',users.first_name) as  full_name,  CONCAT(changedBy.first_name, \' \',changedBy.first_name) as changedByName  ';

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
  }
};
