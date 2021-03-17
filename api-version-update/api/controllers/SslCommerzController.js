/**
 * SslCommerzController.js
 * @help :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const _ = require('lodash');
const SmsService = require('../services/SmsService');
const EmailService = require('../services/EmailService');
const {dhakaZilaId} = require('../../config/softbd');
const {sslWebUrl} = require('../../config/softbd');
const {calcCartTotal} = require('../services/checkout');
const {sslcommerzInstance} = require('../../libs/sslcommerz');

module.exports = {
  //Method called when sslCommerzSuccess from frontend
  sslCommerzSuccess: async function (req, res) {

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
        {Location: sslWebUrl + '/checkout?order=' + order.id}
      );
      res.end();
    } catch (finalError) {
      console.log('finalError', finalError);
      return res.badRequest('There was a problem in processing the order.');
    }

  },
  //Method called when sslCommerzFail fails sends redirectory route
  sslCommerzFailure: function (req, res) {
    res.writeHead(301,
      {Location: sslWebUrl + '/checkout'}
    );
    res.end();
  },
  //Method called when sslCommerzError error sends redirectory route
  sslCommerzError: function (req, res) {
    res.writeHead(301,
      {Location: sslWebUrl + '/checkout'}
    );
    res.end();
  },
};
