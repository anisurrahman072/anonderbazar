const _ = require('lodash');
const {adminPaymentAddressId, dhakaZilaId} = require('../../config/softbd');
const moment = require('moment');
const {CANCELED_ORDER} = require('../../libs/constants.js');
const logger = require('../../libs/softbd-logger').Logger;
const OfferService = require('../services/OfferService');
const {ORDER_STATUSES, ORDER_STATUSES_INDEX} = require('../../libs/orders');
const crypto = require('crypto');


module.exports = {
  generateRandomString: function (length = 16) {
    let chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';
    let string_length = length;
    let randomstring = '';

    for (let i = 0; i < string_length; i++) {
      let rnum = Math.floor(Math.random() * chars.length);
      randomstring += chars.substring(rnum, rnum + 1);
    }
    return randomstring;
  },
  getTheCustomer: async function (userId) {
    return await User.findOne({id: userId, deletedAt: null});
  },
  getBillingAddress: async function (authUser, req, shippingAddress) {
    let billingAddress = null;
    let billing_address = req.param('billing_address');
    let isCopy = req.param('is_copy');
    if (billing_address) {
      if (!_.isObject(billing_address)) {
        billing_address = JSON.parse(billing_address);
      }
      if (_.isString(isCopy)) {
        isCopy = isCopy === 'true';
      }
      if (_.isObject(billing_address)) {
        billingAddress = {...billing_address, postal_code: billing_address.postCode};
        if ((!billingAddress.id || billingAddress.id === '') && isCopy === false) {
          billingAddress = await this.createAddress(authUser, billingAddress);
        } else if (isCopy === true && _.isObject(shippingAddress)) {
          billingAddress = {...shippingAddress};
        }
      }
    }
    return billingAddress;
  },
  getShippingAddress: async function (authUser, req, cartItems = []) {
    let shippingAddress = null;
    let shipping_address = req.param('shipping_address');

    if (shipping_address) {
      if (!_.isObject(shipping_address)) {
        shipping_address = JSON.parse(shipping_address);
      }

      shippingAddress = {...shipping_address, postal_code: shipping_address.postCode};
      if (!shippingAddress.id || shippingAddress.id === '') {
        shippingAddress = await this.createAddress(authUser, shippingAddress);
      }
    }
    /** check whether shipping address is required or not and based on it we're using admin address in case shipping address is not provided */
    if (this.isAllCouponProduct(cartItems)) {
      if (!shippingAddress) {
        return await this.getAdminPaymentAddress();
      }
    }
    console.log('4444', shippingAddress);
    return shippingAddress;
  },

  getAddress: async function (addressId) {
    return await PaymentAddress.findOne({
      id: addressId
    });
  },
  getAdminPaymentAddress: async function () {
    return await PaymentAddress.findOne({
      id: adminPaymentAddressId
    });
  },

  hasPaymentTransactionBeenUsed: async function (paymentMethod, transactionId) {
    const numberOfTransaction = await Payment.count().where({
      transection_key: transactionId,
      payment_type: paymentMethod,
      deletedAt: null
    });
    return numberOfTransaction > 0;
  },
  getPaymentRowPartial: async function (paymentMethod, transactionId) {
    return Payment.find({
      transection_key: transactionId,
      payment_type: paymentMethod,
      order_type: 2,
      deletedAt: null
    });
  },

  isAllowedForPartialPay: function (order, globalConfigs) {
    const currentDate = moment(new Date());
    const orderedDate = moment(order.createdAt);
    const duration = moment.duration(currentDate.diff(orderedDate));
    const expendedHour = Math.floor(duration.asHours());
    // eslint-disable-next-line eqeqeq
    return !(globalConfigs.partial_payment_duration < expendedHour || order.status == CANCELED_ORDER);
  },

  isAllCouponProduct: function (cartItems) {
    const couponProductFound = cartItems.filter((cartItem) => {
      return cartItem.product_id && !!cartItem.product_id.is_coupon_product;
    });
    return (couponProductFound && couponProductFound.length > 0 && cartItems.length === couponProductFound.length);
  },

  calcCourierCharge: function (cartItems, shippingDhakaZillaId, globalConfigs) {
    let noShippingCharge = false;

    /** take decision for adding shipping charge */
    if (cartItems && cartItems.length > 0) {

      let productFreeShippingFound = cartItems.filter(item => {
        return (item.product_id && item.product_id.free_shipping);
      });

      noShippingCharge = this.isAllCouponProduct(cartItems) || (
        productFreeShippingFound && productFreeShippingFound.length > 0 && cartItems.length === productFreeShippingFound.length
      );
    }
    /** END */

    let courierCharge = 0;

    if (!noShippingCharge) {
      let maxDhakaCharge = 0;
      let maxOutsideDhakaCharge = 0;
      let len = cartItems.length;
      for (let i = 0; i < len; i++) {
        let itemDhakaCharge = 0;
        let itemOutsideDhakaCharge = 0;
        if (!_.isUndefined(cartItems[i].product_id) && cartItems[i].product_id.free_shipping === 0) {
          itemDhakaCharge = cartItems[i].product_id.dhaka_charge ? cartItems[i].product_id.dhaka_charge : globalConfigs.dhaka_charge;
          itemOutsideDhakaCharge = cartItems[i].product_id.outside_dhaka_charge ? cartItems[i].product_id.outside_dhaka_charge : globalConfigs.outside_dhaka_charge;
        }
        maxDhakaCharge = Math.max(maxDhakaCharge, itemDhakaCharge);
        maxOutsideDhakaCharge = Math.max(maxOutsideDhakaCharge, itemOutsideDhakaCharge);
      }


      if (shippingDhakaZillaId) {
        if (parseInt(shippingDhakaZillaId) === dhakaZilaId) {
          courierCharge = maxDhakaCharge;
        } else {
          courierCharge = maxOutsideDhakaCharge;
        }
      } else {
        courierCharge = globalConfigs.outside_dhaka_charge;
      }
    }

    return courierCharge;
  },

  createPayment: async (db, subordersTemp, additionalColumns = {}) => {
    let paymentTemp = [];
    for (let i = 0; i < subordersTemp.length; i++) {
      let paymentObj = await Payment.create({
        suborder_id: subordersTemp[i].id,
        payment_amount: subordersTemp[i].total_price,
        ...additionalColumns
      }).fetch().usingConnection(db);

      paymentTemp.push(paymentObj);
    }
    return paymentTemp;
  },

  calcCartTotal: async function (cart, cartItems) {
    let grandOrderTotal = 0;
    let totalQty = 0;
    for (let cartItem of cartItems) {
      if (cartItem.product_quantity > 0) {
        let productUnitPrice = cartItem.product_id.price;
        let variantAdditionalPrice = 0;

        let itemVariants = cartItem.cart_item_variants;
        if(itemVariants && itemVariants.length > 0){
          for(let i = 0; i < itemVariants.length; i++){
            let productVariantInfo = await ProductVariant.findOne({id: itemVariants[i].product_variant_id, deletedAt: null});
            variantAdditionalPrice += productVariantInfo.quantity;
          }
        }
        productUnitPrice += variantAdditionalPrice;

        let productFinalPrice = productUnitPrice * cartItem.product_quantity;

        let offerProducts = await sails.helpers.cacheRead('getAllOfferedProducts');
        // console.log('######### getAllOfferedProducts from cache ############', offerProducts);

        if ((offerProducts && !_.isUndefined(offerProducts[cartItem.product_id.id]) && offerProducts[cartItem.product_id.id])) {
          if (offerProducts && offerProducts[cartItem.product_id.id].calculation_type === 'absolute') {
            let productPrice = productUnitPrice - offerProducts[cartItem.product_id.id].discount_amount;
            productFinalPrice = productPrice * cartItem.product_quantity;
          } else {
            let productPrice = Math.ceil(productUnitPrice - (productUnitPrice * (offerProducts[cartItem.product_id.id].discount_amount / 100.0)));
            productFinalPrice = productPrice * cartItem.product_quantity;
          }
        }

        /*if (!cartItem.product_id.promotion) {
          let productUnitPrice = cartItem.product_id.price;
          productPrice = productUnitPrice * cartItem.product_quantity;
        }*/

        grandOrderTotal += productFinalPrice;
        totalQty += cartItem.product_quantity;
      }
    }
    return {
      grandOrderTotal,
      totalQty
    };
  },

  /** This method will return variants additional price for a particular Cart Item */
  calculateItemVariantPrice: async (itemVariants) => {
    let variantAdditionalPrice = 0;
    let length = itemVariants.length;
    for(let index = 0; index < length; index++){
      let productVariant = await ProductVariant.findOne({id: itemVariants[index].product_variant_id, deletedAt: null});
      if(productVariant && productVariant.quantity){
        variantAdditionalPrice += productVariant.quantity;
      }
    }
    return variantAdditionalPrice;
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

    if (!(cartItems && cartItems.length > 0)) {
      throw new Error('No Associated Shipping Cart Item was found!');
    }
    return cartItems;
  },

  checkOfferProductsFromCartItems: async (cartItems) => {
    let offerIdNumber;
    let offerType;

    if(cartItems && cartItems.length > 0){
      let offeredProducts = await sails.helpers.cacheRead('getAllOfferedProducts');
      // console.log('######### getAllOfferedProducts from cache ############', offeredProducts);

      let len = cartItems.length;
      for(let i=0; i<len; i++){
        let {offer_id_number, offer_type} = await OfferService.getProductOfferInfo({
          id: cartItems[i].product_id.id,
          type_id: cartItems[i].product_id.type_id,
          category_id: cartItems[i].product_id.category_id,
          subcategory_id: cartItems[i].product_id.subcategory_id,
          brand_id: cartItems[i].product_id.brand_id,
          warehouse_id: cartItems[i].product_id.warehouse_id
        }, offeredProducts);


        if(i > 0){
          if(offerIdNumber !== offer_id_number || offerType !== offer_type){
            throw new Error('Different offer products or an offer product with regular product can\'t be added together in your cart!');
          }
        }

        offerIdNumber = offer_id_number;
        offerType = offer_type;
      }
    }
  },

  createAddress: async (authUser, address) => {
    return await PaymentAddress.create({
      user_id: authUser.id,
      first_name: address.firstName,
      last_name: address.lastName,
      address: address.address,
      country: address.address,
      phone: address.phone,
      postal_code: address.postal_code,
      upazila_id: address.upazila_id,
      zila_id: address.zila_id,
      division_id: address.division_id,
      status: 1
    }).fetch();
  },

  createOrder: async (db, orderDatPayload, cartItems) => {

    console.log('orderDatPayload rouzex', orderDatPayload);

    let order = await Order.create(orderDatPayload).fetch().usingConnection(db);


    /** Get unique warehouse Id for suborder................START......................... */
    let uniqueTempWarehouses = _.uniqBy(cartItems, 'product_id.warehouse_id');

    let uniqueWarehouseIds = uniqueTempWarehouses.map(o => o.product_id.warehouse_id);
    /** Get unique warehouse Id for suborder..................END......................... */

    let subordersTemp = [];

    let allOrderedProductsInventory = [];

    /** Generate Necessary sub orders according to warehouse Start **/
    let allGeneratedCouponCodes = [];


    for (let i = 0; i < uniqueWarehouseIds.length; i++) {
      let thisWarehouseID = uniqueWarehouseIds[i];

      let cartItemsTemp = cartItems.filter(
        asset => {
          return asset.product_id.warehouse_id === thisWarehouseID;
        }
      );

      /*console.log('cartItemsTemp: ', cartItemsTemp);*/

      let suborderTotalPrice = _.sumBy(cartItemsTemp, 'product_total_price');
      let suborderTotalQuantity = _.sumBy(cartItemsTemp, 'product_quantity');

      let suborder = await Suborder.create({
        product_order_id: order.id,
        warehouse_id: uniqueWarehouseIds[i],
        total_price: suborderTotalPrice,
        total_quantity: suborderTotalQuantity,
        status: 1
      }).fetch().usingConnection(db);

      let offeredProducts = await sails.helpers.cacheRead('getAllOfferedProducts');
      // console.log('######### getAllOfferedProducts from cache ############', offeredProducts);

      let suborderItemsTemp = [];
      for (let k = 0; k < cartItemsTemp.length; k++) {
        let thisCartItem = cartItemsTemp[k];
        /*console.log('thisCartItem: ', thisCartItem);*/

        let {offer_id_number, offer_type} = await OfferService.getProductOfferInfo({
          id: thisCartItem.product_id.id,
          type_id: thisCartItem.product_id.type_id,
          category_id: thisCartItem.product_id.category_id,
          subcategory_id: thisCartItem.product_id.subcategory_id,
          brand_id: thisCartItem.product_id.brand_id,
          warehouse_id: thisCartItem.product_id.warehouse_id
        }, offeredProducts);

        let newSuborderItemPayload = {
          product_suborder_id: suborder.id,
          product_id: thisCartItem.product_id.id,
          warehouse_id: thisCartItem.product_id.warehouse_id,
          product_quantity: thisCartItem.product_quantity,
          product_total_price: thisCartItem.product_total_price,
          status: 1,
          offer_type: offer_type,
          offer_id_number: offer_id_number
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
              user_id: orderDatPayload.user_id,
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

    return {suborders: subordersTemp, order, allOrderedProductsInventory, allGeneratedCouponCodes};
  },

  findAllOrderedProducts: async (orderId, suborders) => {
    let orderForMail = await Order.findOne({id: orderId})
      .populate('user_id')
      .populate('shipping_address');

    let allOrderedProducts = [];
    const subOrderLen = suborders.length;
    for (let i = 0; i < subOrderLen; i++) {
      let items = await SuborderItem.find({where: {product_suborder_id: suborders[i].id}})
        .populate('product_id');

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

  generateCouponCodes: async function (db, allGeneratedCouponCodes) {
    const allCouponCodes = [];
    if (allGeneratedCouponCodes && allGeneratedCouponCodes.length > 0) {
      const couponCodeLen = allGeneratedCouponCodes.length;
      for (let i = 0; i < couponCodeLen; i++) {
        let couponObject = await ProductPurchasedCouponCode.create(allGeneratedCouponCodes[i]).fetch().usingConnection(db);
        if (couponObject && couponObject.id) {
          allCouponCodes.push('1' + _.padStart(couponObject.id, 6, '0'));
        }
      }
    }
    return allCouponCodes;
  },

  /** Nagad helper methods. START */
  encryptSensitiveData: function ({
    sensitive_data,
    public_key,
  }) {

    const buffer = Buffer.from(sensitive_data, 'utf8');

    const encrypted = crypto.publicEncrypt(
      {
        key: public_key,
        padding: crypto.constants.RSA_PKCS1_PADDING,
      },
      buffer
    );

    return encrypted.toString('base64');
  },

  generateDigitalSignature: function ({
    sensitive_data,
    private_key,
  }) {
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(sensitive_data);
    sign.end();

    const signature = sign.sign(private_key);

    return signature.toString('base64');
  },

  decryptSensitiveData: function ({
    sensitive_data,
    private_key,
  }) {
    // decode base 64
    const buffer = Buffer.from(sensitive_data, 'base64');

    const decrypted = crypto.privateDecrypt(
      {
        key: private_key,
        padding: crypto.constants.RSA_PKCS1_PADDING,
      },
      buffer
    );
    return decrypted.toString();
  },

  isVerifiedDigitalSignature: function ({
    sensitive_data,
    signature,
    public_key,
  }) {
    // decode base 64
    const buffer = Buffer.from(signature, 'base64');

    const verify = crypto.createVerify('RSA-SHA256');
    verify.update(sensitive_data);
    verify.end();

    return verify.verify(public_key, buffer);
  },
  /** Nagad helper methods. END */

  /** Send SMS methods. START */
  sendSms: async (authUser, order, allCouponCodes, shippingAddress) => {
    try {
      let smsPhone = authUser.phone;

      if (!smsPhone && shippingAddress.phone) {
        smsPhone = shippingAddress.phone;
      }

      if (smsPhone) {
        let smsText = `??????????????? ???????????????????????? ????????????????????? ??????????????? ?????????????????? ?????????????????? ?????????????????????: ${order.id}`;
        console.log('smsTxt', smsText, smsPhone);
        if (allCouponCodes && allCouponCodes.length > 0) {
          if (allCouponCodes.length === 1) {
            smsText += ' ??????????????? ?????????????????????????????? ?????? ?????? ???????????? ?????????: ' + allCouponCodes.join(',');
          } else {
            smsText += ' ??????????????? ?????????????????????????????? ?????? ?????? ???????????? ?????????????????????: ' + allCouponCodes.join(',');
          }
        }
        SmsService.sendingOneSmsToOne([smsPhone], smsText);
      }
    } catch (err) {
      logger.orderLog(authUser.id, 'SMS sending error', err);
    }
  },

  sendSmsForPartialPayment: async (authUser, shippingAddress, orderId, {paidAmount, transaction_id}) => {
    try {
      let smsPhone = authUser.phone;

      if (!smsPhone && shippingAddress.phone) {
        smsPhone = shippingAddress.phone;
      }

      if (smsPhone) {
        let smsText = `??????????????? ???????????????????????? ????????? ?????????????????? ?????????????????????????????? ?????????????????????: ${transaction_id}, ??????????????? ??????????????????: ${paidAmount}, ?????????????????? ?????????????????????: ${orderId}`;
        console.log('smsTxt', smsText);
        SmsService.sendingOneSmsToOne([smsPhone], smsText);
      }
    } catch (err) {
      logger.orderLog(authUser.id, 'SMS sending error', err);
    }
  },

  sendSmsForRefund: async (orderId, authUser) => {
    try {
      let smsPhone = authUser.phone;

      if (smsPhone) {
        let smsText = `??????????????? ?????????????????????????????? ???????????? ???????????? ????????????????????? ????????? ?????????????????? ?????????????????? ?????????????????????: ${orderId}`;
        console.log('smsTxt', smsText);
        SmsService.sendingOneSmsToOne([smsPhone], smsText);
      }
    } catch (err) {
      logger.orderLog(authUser.id, 'SMS sending error', err);
    }
  },

  sendSmsForOrderStatusChange: async (order, authUser) => {
    try {
      let smsPhone = authUser.phone;
      let statusName = ORDER_STATUSES_INDEX[order.status];
      let smsText = '';

      if(order.status === ORDER_STATUSES.pending){
        smsText = `Dear customer, your order ${order.orderId} has been placed.Our customer service will contact you shortly. Please confirm your order.`;
      } else if(order.status === ORDER_STATUSES.processing){
        smsText = `Dear customer, your order ${order.orderId} has been selected for processing. For more, please visit:https://www.anonderbazar.com`;
      } else if(order.status === ORDER_STATUSES.returned){
        smsText = `Dear customer, your order ${order.orderId} has been returned. For more, please visit:https://www.anonderbazar.com`;
      } else if(order.status === ORDER_STATUSES.lost){
        smsText = `Dear customer, your order ${order.orderId} has been lost by courier. Sorry for the inconvenience.We are working to resolve this issue. Thanks for staying with us.`;
      } else if(order.status === ORDER_STATUSES.refund_processing){
        smsText = `Dear customer, your order ${order.orderId} has been selected for REFUND. For more, please visit:https://www.anonderbazar.com`;
      } else if(order.status === ORDER_STATUSES.refunded){
        smsText = `Dear customer, your order ${order.orderId} has been settled. For more, please visit:https://www.anonderbazar.com`;
      } else if(order.status === ORDER_STATUSES.processed){
        smsText = `Dear customer, your order ${order.orderId} has been processed. For more, please visit:https://www.anonderbazar.com`;
      } else if(order.status === ORDER_STATUSES.arrived_at_warehouse){
        smsText = `Dear customer, your order ${order.orderId} has been arrived at warehouse. For more, please visit:https://www.anonderbazar.com`;
      } else if(order.status === ORDER_STATUSES.shipped){
        smsText = `Dear customer, your order ${order.orderId} has been Shipped. For more, please visit:https://www.anonderbazar.com`;
      } else if(order.status === ORDER_STATUSES.delivered){
        smsText = `Dear customer, your order ${order.orderId} has been Delivered. Thanks for staying with us. For more, please visit:https://www.anonderbazar.com`;
      } else if(order.status === ORDER_STATUSES.canceled){
        smsText = `Dear customer, your order ${order.orderId} has been cancelled due to stock out. For more, please visit:https://www.anonderbazar.com`;
      } else if(order.status === ORDER_STATUSES.confirmed){
        smsText = `Dear customer, your order ${order.orderId} has been confirmed. For more, please visit:https://www.anonderbazar.com`;
      } else {
        smsText = `Dear Customer, Your order ${order.orderId} has been selected for ${statusName}`;
      }

      if (smsPhone) {
        console.log('smsTxt', smsText);
        SmsService.sendingOneSmsToOne([smsPhone], smsText);
      }
    } catch (err) {
      logger.orderLog(authUser.id, 'SMS sending error', err);
    }
  },

  sendEmail: async (orderForMail) => {
    try {
      EmailService.orderSubmitMail(orderForMail);
    } catch (err) {
      console.log('Email Sending Error', err);
    }
  },
  /** Send SMS methods. END */

};
