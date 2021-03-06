/**
 * CashOnDeliveryService
 *
 * @description :: Server-side logic for processing Cash on Delivery payment method
 */
const {cashOnDeliveryNotAllowedForCategory} = require('../../config/softbd');
const {PAYMENT_STATUS_UNPAID} = require('../../libs/constants');

module.exports = {
  isCashOnDeliveryAllowed: function (cartItems) {
    const notAllowedProductFound = cartItems.filter((cartItem) => {
      // eslint-disable-next-line eqeqeq
      return cartItem.product_id && cartItem.product_id.subcategory_id == cashOnDeliveryNotAllowedForCategory;
    });
    return (notAllowedProductFound && notAllowedProductFound.length > 0);
  },

  placeOrder: async function (authUser, requestBody, urlParams, orderDetails, addresses, globalConfigs, cart, cartItems) {
    let {billingAddress, shippingAddress} = addresses;
    let {paymentType} = orderDetails;

    let {
      grandOrderTotal,
      totalQty
    } = await PaymentService.calcCartTotal(cart, cartItems);
    console.log('rou grand', grandOrderTotal);
    let courierCharge = PaymentService.calcCourierCharge(cartItems, shippingAddress.zila_id, globalConfigs);


    grandOrderTotal += courierCharge;
    console.log('rou grand total with courier: ', grandOrderTotal);

    /** Check weather cashback is valid payment method for the customer */
    if (PaymentService.isAllCouponProduct(cartItems) || this.isCashOnDeliveryAllowed(cartItems)) {
      throw new Error('Payment method is invalid for this particular order.');
    }
    /** END */
    const {
      order,
      suborders,
      payments
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
          billing_address: billingAddress.id,
          shipping_address: shippingAddress.id,
          courier_charge: courierCharge,
          courier_status: 1,
          payment_status: PAYMENT_STATUS_UNPAID
        }, cartItems);
        /** END */

        /** .............Payment Section ........... */
        let paymentResponse = {
          'purpose': 'CashOn Delivery Payment for product purchase'
        };

        let payments = await PaymentService.createPayment(db, suborders, {
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
          payments
        };
      });

    if (authUser.phone || shippingAddress.phone) {
      await PaymentService.sendSms(authUser, order, [], shippingAddress);
    }

    let orderForMail = await PaymentService.findAllOrderedProducts(order.id, suborders);
    orderForMail.payments = payments;

    await PaymentService.sendEmail(orderForMail);

    return order;

  }
};
