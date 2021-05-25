const _ = require('lodash');
const {adminPaymentAddressId, dhakaZilaId} = require('../../config/softbd');

module.exports = {
  getFinalAddress: async function (billingAddressId, shippingAddressId) {
    let finalBillingAddressId = null;
    let finalShippingAddressId = null;
    const adminPaymentAddress = await this.getAdminPaymentAddress();

    if (billingAddressId) {
      finalBillingAddressId = billingAddressId;
    } else if (adminPaymentAddress && adminPaymentAddress.id) {
      finalBillingAddressId = adminPaymentAddress.id;
    }

    if (shippingAddressId) {
      finalShippingAddressId = shippingAddressId;
    } else if (adminPaymentAddress && adminPaymentAddress.id) {
      finalShippingAddressId = adminPaymentAddress.id;
    }

    if (finalShippingAddressId === null || finalBillingAddressId === null) {
      throw new Error('No Shipping or Billing Address found!');
    }

    return {finalBillingAddressId, finalShippingAddressId};
  },

  getBillingAddress: async function (req, shippingAddress) {
    let billingAddress = null;
    if (req.param('billing_address') && _.isObject(req.param('billing_address'))) {
      billingAddress = {...req.param('billing_address')};
      if ((!billingAddress.id || billingAddress.id === '') && req.param('is_copy') === false) {

        let paymentAddress = await this.createAddress(billingAddress);
        billingAddress.id = paymentAddress.id;

      } else if (req.param('is_copy') === true && _.isObject(shippingAddress)) {
        billingAddress = {...shippingAddress};
      }
    }
    return billingAddress;
  },
  getShippingAddress: async function (req, cartItems = []) {
    let shippingAddress = null;
    if (req.param('shipping_address')) {
      shippingAddress = {...req.param('shipping_address')};
      if (!shippingAddress.id || shippingAddress.id === '') {
        let shippingAddres = await this.createAddress(shippingAddress);
        shippingAddress.id = shippingAddres.id;
      }
    }
    /** check whether shipping address is required or not and based on it we're using admin address in case shipping address is not provided */
    if (this.isAllCouponProduct(cartItems)) {
      if (!shippingAddress) {
        return await this.getAdminPaymentAddress();
      }
    }
    return shippingAddress;
  },

  getAdminPaymentAddress: async function () {
    return await PaymentAddress.findOne({
      id: adminPaymentAddressId
    });
  },

  isAllCouponProduct: function (cartItems) {
    const couponProductFound = cartItems.filter((cartItem) => {
      return cartItem.product_id && !!cartItem.product_id.is_coupon_product;
    });
    return (couponProductFound && couponProductFound.length > 0 && cartItems.length === couponProductFound.length);
  },

  calcCourierCharge: async function (cartItems, shippingAddressId, globalConfigs) {
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

      if (shippingAddressId) {
        if (shippingAddressId === dhakaZilaId) {
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

    if (!(cartItems && cartItems.length > 0)) {
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

  createOrder: async (db, orderDatPayload, cartItems) => {

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

  sendSms: async (authUser, order, allCouponCodes, shippingAddress) => {
    try {
      let smsPhone = authUser.phone;

      if (!smsPhone && shippingAddress.phone) {
        smsPhone = shippingAddress.phone;
      }

      if (smsPhone) {
        let smsText = `anonderbazar.com এ আপনার অর্ডারটি সফলভাবে গৃহীত হয়েছে। অর্ডার নাম্বার: ${order.id}`;
        console.log('smsTxt', smsText);
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
