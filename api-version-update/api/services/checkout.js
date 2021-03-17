const moment = require('moment');
const _ = require('lodash');
const {dhakaZilaId} = require('../../config/softbd');
const {bKashCreatePayment} = require('./bKash');
const {bKashGrandToken} = require('./bKash');
const {sslApiUrl} = require('../../config/softbd');
const {sslcommerzInstance} = require('../../libs/sslcommerz');
module.exports = {
  placeSSlCommerzOrder: async (authUser, orderDetails, addresses, globalConfigs) => {

    const {adminPaymentAddress, billingAddress, shippingAddress} = addresses;
    const {grandOrderTotal, totalQuantity} = orderDetails;
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

    if (billingAddress && billingAddress.id) {
      finalBillingAddressId = billingAddress.id;
    } else if (adminPaymentAddress && adminPaymentAddress.id) {
      finalBillingAddressId = adminPaymentAddress.id;
    }

    if (shippingAddress && shippingAddress.id) {
      finalShippingAddressId = shippingAddress.id;
    } else if (adminPaymentAddress && adminPaymentAddress.id) {
      finalShippingAddressId = adminPaymentAddress.id;
    }

    if (finalShippingAddressId === null || finalBillingAddressId === null) {
      throw new Error('No Shipping or Billing Address found!');
    }

    let finalPostalCode = null;
    let finalAddress = null;
    if (shippingAddress && shippingAddress.postal_code) {
      finalPostalCode = shippingAddress.postal_code;
    } else if (adminPaymentAddress && adminPaymentAddress.postal_code) {
      finalPostalCode = adminPaymentAddress.postal_code;
    }
    if (shippingAddress && shippingAddress.address) {
      finalAddress = shippingAddress.address;
    } else if (adminPaymentAddress && adminPaymentAddress.address) {
      finalAddress = adminPaymentAddress.address;
    }

    let post_body = {};
    post_body['total_amount'] = grandOrderTotal;
    post_body['currency'] = 'BDT';
    post_body['tran_id'] = randomstring;

    post_body['success_url'] = sslApiUrl + '/ssl-commerz/success/?user_id=' + authUser.id + '&billing_address=' + finalBillingAddressId + '&shipping_address=' + finalShippingAddressId;
    post_body['fail_url'] = sslApiUrl + '/ssl-commerz/failure/?user_id=' + authUser.id + '&billing_address=' + finalBillingAddressId + '&shipping_address=' + finalShippingAddressId;
    post_body['cancel_url'] = sslApiUrl + '/ssl-commerz/error/?user_id=' + authUser.id + '&billing_address=' + finalBillingAddressId + '&shipping_address=' + finalShippingAddressId;

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
    post_body['num_of_item'] = totalQuantity;
    post_body['product_name'] = 'Test';
    post_body['product_category'] = 'Anonder Bazar';
    post_body['product_profile'] = 'general';

    /*
    console.log('sslcommerz.init_transaction error', error);
      res.writeHead(301,
        {Location: sslWebUrl + '/checkout'}
      );
      res.end();
   */
    const sslResponse = await sslcommerz.init_transaction(post_body);
    console.log('sslcommerz.init_transaction success', sslResponse);
    return sslResponse;
  },
  createBKashPayment: async (authUser, orderDetails, addresses) => {
    const {
      payerReference,
      agreement_id,
      grandOrderTotal
    } = orderDetails;

    const {
      adminPaymentAddress,
      billingAddress,
      shippingAddress
    } = addresses;

    const userWallets = await BkashCustomerWallet.find({
      user_id: authUser.id,
      agreement_id: agreement_id,
      row_status: 3,
      deletedAt: null
    });

    if (!(userWallets && userWallets.length > 0)) {
      throw new Error('Invalid Request');
    }

    let tokenRes = await bKashGrandToken();

    console.log('tokenRes', tokenRes);

    let finalBillingAddressId = null;
    let finalShippingAddressId = null;

    if (billingAddress && billingAddress.id) {
      finalBillingAddressId = billingAddress.id;
    } else if (adminPaymentAddress && adminPaymentAddress.id) {
      finalBillingAddressId = adminPaymentAddress.id;
    }

    if (shippingAddress && shippingAddress.id) {
      finalShippingAddressId = shippingAddress.id;
    } else if (adminPaymentAddress && adminPaymentAddress.id) {
      finalShippingAddressId = adminPaymentAddress.id;
    }

    if (!(agreement_id && payerReference)) {
      throw new Error('Invalid Request');
    }

    const paymentTransactionLog = await PaymentTransactionLog.create({
      user_id: authUser.id,
      payment_type: 'bKash',
      payment_amount: grandOrderTotal,
      payment_date: moment().format('YYYY-MM-DD HH:mm:ss'),
      status: '1',
      details: JSON.stringify({
        id_token: tokenRes.id_token,
        payerReference,
        agreement_id,
        billingAddressId: finalBillingAddressId,
        shippingAddressId: finalShippingAddressId
      })
    }).fetch();

    const payloadData = {
      'agreementID': agreement_id,
      'mode': '0001',
      'payerReference': payerReference,
      'callbackURL': 'http://api.test.anonderbazar.com/api/v1/bkash-payment/payment-callback/' + authUser.id + '/' + paymentTransactionLog.id,
      'amount': grandOrderTotal,
      'currency': 'BDT',
      'intent': 'sale',
      'merchantInvoiceNumber': paymentTransactionLog.id
    };

    const bKashResponse = await bKashCreatePayment(tokenRes.id_token, payloadData);

    console.log('bKashResponse', bKashResponse);

    if (bKashResponse.statusMessage === 'Successful' && bKashResponse.transactionStatus === 'Initiated') {
      await PaymentTransactionLog.updateOne({
        id: paymentTransactionLog.id
      }).set({
        status: '2',
        details: JSON.stringify({
          id_token: tokenRes.id_token,
          payerReference,
          agreement_id,
          billingAddressId: finalBillingAddressId,
          shippingAddressId: finalShippingAddressId,
          bKashResponse
        })
      });
      return bKashResponse;
    }

    await PaymentTransactionLog.updateOne({
      id: paymentTransactionLog.id
    }).set({
      status: '99',
      details: JSON.stringify({
        id_token: tokenRes.id_token,
        payerReference,
        agreement_id,
        billingAddressId: finalBillingAddressId,
        shippingAddressId: finalShippingAddressId,
        bKashResponse
      })
    });

    throw new Error('Problem in creating bKash payment');

  },
  calcCartTotal: function (cart, cartItems) {
    let grandOrderTotal = 0;
    let totalQty = 0;
    cartItems.forEach((cartItem) => {
      if (cartItem.product_id && cartItem.product_id.id && cartItem.product_quantity > 0) {
        grandOrderTotal += cartItem.product_total_price;
        totalQty += cartItem.product_quantity;
      }
    });
    return {
      grandOrderTotal,
      totalQty
    };
  },

  createOrder: async (db, customer, transDetails, addressIds, globalConfigs) => {

    const {paymentType, paidAmount, sslCommerztranId, paymentResponse} = transDetails;

    const {billingAddressId, shippingAddressId} = addressIds;

    let cart = await Cart.findOne({
      user_id: customer.id,
      deletedAt: null
    }).usingConnection(db);

    if (!cart) {
      throw new Error('Associated Shipping Cart was not found!');
    }

    let cartItems = await CartItem.find({
      cart_id: cart.id,
      deletedAt: null
    }).populate('cart_item_variants')
      .populate('product_id')
      .usingConnection(db);

    if (!cartItems || cartItems.length === 0) {
      throw new Error('Associated Shipping Cart Items were not found!');
    }

    let {
      grandOrderTotal,
      totalQty
    } = this.calcCartTotal(cart, cartItems);

    let noShippingCharge = false;

    if (cartItems && cartItems.length > 0) {

      const couponProductFound = cartItems.filter((cartItem) => {
        return cartItem.product_id && !!cartItem.product_id.is_coupon_product;
      });
      noShippingCharge = couponProductFound && couponProductFound.length > 0 && cartItems.length === couponProductFound.length;
    }

    let courierCharge = 0;
    let shippingAddress = await PaymentAddress.findOne({
      id: shippingAddressId
    }).usingConnection(db);

    if (!shippingAddress) {
      throw new Error('Associated Shipping Address was not found!');
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
      throw new Error('Paid amount and order amount are different.');
    }

    let order = await Order.create({
      user_id: customer.id,
      cart_id: cart.id,
      total_price: grandOrderTotal,
      total_quantity: totalQty,
      billing_address: billingAddressId,
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
              user_id: customer.id,
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

    /** .............Payment Section ........... */

    let paymentTemp = [];

    const allCouponCodes = [];

    for (let i = 0; i < subordersTemp.length; i++) {
      let paymentObj = await Payment.create({
        user_id: customer.id,
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
    let orderForMail = await Order.findOne({id: order.id})
      .populate('user_id')
      .populate('shipping_address')
      .usingConnection(db);

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
      subordersTemp,
      noShippingCharge,
      shippingAddress
    };

  }
};
