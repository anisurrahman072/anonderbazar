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

    /** Customer is allowed for cashBack or not */
    const couponLotteryCashback = await CouponLotteryCashback.findOne({
      user_id: authUser.id,
      deletedAt: null
    });

    if (!(couponLotteryCashback && grandOrderTotal <= couponLotteryCashback.amount)) {
      throw new Error('The customer is not allowed to use cashback with this order.');
    }
    /** END */

    const {
      orderForMail,
      allCouponCodes,
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
          'purpose': 'Cashback Payment for coupon code purchase'
        };
        let sslCommerztranId = null;

        let paymentTemp = await PaymentService.createPayment(db, subordersTemp, authUser, order, paymentType, paymentResponse, sslCommerztranId);

        let allCouponCodes = [];

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
        let orderForMail = await PaymentService.findAllOrderedProducts(order.id, db, subordersTemp);
        orderForMail.payments = paymentTemp;

        await PaymentService.updateCart(cart.id, db, cartItems);

        await PaymentService.updateProductInventory(allOrderedProductsInventory, db);

        console.log('successfully created:', orderForMail, allCouponCodes, order, subordersTemp, shippingAddress);

        /** Update customer cashback amount */
        const cashBackAmount = couponLotteryCashback.amount;
        const deductedCashBackAmount = (cashBackAmount - grandOrderTotal);

        await CouponLotteryCashback.updateOne({
          id: couponLotteryCashback.id
        }).set({
          amount: deductedCashBackAmount
        }).usingConnection(db);
        /** END */

        return {
          orderForMail,
          allCouponCodes,
          order,
          subordersTemp
        };
      });

    if (authUser.phone || shippingAddress.phone) {
      await PaymentService.sendSms(authUser, order, allCouponCodes, shippingAddress);
    }

    await PaymentService.sendEmail(orderForMail);

    return {
      order
    };
  }
};
