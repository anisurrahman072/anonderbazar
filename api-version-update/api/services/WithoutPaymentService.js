/**
 * WithoutPaymentService
 *
 * @type {{placeOrder: (function(*=, *, *, *, *, *=, *=, *=): *)}}
 */
const {PAYMENT_STATUS_UNPAID} = require('../../libs/constants');
const {PARTIAL_ORDER_TYPE} = require('../../libs/constants');
module.exports = {
  placeOrder: async function(authUser, requestBody, urlParams, orderDetails, addresses, globalConfigs, cart, cartItems){

    let {billingAddress, shippingAddress} = addresses;

    let {
      grandOrderTotal,
      totalQty
    } = await PaymentService.calcCartTotal(cart, cartItems);

    let courierCharge = await PaymentService.calcCourierCharge(cartItems, shippingAddress.zila_id, globalConfigs);

    grandOrderTotal += courierCharge;

    const {
      allCouponCodes,
      order,
      suborders
    } = await sails.getDatastore()
      .transaction(async (db) => {
        let {
          suborders,
          order,
          allOrderedProductsInventory,
          allGeneratedCouponCodes
        } = await PaymentService.createOrder(db, {
          user_id: authUser.id,
          cart_id: cart.id,
          total_price: grandOrderTotal,
          total_quantity: totalQty,
          billing_address: billingAddress.id,
          shipping_address: shippingAddress.id,
          courier_charge: courierCharge,
          courier_status: 1,
          order_type: PARTIAL_ORDER_TYPE,
          payment_status: PAYMENT_STATUS_UNPAID,
          paid_amount: 0
        }, cartItems);

        let allCouponCodes = await PaymentService.generateCouponCodes(db, allGeneratedCouponCodes);

        await PaymentService.updateCart(cart.id, db, cartItems);

        await PaymentService.updateProductInventory(allOrderedProductsInventory, db);

        return {
          allCouponCodes,
          order,
          suborders
        };
      });

    if (authUser.phone || shippingAddress.phone) {
      await PaymentService.sendSms(authUser, order, allCouponCodes, shippingAddress);
    }

    let orderForMail = await PaymentService.findAllOrderedProducts(order.id, suborders);

    await PaymentService.sendEmail(orderForMail);

    return order;
  }
};
