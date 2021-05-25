/**
 * SslCommerzService
 *
 * @description :: Server-side logic for processing ssl commerz payment method
 */
const {sslcommerzInstance, preparePaymentRequest, generateRandomString} = require('../../libs/sslcommerz');

module.exports = {

  placeOrder: async (authUser, requestBody, urlParams, orderDetails, addresses, globalConfigs, cart, cartItems) => {
    const {
      shippingAddress
    } = addresses;

    let {
      grandOrderTotal,
      totalQty
    } = PaymentService.calcCartTotal(cart, cartItems);

    let courierCharge = await PaymentService.calcCourierCharge(cartItems, shippingAddress.zila_id, globalConfigs);

    console.log('courierCharge', courierCharge);

    /** adding shipping charge with grandtotal */
    grandOrderTotal += courierCharge;

    console.log('grandOrderTotal', grandOrderTotal);

    const sslcommerz = sslcommerzInstance(globalConfigs);

    const randomstring = generateRandomString();

    let finalPostalCode = shippingAddress.postal_code;
    let finalAddress = shippingAddress.address;

    if (!finalPostalCode) {
      throw new Error('No Post Code has been provided.');
    }
    if (!finalAddress) {
      throw new Error('No address has been provided.');
    }
    const postBody = preparePaymentRequest(authUser, shippingAddress.id, grandOrderTotal, totalQty, finalPostalCode, finalAddress, randomstring);
    console.log('postBody', postBody);

    const sslResponse = await sslcommerz.init_transaction(postBody);
    console.log('sslcommerz.init_transaction success', sslResponse);
    /**
     * status: 'FAILED',
     failedreason: "Invalid Information! 'cus_email' is missing or empty.",

     */
    if (sslResponse && sslResponse.status === 'FAILED') {
      throw new Error(sslResponse.failedreason);
    }
    return sslResponse;
  },
  createOrder: async (db, customer, transDetails, addressIds, orderDetails) => {
    const {paymentType, sslCommerztranId, paymentResponse} = transDetails;

    const {billingAddressId, shippingAddressId} = addressIds;

    const {
      courierCharge,
      grandOrderTotal,
      totalQty,
      cart,
      cartItems
    } = orderDetails;

    let {
      suborders,
      order,
      allOrderedProductsInventory,
      allGeneratedCouponCodes
    } = await PaymentService.createOrder(db, {
      user_id: customer.id,
      cart_id: cart.id,
      total_price: grandOrderTotal,
      total_quantity: totalQty,
      billing_address: billingAddressId,
      shipping_address: shippingAddressId,
      courier_charge: courierCharge,
      courier_status: 1,
      ssl_transaction_id: sslCommerztranId
    }, cartItems);

    /** .............Payment Section ........... */
    const payments = await PaymentService.createPayment(db, suborders, {
      user_id: customer.id,
      order_id: order.id,
      payment_type: paymentType,
      details: JSON.stringify(paymentResponse),
      transection_key: sslCommerztranId,
      status: 1
    });

    const allCouponCodes = await PaymentService.generateCouponCodes(db, allGeneratedCouponCodes);

    await PaymentService.updateCart(cart.id, db, cartItems);

    await PaymentService.updateProductInventory(allOrderedProductsInventory, db);

    console.log('successfully created:', allCouponCodes, order, suborders);

    return {
      order,
      suborders,
      payments,
      allCouponCodes,
    };
  }
};
