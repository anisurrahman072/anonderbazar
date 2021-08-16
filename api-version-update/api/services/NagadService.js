const {PAYMENT_STATUS_PAID, APPROVED_PAYMENT_APPROVAL_STATUS} = require('../../libs/constants');
const {ORDER_STATUSES} = require('../../libs/orders');
const logger = require('../../libs/softbd-logger').Logger;
const {completePayment} = require('../../libs/nagadHelper');

module.exports = {
  placeOrder: async (authUser, requestBody, urlParams, orderDetails, addresses, globalConfigs, cart, cartItems) => {
    const {
      billingAddress,
      shippingAddress
    } = addresses;

    let {
      grandOrderTotal,
      totalQty
    } = await PaymentService.calcCartTotal(cart, cartItems);

    let courierCharge = PaymentService.calcCourierCharge(cartItems, shippingAddress.zila_id, globalConfigs);

    /** adding shipping charge with grandtotal */
    grandOrderTotal += courierCharge;

    let finalPostalCode = shippingAddress.postal_code;
    let finalAddress = shippingAddress.address;

    if (!finalPostalCode) {
      throw new Error('No Post Code has been provided.');
    }
    if (!finalAddress) {
      throw new Error('No address has been provided.');
    }

    /** Driver code for Nagad Integration */
    let completeResponse = await completePayment(grandOrderTotal, {
      userId: authUser.id,
      billingAddressId: billingAddress.id,
      shippingAddressId: shippingAddress.id,
      isPartialOrder: false
    });

    return completeResponse;
  },

  createOrder: async (db, customer, transDetails, addressIds, orderDetails) => {
    const {paymentType, paidAmount, paymentResponse} = transDetails;
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
      paid_amount: paidAmount,
      payment_status: PAYMENT_STATUS_PAID,
      total_quantity: totalQty,
      billing_address: billingAddressId,
      shipping_address: shippingAddressId,
      courier_charge: courierCharge,
      courier_status: 1,
      status: ORDER_STATUSES.processing
    }, cartItems);

    /** .............Payment Section ........... */
    const payments = await PaymentService.createPayment(db, suborders, {
      user_id: customer.id,
      order_id: order.id,
      payment_type: paymentType,
      details: JSON.stringify(paymentResponse),
      transection_key: paymentResponse.issuerPaymentRefNo,
      status: 1,
      approval_status: APPROVED_PAYMENT_APPROVAL_STATUS
    });

    const allCouponCodes = await PaymentService.generateCouponCodes(db, allGeneratedCouponCodes);

    await PaymentService.updateCart(cart.id, db, cartItems);

    await PaymentService.updateProductInventory(allOrderedProductsInventory, db);

    logger.orderLog(customer.id, 'Nagad order successfully created:', order);

    return {
      order,
      suborders,
      payments,
      allCouponCodes,
    };
  },

  makePartialPayment: async (customer, order, request, globalConfigs) => {
    const billingAddress = order.billing_address;
    const shippingAddress = order.shipping_address;
    const totalQuantity = parseFloat(order.total_quantity);
    const amountToPay = parseFloat(request.body.amount_to_pay);
    if (amountToPay <= 0) {
      throw new Error('Invalid Payment Amount.');
    }

    let finalPostalCode = shippingAddress.postal_code;
    let finalAddress = shippingAddress.address;

    if (!finalPostalCode) {
      throw new Error('No Post Code has been provided.');
    }
    if (!finalAddress) {
      throw new Error('No address has been provided.');
    }

    /** Driver code for Nagad Integration */
    let completeResponse = await completePayment(amountToPay, {
      userId: customer.id,
      orderId: order.id,
      billingAddressId: billingAddress.id,
      shippingAddressId: shippingAddress.id,
      isPartialOrder: true
    });

    return completeResponse;
  }
};
