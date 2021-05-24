const {sslcommerzInstance} = require('../../libs/sslcommerz');
const {sslApiUrl} = require('../../config/softbd');

module.exports = {

  placeOrder: async (authUser, requestBody, urlParams, orderDetails, addresses, globalConfigs, cart, cartItems) => {
    let {
      grandOrderTotal,
      totalQty
    } = PaymentService.calcCartTotal(cart, cartItems);

    const {
      billingAddress,
      shippingAddress
    } = addresses;
    let courierCharge = await PaymentService.calcCourierCharge(cartItems, shippingAddress.id, globalConfigs);

    console.log('courierCharge', courierCharge);

    /** adding shipping charge with grandtotal */
    grandOrderTotal += courierCharge;

    console.log('grandOrderTotal', grandOrderTotal);

    const sslcommerz = sslcommerzInstance(globalConfigs);

    let {subordersTemp, order, allOrderedProductsInventory, allGeneratedCouponCodes} = await PaymentService.placeOrder(customer.id, cart.id, grandOrderTotal, totalQty, billingAddressId, shippingAddressId, courierCharge, cartItems, paymentType, db, sslCommerztranId);

    /** .............Payment Section ........... */

    let paymentTemp = await PaymentService.createPayment(db, subordersTemp, customer, order, paymentType, paymentResponse, sslCommerztranId);

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
    let orderForMail = await PaymentService.findAllOrderedProducts(order.id, db, subordersTemp);
    orderForMail.payments = paymentTemp;

    await PaymentService.updateCart(cart.id, db, cartItems);

    await PaymentService.updateProductInventory(allOrderedProductsInventory, db);

    console.log('successfully created:', orderForMail, allCouponCodes, order, subordersTemp);

    let shippingAddress = await PaymentAddress.find({
      user_id: customer.id
    }).usingConnection(db);

    if(customer.phone || shippingAddress[0].phone){
      await PaymentService.sendSms(customer, order, allCouponCodes, shippingAddress[0]);
    }

    await PaymentService.sendEmail(orderForMail);

    return {
      orderForMail,
      allCouponCodes,
      order,
      subordersTemp
    };
  }
};
