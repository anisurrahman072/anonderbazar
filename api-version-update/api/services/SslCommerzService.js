/**
 * SslCommerzService
 *
 * @description :: Server-side logic for processing ssl commerz payment method
 */
const {sslcommerzInstance, preparePaymentRequest} = require('../../libs/sslcommerz');
const logger = require('../../libs/softbd-logger').Logger;
const {PAYMENT_STATUS_PAID} = require('../../libs/constants');
const {ORDER_STATUSES} = require('../../libs/orders');
module.exports = {

  placeOrder: async (authUser, requestBody, urlParams, orderDetails, addresses, globalConfigs, cart, cartItems) => {
    const {
      billingAddress,
      shippingAddress
    } = addresses;

    let {
      grandOrderTotal,
      totalQty
    } = PaymentService.calcCartTotal(cart, cartItems);

    logger.orderLog(authUser.id, 'GrandOrderTotal', grandOrderTotal);

    let courierCharge = PaymentService.calcCourierCharge(cartItems, shippingAddress.zila_id, globalConfigs);

    logger.orderLog(authUser.id, 'Courier Charge: ', courierCharge);
    /** adding shipping charge with grandtotal */
    grandOrderTotal += courierCharge;

    logger.orderLog(authUser.id, 'final GrandOrderTotal', grandOrderTotal);

    const sslcommerz = sslcommerzInstance(globalConfigs);

    const randomstring = PaymentService.generateRandomString();

    let finalPostalCode = shippingAddress.postal_code;
    let finalAddress = shippingAddress.address;

    if (!finalPostalCode) {
      throw new Error('No Post Code has been provided.');
    }
    if (!finalAddress) {
      throw new Error('No address has been provided.');
    }
    const postBody = preparePaymentRequest(authUser, {
      shippingAddressId: shippingAddress.id,
      billingAddressId: billingAddress.id,
      amountToPay: grandOrderTotal,
      totalQuantity: totalQty,
      finalPostalCode,
      finalAddress,
      randomstring
    });

    logger.orderLog(authUser.id, 'SSL Commerz payment request: ', postBody);

    const sslResponse = await sslcommerz.init_transaction(postBody);
    logger.orderLog(authUser.id, 'SSL Commerz payment response: ', sslResponse);

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
      paid_amount: grandOrderTotal,
      payment_status: PAYMENT_STATUS_PAID,
      total_quantity: totalQty,
      billing_address: billingAddressId,
      shipping_address: shippingAddressId,
      courier_charge: courierCharge,
      courier_status: 1,
      ssl_transaction_id: sslCommerztranId,
      status: ORDER_STATUSES.processing
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

    logger.orderLog(customer.id, 'ssl commerz order successfully created:', order);

    return {
      order,
      suborders,
      payments,
      allCouponCodes,
    };
  },
  makePartialPayment: async function (customer, order, request, globalConfigs) {
    const billingAddress = order.billing_address;
    const shippingAddress = order.shipping_address;
    const totalQuantity = parseFloat(order.total_quantity);
    const amountToPay = parseFloat(request.body.amount_to_pay);
    if (amountToPay <= 0) {
      throw new Error('Invalid Payment Amount.');
    }
    const sslcommerz = sslcommerzInstance(globalConfigs);

    const randomstring = PaymentService.generateRandomString();

    let finalPostalCode = shippingAddress.postal_code;
    let finalAddress = shippingAddress.address;

    if (!finalPostalCode) {
      throw new Error('No Post Code has been provided.');
    }
    if (!finalAddress) {
      throw new Error('No address has been provided.');
    }
    const postBody = preparePaymentRequest(customer, {
      orderId: order.id,
      shippingAddressId: shippingAddress.id,
      billingAddressId: billingAddress.id,
      amountToPay,
      totalQuantity,
      finalPostalCode,
      finalAddress,
      randomstring,
      isPartialPayment: true
    });

    logger.orderLog(customer.id, 'SSL Commerz payment request (Partial): ', postBody);

    const sslResponse = await sslcommerz.init_transaction(postBody);

    logger.orderLog(customer.id, 'SSL Commerz payment response (Partial): ', sslResponse);
    /**
     * status: 'FAILED',
     failedreason: "Invalid Information! 'cus_email' is missing or empty.",

     */
    if (sslResponse && sslResponse.status === 'FAILED') {
      throw new Error(sslResponse.failedreason);
    }
    return sslResponse;
  },
  refundPayment: async function (customer, payload, globalConfigs) {
    const {amountPaid, transactionDetails} = payload;

    if (!(transactionDetails && transactionDetails.bank_tran_id && transactionDetails.val_id && transactionDetails.tran_id)) {
      return false;
    }
    const sslcommerz = sslcommerzInstance(globalConfigs);
    return await sslcommerz.init_refund(transactionDetails.bank_tran_id, amountPaid, 'Order has been cancelled');
  },
  validateRefundResponse: function (refundResponse) {
    if (!(refundResponse && _.isObject(refundResponse))) {
      return false;
    }
    if (refundResponse.APIConnect !== 'DONE' || refundResponse.status === 'failed') {
      return false;
    }

    return true;
  }
};
