const {cashOnDeliveryNotAllowedForCategory} = require('../../config/softbd');

module.exports = {
  createOrder: async (authUser, requestBody, urlParams, orderDetails, address, globalConfigs, cart, cartItems) => {
    const {billingAddress, shippingAddress} = address;
    let {paymentType} = orderDetails;

    let {
      grandOrderTotal,
      totalQty
    } = await PaymentService.calcCartTotal(cart, cartItems);

    let {
      courierCharge,
      adminPaymentAddress
    } = await PaymentService.calcCourierCharge(cartItems, urlParams, globalConfigs);

    grandOrderTotal += courierCharge;

    /** Check weather cashback is valid payment method for the customer */

    let onlyCouponProduct;
    let paymentMethodNotAllowed;

    const notAllowedProductFound = cartItems.filter((cartItem) => {
      return cartItem.product_id && cartItem.product_id.subcategory_id == cashOnDeliveryNotAllowedForCategory;
    });

    const couponProductFound = cartItems.filter((cartItem) => {
      return cartItem.product_id && !!cartItem.product_id.is_coupon_product;
    });

    onlyCouponProduct = couponProductFound && couponProductFound.length > 0;
    paymentMethodNotAllowed = notAllowedProductFound && notAllowedProductFound.length > 0;

    if (onlyCouponProduct || paymentMethodNotAllowed) {
      throw new Error('Payment method is invalid for this particular order.');
    }
    /** END */

    /** Check weather Shipping address & Billing address found or not */

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
    /** END */

    const {
      orderForMail,
      order,
      subordersTemp
    } = await sails.getDatastore()
      .transaction(async (db) => {

        /** Create order => suborders => suborders item variants */
        let {
          subordersTemp,
          order,
          allOrderedProductsInventory,
          allGeneratedCouponCodes
        } = await PaymentService.placeOrder(authUser.id, cart.id, grandOrderTotal, totalQty, billingAddress.id, shippingAddress.id, courierCharge, cartItems, paymentType, db);
        /** END */

        /** .............Payment Section ........... */
        let paymentResponse = {
          'purpose': 'CashOn Delivery Payment for product purchase'
        };
        let sslCommerztranId = null;

        let paymentTemp = await PaymentService.createPayment(db, subordersTemp, authUser, order, paymentType, paymentResponse, sslCommerztranId);

        // Start/Delete Cart after submitting the order
        let orderForMail = await PaymentService.findAllOrderedProducts(order.id, db, subordersTemp);
        orderForMail.payments = paymentTemp;

        await PaymentService.updateCart(cart.id, db, cartItems);

        await PaymentService.updateProductInventory(allOrderedProductsInventory, db);

        console.log('successfully created:', orderForMail, order, subordersTemp, shippingAddress);

        return {
          orderForMail,
          order,
          subordersTemp
        };
      });
    let allCouponCodes = [];

    if (authUser.phone || shippingAddress.phone) {
      await PaymentService.sendSms(authUser, order, allCouponCodes, shippingAddress);
    }

    await PaymentService.sendEmail(orderForMail);

    return {
      order
    };

  }
};
