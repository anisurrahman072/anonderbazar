const _ = require('lodash');
const SmsService = require('../services/SmsService');
const EmailService = require('../services/EmailService');
const {adminPaymentAddressId} = require('../../config/softbd');

module.exports = {

  calcCourierCharge: async function(cartItems, requestBody, urlParams, globalConfigs) {
    let noShippingCharge = false;

    /** take decision for adding shipping charge */
    if (cartItems && cartItems.length > 0) {
      const couponProductFound = cartItems.filter((cartItem) => {
        return cartItem.product_id && !!cartItem.product_id.is_coupon_product;
      });

      let productFreeShippingFound = cartItems.filter(item => {
        return (item.product_id && item.product_id.free_shipping);
      });

      noShippingCharge = (couponProductFound && couponProductFound.length > 0 && cartItems.length === couponProductFound.length) || (
        productFreeShippingFound && productFreeShippingFound.length > 0 && cartItems.length === productFreeShippingFound.length
      );
    }
    /** END */

    let courierCharge = 0;
    let adminPaymentAddress = null;

    if(!noShippingCharge){
      if(urlParams['shipping_address']){
        courierCharge = requestBody.courierCharge;
      }
      else{
        courierCharge = globalConfigs.outside_dhaka_charge;
      }
    }
    else{
      adminPaymentAddress = await PaymentAddress.findOne({
        id: adminPaymentAddressId
      });
    }

    return {courierCharge, adminPaymentAddress};
  },

  selectPaymentType: async (data) => {
    try {
      if (data.orderDetails.paymentType === 'CashBack') {

        const response = await CashbackService.createOrder(
          data.authUser,
          data.requestBody,
          data.urlParams,
          data.orderDetails,
          data.address,
          data.globalConfigs,
          data.cart,
          data.cartItems
        );

        return {
          order_id: response.order.id
        };
      }

      else if (data.orderDetails.paymentType === 'Cash') {

        const cashOnDeliveryResponse = await CashOnDeliveryService.createOrder(
          data.authUser,
          data.requestBody,
          data.urlParams,
          data.orderDetails,
          data.address,
          data.globalConfigs,
          data.cart,
          data.cartItems
        );

        return {
          order_id: cashOnDeliveryResponse.order.id
        };

      }

      else if (data.orderDetails.paymentType === 'SSLCommerce') {

        const sslResponse = await SslCommerzService.placeOrder(
          data.authUser,
          data.requestBody,
          data.urlParams,
          data.orderDetails,
          data.address,
          data.globalConfigs,
          data.cart,
          data.cartItems
        );

        return {
          order_id: sslResponse.order.id
        };

      }

      /*if (req.param('paymentType') === 'bKash') {
        console.log(req.body);

        const bKashResponse = await createBKashPayment(authUser, {
          payerReference: req.body.payerReference,
          agreement_id: req.body.agreement_id,
          paymentType: 'bKash',
          grandOrderTotal,
          totalQuantity: totalQty
        }, {
          adminPaymentAddress,
          billingAddress: req.param('billing_address'),
          shippingAddress: req.param('shipping_address')
        });

        return res.status(200).json(bKashResponse);
      }*/

      /*if (req.param('paymentType') === 'nagad') {
        console.log('dddd');
        const nagadResponse = await placeNagadPaymentOrder(authUser,
          {
            paymentType: 'nagad',
            grandOrderTotal,
            totalQuantity: totalQty
          },
          {
            adminPaymentAddress,
            billingAddress: req.param('billing_address'),
            shippingAddress: req.param('shipping_address')
          },
          globalConfigs,
          courierCharge,
          req.ip
        );

        return res.status(201).json({
          nagadResponse: nagadResponse
        });
      }*/
    }
    catch (error){
      console.log('Error occurred while placing order!', error);
    }
  },

  createPayment: async (db, subordersTemp, authUser, order, paymentType, paymentResponse, sslCommerztranId) => {
    let paymentTemp = [];
    for (let i = 0; i < subordersTemp.length; i++) {
      let paymentObj = await Payment.create({
        user_id: authUser.id,
        order_id: order.id,
        suborder_id: subordersTemp[i].id,
        payment_type: paymentType,
        payment_amount: subordersTemp[i].total_price,
        details: JSON.stringify(paymentResponse),
        transection_key: sslCommerztranId,
        status: 1
      }).fetch().usingConnection(db);

      paymentTemp.push(paymentObj);
    }
    return paymentTemp;
  },

  calcCartTotal: async function (cart, cartItems) {
    let grandOrderTotal = 0;
    let totalQty = 0;
    cartItems.forEach((cartItem) => {
      if (cartItem.product_quantity > 0) {
        //  console.log('ttttt', cartItem);
        grandOrderTotal += cartItem.product_total_price;
        totalQty += cartItem.product_quantity;
      }
    });
    return {
      grandOrderTotal,
      totalQty
    };
  },

  getCart: async (userId) => {
    const cart = await Cart.findOne({
      user_id: userId,
      deletedAt: null
    });

    if (!cart) {
      throw new Error('No Associated Shipping Cart was found!');
    }
    return cart;
  },

  getCartItems: async (cartId) => {
    const cartItems = await CartItem.find({
      cart_id: cartId,
      deletedAt: null
    })
      .populate('cart_item_variants')
      .populate('product_id');

    if ( !(cartItems && cartItems.length > 0) ) {
      throw new Error('No Associated Shipping Cart Item was found!');
    }
    return cartItems;
  },

  createAddress: async (address) => {
    return await PaymentAddress.create({
      user_id: authUser.id,
      first_name: address.firstName,
      last_name: address.lastName,
      address: address.address,
      country: address.address,
      phone: address.phone,
      postal_code: address.postCode,
      upazila_id: address.upazila_id,
      zila_id: address.zila_id,
      division_id: address.division_id,
      status: 1
    }).fetch();
  },

  placeOrder: async (userId, cartId, grandOrderTotal, totalQty, billingAddressId, shippingAddressId, courierCharge, cartItems, paymentType, db, sslCommerztranId
  ) => {
    let orderDatPayload = {
      user_id: userId,
      cart_id: cartId,
      total_price: grandOrderTotal,
      total_quantity: totalQty,
      billing_address: billingAddressId,
      shipping_address: shippingAddressId,
      status: 1,
      courier_charge: courierCharge,
      courier_status: 1,
    };
    if (sslCommerztranId) {
      orderDatPayload = {
        ...orderDatPayload,
        ssl_transaction_id: sslCommerztranId
      };
    }
    let order = await Order.create(orderDatPayload).fetch().usingConnection(db);

    /** Get unique warehouse Id for suborder................START......................... */
    let uniqueTempWarehouses = _.uniqBy(cartItems, 'product_id.warehouse_id');

    let uniqueWarehouseIds = uniqueTempWarehouses.map(o => o.product_id.warehouse_id);
    /** Get unique warehouse Id for suborder..................END......................... */

    let subordersTemp = [];

    let i = 0; // i init for loop
    let allOrderedProductsInventory = [];

    /** Generate Necessary sub orders according to warehouse Start **/
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
              user_id: userId,
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
    /** Generate Necessary sub orders according to warehouse End **/

    return {subordersTemp, order, allOrderedProductsInventory, allGeneratedCouponCodes};
  },

  findAllOrderedProducts: async (orderId, db, subordersTemp) => {
    let orderForMail = await Order.findOne({id: orderId})
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
    return orderForMail;
  },

  updateCart: async (cartId, db, cartItems) => {
    await Cart.update({id: cartId}, {deletedAt: new Date()}).usingConnection(db);

    for (let i = 0; i < cartItems.length; i++) {
      await CartItem.update({id: cartItems[i].id}, {deletedAt: new Date()}).usingConnection(db);
      await CartItemVariant.update(
        {cart_item_id: cartItems[i].id},
        {deletedAt: new Date()}
      ).usingConnection(db);
    }
  },

  updateProductInventory: async (allOrderedProductsInventory, db) => {
    for (let i = 0; i < allOrderedProductsInventory.length; i++) {
      const thisInventoryProd = allOrderedProductsInventory[i];
      const quantityToUpdate = parseFloat(thisInventoryProd.existing_quantity) - parseFloat(thisInventoryProd.ordered_quantity);
      await Product.update({id: thisInventoryProd.product_id}, {quantity: quantityToUpdate}).usingConnection(db);
    }
  },

  sendSms: async (authUser, order) => {
    try {
      const smsPhone = authUser.phone;
      let smsText = `anonderbazar.com এ আপনার অর্ডারটি সফলভাবে গৃহীত হয়েছে। অর্ডার নাম্বার: ${order.id}`;
      console.log('smsTxt', smsText);
      SmsService.sendingOneSmsToOne([smsPhone], smsText);
    } catch (err) {
      console.log('SMS sending error');
      console.log(err);
    }
  },

  sendEmail: async (orderForMail) => {
    try {
      EmailService.orderSubmitMail(orderForMail);
    } catch (err) {
      console.log('Email Sending Error', err);
    }
  }

};
