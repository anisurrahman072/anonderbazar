const {cashOnDeliveryNotAllowedForCategory} = require('../../config/softbd');

module.exports = {
  isCashOnDeliveryAllowed: function (cartItems) {
    const notAllowedProductFound = cartItems.filter((cartItem) => {
      return cartItem.product_id && cartItem.product_id.subcategory_id == cashOnDeliveryNotAllowedForCategory;
    });
    return (notAllowedProductFound && notAllowedProductFound.length > 0);
  },

  placeOrder: async function (authUser, requestBody, urlParams, orderDetails, address, globalConfigs, cart, cartItems) {
    let {billingAddress, shippingAddress} = address;
    let {paymentType} = orderDetails;

    let {
      grandOrderTotal,
      totalQty
    } = await PaymentService.calcCartTotal(cart, cartItems);

    let courierCharge = await PaymentService.calcCourierCharge(cartItems, shippingAddress.id, globalConfigs);

    grandOrderTotal += courierCharge;

    /** Check weather cashback is valid payment method for the customer */
    if (PaymentService.isAllCouponProduct(cartItems) || this.isCashOnDeliveryAllowed(cartItems)) {
      throw new Error('Payment method is invalid for this particular order.');
    }
    /** END */

    /** Check weather Shipping address & Billing address found or not & get final addresses */
    const {
      finalBillingAddressId,
      finalShippingAddressId
    } = await PaymentService.getFinalAddress(billingAddress.id, shippingAddress.id);
    /** END */

    const {
      order,
      suborders,
      paymentTemp
    } = await sails.getDatastore()
      .transaction(async (db) => {

        /** Create order => suborders => suborders item variants */
        let {
          suborders,
          order,
          allOrderedProductsInventory
        } = await PaymentService.createOrder(db, {
          user_id: authUser.id,
          cart_id: cart.id,
          total_price: grandOrderTotal,
          total_quantity: totalQty,
          billing_address: finalBillingAddressId,
          shipping_address: finalShippingAddressId,
          courier_charge: courierCharge,
          courier_status: 1
        }, cartItems);
        /** END */

        /** .............Payment Section ........... */
        let paymentResponse = {
          'purpose': 'CashOn Delivery Payment for product purchase'
        };

        let paymentTemp = await PaymentService.createPayment(db, suborders, {
          user_id: authUser.id,
          order_id: order.id,
          payment_type: paymentType,
          details: JSON.stringify(paymentResponse),
          status: 1
        });

        // Start/Delete Cart after submitting the order

        await PaymentService.updateCart(cart.id, db, cartItems);

        await PaymentService.updateProductInventory(allOrderedProductsInventory, db);

        return {
          order,
          suborders,
          paymentTemp
        };
      });

    if (authUser.phone || shippingAddress.phone) {
      await PaymentService.sendSms(authUser, order, [], shippingAddress);
    }

    let orderForMail = await PaymentService.findAllOrderedProducts(order.id, suborders);
    orderForMail.payments = paymentTemp;

    await PaymentService.sendEmail(orderForMail);

    return order;

  }
};
