/**
 * MissingOrderController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const {sslcommerzInstance} = require('../../libs/sslcommerz');
const {dhakaZilaId} = require('../../config/softbd');
const _ = require('lodash');
const {calculateCourierCharge} = require('../../libs/helper');
const SmsService = require('../services/SmsService');
const EmailService = require('../services/EmailService');
const {SSL_COMMERZ_PAYMENT_TYPE} = require('../../libs/constants');
const {performance} = require('perf_hooks');

module.exports = {
  findSSLTransaction: async (req, res) => {
    try {
      const time1 = performance.now();

      console.log('req asce');

      let usernameTmp = req.body.username;

      console.log('-----------------------------------------');
      console.log(req.body.username, usernameTmp, req.body.ssl_transaction_id);

      const users = await User.find({
        username: usernameTmp,
        deletedAt: null
      });

      console.log(users);
      if (!(users && users.length > 0)) {
        return res.status(400).json({
          success: false,
          message: 'User not found!'
        });
      }

      const customer = users[0];

      let shippingAddress = await PaymentAddress.find({
        user_id: customer.id,
        deletedAt: null
      }).populate('division_id')
        .populate('zila_id')
        .populate('upazila_id');

      if (_.isUndefined(shippingAddress) || _.isEmpty(shippingAddress)) {
        return res.status(400).json({
          success: false,
          message: 'No shipping address found for the user!'
        });
      }

      let globalConfigs = await GlobalConfigs.findOne({
        deletedAt: null
      });

      console.log('tttt', globalConfigs);
      const sslcommerz = sslcommerzInstance(globalConfigs);
      console.log('qqqqq', sslcommerz);

      // const validationResponse = await sslcommerz.validate_transaction_order(req.body.val_id);
      const transResponse = await sslcommerz.transaction_status_id(req.body.ssl_transaction_id);

      console.log('transResponse: ', transResponse);

      if (transResponse && transResponse.no_of_trans_found) {
        const noOfTrans = parseInt(transResponse.no_of_trans_found, 10);
        if (!(noOfTrans > 0 && transResponse.element && transResponse.element.length > 0 &&
          (transResponse.element[0].status &&
            (transResponse.element[0].status === 'VALID' || transResponse.element[0].status === 'VALIDATED')))) {
          return res.status(400).json({
            success: false,
            message: 'Invalid SSL Commerz Transaction ID'
          });
        }
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid SSL Commerz Transaction ID'
        });
      }

      const sslCommerzResponse = transResponse.element[0];

      const numberOfOrderFound = await Order.count().where({
        ssl_transaction_id: req.body.ssl_transaction_id,
        deletedAt: null
      });

      if (numberOfOrderFound > 0) {
        return res.status(400).json({
          success: false,
          message: 'This SSL Commerz Transaction ID is already exists in database.'
        });
      }

      const time2 = performance.now();
      sails.log.debug(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.status(200).json({
        success: true,
        message: 'Successfully found the transaction details from SSL commerz',
        data: sslCommerzResponse,
        shippingAddress,
        customer
      });

    } catch (error) {
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      return res.status(400).json({
        success: false,
        message: 'Error occurred while fetching SSL Transaction ID info',
        error
      });
    }
  },

  generateMissingOrders: async (req, res) => {
    try {
      const time1 = performance.now();

      let globalConfigs = await GlobalConfigs.findOne({
        deletedAt: null
      });

      if (!globalConfigs) {
        return res.status(500).json({
          failure: true
        });
      }

      const sslcommerz = sslcommerzInstance(globalConfigs);
      console.log('sssl: ', req.body.ssl_transaction_id);
      const transResponse = await sslcommerz.transaction_status_id(req.body.ssl_transaction_id);

      console.log('validationResponse-sslCommerzIpnSuccess', transResponse);

      if (transResponse && transResponse.no_of_trans_found) {
        const noOfTrans = parseInt(transResponse.no_of_trans_found, 10);
        if (!(noOfTrans > 0 && transResponse.element && transResponse.element.length > 0 &&
          (transResponse.element[0].status &&
            (transResponse.element[0].status === 'VALID' || transResponse.element[0].status === 'VALIDATED')))) {
          return res.status(400).json({
            success: false,
            message: 'Invalid SSL Commerz Transaction ID'
          });
        }
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid SSL Commerz Transaction ID'
        });
      }

      const numberOfOrderFound = await Order.count().where({
        ssl_transaction_id: req.body.ssl_transaction_id,
        deletedAt: null
      });

      if (numberOfOrderFound > 0) {
        return res.status(422).json({
          failure: true,
          message: 'An order is already existed with this transaction id'
        });
      }

      let user = await User.findOne({id: req.body.customerId, deletedAt: null});

      if (!user) {
        return res.status(400).json({
          failure: true,
          message: 'User was not found'
        });
      }

      /** Start DB transaction **/
      let {smsPhone, orderForMail, order} = await sails.getDatastore()
        .transaction(async (db) => {
          let paymentType = SSL_COMMERZ_PAYMENT_TYPE;
          let sslCommerztranId = req.body.ssl_transaction_id;
          let shippingAddressId = req.body.shippingAddressId;
          const paidAmount = parseFloat(transResponse.element[0].amount);
          let allProducts = JSON.parse(req.body.products);
          let totalQuantity = 0;
          let total_price = 0;

          for(let i = 0; i < allProducts.length; i++){
            totalQuantity += parseInt(allProducts[i].orderQuantity);
            let price = allProducts[i].promotion ? parseFloat(allProducts[i].promo_price) : parseFloat(allProducts[i].price);
            price = price * parseFloat(allProducts[i].orderQuantity);
            total_price += price;
          }

          const carts = await Cart.update({user_id: req.body.customerId}, {deletedAt: new Date()}).fetch().usingConnection(db);
          const cartIds = carts.map((cart) => cart.id);

          if (cartIds && cartIds.length > 0) {
            await CartItem.update({cart_id: cartIds}, {deletedAt: new Date()}).usingConnection(db);
          }

          let cart = await Cart.create({
            user_id: req.body.customerId,
            ip_address: '',
            total_quantity: totalQuantity,
            total_price: total_price,
            status: 1
          }).fetch().usingConnection(db);
          //  console.log('cart result: ', cart);

          for(let i = 0; i < allProducts.length; i++){
            let productUnitPrice = allProducts[i].promotion ? parseFloat(allProducts[i].promo_price) : parseFloat(allProducts[i].price);
            let newCartItem = {
              cart_id: cart.id,
              product_id: allProducts[i].id,
              product_unit_price: productUnitPrice,
              product_quantity: parseFloat(allProducts[i].orderQuantity),
              product_total_price: productUnitPrice * allProducts[i].orderQuantity
            };
            await CartItem.create({
              ...newCartItem
            }).fetch().usingConnection(db);
          }

          let cartItems = await CartItem.find({
            cart_id: cart.id,
            deletedAt: null
          }).populate('cart_item_variants')
            .populate('product_id')
            .usingConnection(db);

          let {
            grandOrderTotal,
            totalQty
          } = await PaymentService.calcCartTotal(cart, cartItems);

          let noShippingCharge = false;

          if (cartItems && cartItems.length > 0) {

            let productFreeShippingFound = allProducts.filter(item => {
              return item.free_shipping;
            });
            console.log('productFreeShippingFound', productFreeShippingFound);

            noShippingCharge = productFreeShippingFound && productFreeShippingFound.length > 0 && cartItems.length === productFreeShippingFound.length;

            console.log('noShippingCharge',noShippingCharge);
          }

          let shippingAddress = await PaymentAddress.findOne({
            id: shippingAddressId
          }).usingConnection(db);

          if (!shippingAddress) {
            throw new Error('Associated Shipping Address was not found!');
          }

          let courierCharge = await calculateCourierCharge(noShippingCharge, allProducts, shippingAddress.zila_id);

          console.log('courierCharge', courierCharge);
          grandOrderTotal += courierCharge;

          console.log('paidAmount', paidAmount);
          console.log('grandOrderTotal', grandOrderTotal);

          if (!(Math.abs(paidAmount - grandOrderTotal) < Number.EPSILON)) {
            throw new Error('Paid amount and order amount are different.');
          }

          let order = await Order.create({
            user_id: req.body.customerId,
            cart_id: cart.id,
            total_price: grandOrderTotal,
            total_quantity: totalQty,
            billing_address: shippingAddressId,
            shipping_address: shippingAddressId,
            courier_charge: courierCharge,
            ssl_transaction_id: sslCommerztranId,
            status: 1
          }).fetch().usingConnection(db);

          /** Get unique warehouse Id for suborder................START......................... */

          let uniqueTempWarehouses = _.uniqBy(cartItems, 'product_id.warehouse_id');

          let uniqueWarehouseIds = uniqueTempWarehouses.map(o => o.product_id.warehouse_id);

          /** Get unique warehouse Id for suborder..................END......................... */

          let subordersTemp = [];

          let i = 0; // i init for loop
          let allOrderedProductsInventory = [];

          /** Generate Necessary sub orders according to warehouse Start **/
          for (i = 0; i < uniqueWarehouseIds.length; i++) {
            let thisWarehouseID = uniqueWarehouseIds[i];

            let cartItemsTemp = cartItems.filter(
              asset => asset.product_id.warehouse_id === thisWarehouseID
            );
            /*console.log('cartItemsTemp', cartItemsTemp);*/

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

              /*if (thisCartItem.product_id && !!thisCartItem.product_id.is_coupon_product) {
                for (let t = 0; t < thisCartItem.product_quantity; t++) {
                  allGeneratedCouponCodes.push({
                    quantity: thisCartItem.product_quantity,
                    product_id: thisCartItem.product_id.id,
                    user_id: customer.id,
                    order_id: order.id,
                    suborder_id: suborder.id,
                    suborder_item_id: suborderItem.id
                  });
                }
              }*/

              let suborderItemVariantsTemp = [];
              /*if (thisCartItem.cart_item_variants.length > 0) {
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
              }*/

              let d = Object.assign({}, suborderItem);
              d.suborderItemVariants = suborderItemVariantsTemp;
              suborderItemsTemp.push(d);

              allOrderedProductsInventory.push(orderedProductInventory);
            }

            let d = Object.assign({}, suborder);
            d.suborderItems = suborderItemsTemp;
            subordersTemp.push(d);
          }

          /** Generate Necessary sub orders according to warehouse End **/

          /** .............Payment Section ........... */

          let paymentTemp = [];

          const allCouponCodes = [];

          const sslCommerzResponse = transResponse.element[0];

          for (let i = 0; i < subordersTemp.length; i++) {
            let paymentObj = await Payment.create({
              user_id: req.body.customerId,
              order_id: order.id,
              suborder_id: subordersTemp[i].id,
              payment_type: SSL_COMMERZ_PAYMENT_TYPE,
              payment_amount: subordersTemp[i].total_price,
              transection_key: sslCommerztranId,
              details: JSON.stringify(sslCommerzResponse),
              payment_date: sslCommerzResponse.tran_date,
              status: 1
            }).fetch().usingConnection(db);

            paymentTemp.push(paymentObj);
          }

          // Start/Delete Cart after submitting the order
          let orderForMail = await Order.findOne({id: order.id})
            .populate('user_id')
            .populate('shipping_address').usingConnection(db);

          let allOrderedProducts = [];
          for (let i = 0; i < subordersTemp.length; i++) {
            let items = await SuborderItem.find({where: {product_suborder_id: subordersTemp[i].id}}).populate('product_id').usingConnection(db);
            for (let index = 0; index < items.length; index++) {
              allOrderedProducts.push(items[index]);
            }
          }

          orderForMail.orderItems = allOrderedProducts;
          orderForMail.payments = paymentTemp;

          await Cart.update({id: cart.id}, {deletedAt: new Date()}).usingConnection(db);

          for (let i = 0; i < cartItems.length; i++) {
            await CartItem.update({id: cartItems[i].id}, {deletedAt: new Date()}).usingConnection(db);
          }

          for (let i = 0; i < allOrderedProductsInventory.length; i++) {
            const quantityToUpdate = parseFloat(allOrderedProductsInventory[i].existing_quantity) - parseFloat(allOrderedProductsInventory[i].ordered_quantity);
            await Product.update({id: allOrderedProductsInventory[i].product_id}, {quantity: quantityToUpdate}).usingConnection(db);
          }

          let smsPhone = user.phone;

          if (!noShippingCharge && shippingAddress.phone) {
            smsPhone = shippingAddress.phone;
          }
          return {smsPhone, orderForMail, order};

        });

      try {
        if (smsPhone) {
          let smsText = `anonderbazar.com এ আপনার অর্ডারটি সফলভাবে গৃহীত হয়েছে। অর্ডার নাম্বার: ${order.id}`;
          console.log('smsTxt', smsText);
          SmsService.sendingOneSmsToOne([smsPhone], smsText);
        }
        EmailService.orderSubmitMail(orderForMail);
      }
      catch (error){
        console.log(error);
        sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      }

      const time2 = performance.now();
      sails.log.debug(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.status(200).json(orderForMail);

    } catch (error) {
      console.log('Error occurred while sending SMS or Mail');
      console.log(error);
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      return res.status(400).json({
        success: false,
        message: 'Error occurred while generating order. ' + error.message
      });
    }
  }

};

