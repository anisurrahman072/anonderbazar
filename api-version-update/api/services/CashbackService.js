module.exports = {
  createOrder: async (customer, orderDetails, addressIds, globalConfigs, courierCharge) => {
    const {paymentType, grandOrderTotal, totalQuantity} = orderDetails;

    let noShippingCharge = false;
    let onlyCouponProduct = false;
    let paymentMethodNotAllowed = false;

    const notAllowedProductFound = cartItems.filter((cartItem) => {
      // eslint-disable-next-line eqeqeq
      return cartItem.product_id && cartItem.product_id.subcategory_id == cashOnDeliveryNotAllowedForCategory;
    });

    onlyCouponProduct = couponProductFound && couponProductFound.length > 0;
    paymentMethodNotAllowed = notAllowedProductFound && notAllowedProductFound.length > 0;

    if (onlyCouponProduct || paymentMethodNotAllowed) {
      return res.status(422).json({
        message: 'Payment method is invalid for this particular order.'
      });
    }

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

      console.log('noShippingCharge',noShippingCharge);
    }

    let shippingAddress = await PaymentAddress.findOne({
      id: shippingAddressId
    }).usingConnection(db);

    if (!shippingAddress) {
      throw new Error('Associated Shipping Address was not found!');
    }

    let courierCharge = 0;
    if (!noShippingCharge) {
      if (shippingAddress && shippingAddress.id) {
        // eslint-disable-next-line eqeqeq
        courierCharge = globalConfigs.outside_dhaka_charge;
        if (productCourierCharge) {
          courierCharge = productCourierCharge;
        } else if (shippingAddress.zila_id == dhakaZilaId) {
          courierCharge = globalConfigs.dhaka_charge;
        }
      } else {
        courierCharge = globalConfigs.outside_dhaka_charge;
      }
    }

    console.log('courierCharge', courierCharge);
    grandOrderTotal += courierCharge;

    console.log('paidAmount', paidAmount);
    console.log('grandOrderTotal', grandOrderTotal);

    if (!(Math.abs(paidAmount - grandOrderTotal) < Number.EPSILON)) {
      throw new Error('Paid amount and order amount are different.');
    }

    let {subordersTemp, order, allOrderedProductsInventory, allGeneratedCouponCodes} = await payment.placeOrder(customer.id, cart.id, grandOrderTotal, totalQty, billingAddressId, shippingAddressId, courierCharge, cartItems, paymentType, db, sslCommerztranId);

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
    let orderForMail = await payment.findAllOrderedProducts(order.id, db, subordersTemp);
    orderForMail.payments = paymentTemp;

    await payment.updateCart(cart.id, db, cartItems);

    await payment.updateProductInventory(allOrderedProductsInventory, db);

    console.log('successfully created:', orderForMail, allCouponCodes, order, subordersTemp, noShippingCharge, shippingAddress);

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
