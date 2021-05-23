module.exports = {
  createOrder: async (customer, orderDetails, addressIds, globalConfigs, courierCharge, cart, cartItems) => {
    let {paymentType, grandOrderTotal, totalQuantity} = orderDetails;

    let noShippingCharge = false;
    let onlyCouponProduct = false;
    let paymentMethodNotAllowed = false;

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

    let shippingAddress = await PaymentAddress.findOne({
      id: addressIds.shippingAddressId
    });

    if (!shippingAddress) {
      throw new Error('Associated Shipping Address was not found!');
    }

    console.log('courierCharge', courierCharge);
    grandOrderTotal += courierCharge;

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
