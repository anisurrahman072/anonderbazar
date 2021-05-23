const {cashOnDeliveryNotAllowedForCategory} = require('../../config/softbd');

module.exports = {
  createOrder: async (authUser, requestBody, urlParams, orderDetails, address, globalConfigs, cart, cartItems) => {
    const {billingAddress, shippingAddress} = address;
    let {paymentType} = orderDetails;

    try {
      let {
        grandOrderTotal,
        totalQty
      } = await payment.calcCartTotal(cart, cartItems);

      let {
        courierCharge,
        adminPaymentAddress
      } = await payment.calcCourierCharge(cartItems, requestBody, urlParams, globalConfigs);

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
        allCouponCodes,
        order,
        subordersTemp
      } = await sails.getDatastore()
        .transaction(async (db) => {

          /** Create order => suborders => suborders item variants */
          let {subordersTemp, order, allOrderedProductsInventory, allGeneratedCouponCodes} = await payment.placeOrder(authUser.id, cart.id, grandOrderTotal, totalQty, billingAddress.id, shippingAddress.id, courierCharge, cartItems, paymentType, db);
          /** END */

          /** .............Payment Section ........... */
          let paymentResponse = {
            'purpose': 'Cashback Payment for coupon code purchase'
          };
          let sslCommerztranId = null;

          let paymentTemp = await payment.createPayment(db, subordersTemp, authUser, order, paymentType, paymentResponse, sslCommerztranId);

          const allCouponCodes = [];

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

          console.log('successfully created:', orderForMail, allCouponCodes, order, subordersTemp, shippingAddress);

          return {
            orderForMail,
            allCouponCodes,
            order,
            subordersTemp
          };
        });

      return {
        orderForMail,
        allCouponCodes,
        order,
        subordersTemp,
        shippingAddress
      };
    }
    catch (error){
      console.log('Error occurred while creating order!', error);
    }
  }
};
