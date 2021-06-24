/**
 * BkashService
 *
 * @description :: Server-side logic for processing bkash payment method
 */
const moment = require('moment');
const _ = require('lodash');
const {BKASH_PAYMENT_TYPE, PAYMENT_STATUS_PAID, PAYMENT_STATUS_PARTIALLY_PAID} = require('../../libs/constants');
const {sslApiUrl} = require('../../config/softbd');
const {bKashGrandToken, bKashCreatePayment, bkashRefundTransaction} = require('../../libs/bkashHelper');
const logger = require('../../libs/softbd-logger').Logger;

module.exports = {

  placeOrder: async (authUser, requestBody, urlParams, orderDetails, addresses, globalConfigs, cart, cartItems) => {

    const payerReference = requestBody.payerReference;
    const agreementId = requestBody.agreement_id;
    if (!(payerReference && agreementId)) {
      throw new Error('Invalid Bkash Payment Request');
    }

    const {
      billingAddress,
      shippingAddress
    } = addresses;

    let tokenRes = await bKashGrandToken(authUser);

    let {
      grandOrderTotal,
    } = await PaymentService.calcCartTotal(cart, cartItems);

    logger.orderLog(authUser.id, 'GrandOrderTotal', grandOrderTotal);
    console.log('GrandOrderTotal', grandOrderTotal);
    let courierCharge = PaymentService.calcCourierCharge(cartItems, shippingAddress.zila_id, globalConfigs);
    logger.orderLog(authUser.id, 'courierCharge', courierCharge);
    console.log('courierCharge', courierCharge);

    /** adding shipping charge with grandtotal */
    grandOrderTotal += courierCharge;

    logger.orderLog(authUser.id, 'final GrandOrderTotal', grandOrderTotal);
    console.log('final GrandOrderTotal', grandOrderTotal);

    const userWallets = await BkashCustomerWallet.find({
      user_id: authUser.id,
      agreement_id: agreementId,
      wallet_no: payerReference,
      row_status: 3,
      deletedAt: null
    });

    if (!(userWallets && userWallets.length > 0)) {
      throw new Error('No bKash Wallet found with the provided agreementID');
    }

    const paymentTransactionLog = await PaymentTransactionLog.create({
      user_id: authUser.id,
      payment_type: BKASH_PAYMENT_TYPE,
      payment_amount: grandOrderTotal,
      payment_date: moment().format('YYYY-MM-DD HH:mm:ss'),
      status: '1',
      details: JSON.stringify({
        id_token: tokenRes.id_token,
        payerReference,
        agreementId,
        billingAddressId: billingAddress.id,
        shippingAddressId: shippingAddress.id
      })
    }).fetch();

    const payloadData = {
      'agreementID': agreementId,
      'mode': '0001',
      'payerReference': payerReference,
      'callbackURL': sslApiUrl + '/bkash-payment/payment-callback/' + authUser.id + '/' + paymentTransactionLog.id,
      'amount': grandOrderTotal,
      'currency': 'BDT',
      'intent': 'sale',
      'merchantInvoiceNumber': paymentTransactionLog.id
    };

    const bKashResponse = await bKashCreatePayment(authUser, tokenRes.id_token, payloadData);

    const paymentLogDetails = JSON.stringify({
      id_token: tokenRes.id_token,
      payerReference,
      agreementId,
      billingAddressId: billingAddress.id,
      shippingAddressId: shippingAddress.id,
      bKashResponse
    });

    if (bKashResponse.statusMessage === 'Successful' && bKashResponse.transactionStatus === 'Initiated') {
      await PaymentTransactionLog.updateOne({
        id: paymentTransactionLog.id
      }).set({
        status: '2',
        details: paymentLogDetails
      });
      return bKashResponse;
    }

    await PaymentTransactionLog.updateOne({
      id: paymentTransactionLog.id
    }).set({
      status: '99',
      details: paymentLogDetails
    });

    if (bKashResponse && bKashResponse.statusMessage) {
      throw new Error(bKashResponse.statusMessage);
    }
    throw new Error('Problem in creating bKash payment');

  },
  createOrder: async function (bKashResponse, transactionLogId, transactionDetails, customer, globalConfigs) {
    logger.orderLog(customer.id, '########### bKash create Order ######');
    await PaymentTransactionLog.updateOne({
      id: transactionLogId
    }).set({
      status: 3,
      details: JSON.stringify({
        id_token: transactionDetails.id_token,
        payerReference: bKashResponse.payerReference,
        agreement_id: bKashResponse.agreementID,
        billingAddressId: transactionDetails.billingAddressId,
        shippingAddressId: transactionDetails.shippingAddressId,
        bKashResponse
      })
    });

    const {billingAddressId, shippingAddressId} = transactionDetails;
    let shippingAddress = await PaymentAddress.findOne({
      id: shippingAddressId
    });

    let cart = await PaymentService.getCart(customer.id);
    let cartItems = await PaymentService.getCartItems(cart.id);
    let courierCharge = PaymentService.calcCourierCharge(cartItems, shippingAddress.zila_id, globalConfigs);

    let {
      grandOrderTotal,
      totalQty
    } = await PaymentService.calcCartTotal(cart, cartItems);

    logger.orderLog(customer.id, 'Courier Charge: ', courierCharge);
    logger.orderLog(customer.id, 'GrandOrderTotal', grandOrderTotal);
    /** adding shipping charge with grandtotal */
    grandOrderTotal += courierCharge;
    logger.orderLog(customer.id, 'final GrandOrderTotal', grandOrderTotal);

    const {
      order,
      suborders,
      payments,
      allCouponCodes,
    } = await sails.getDatastore()
      .transaction(async (db) => {
        /****** Finalize Order -------------------------- */

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
        }, cartItems);

        /** .............Payment Section ........... */
        const payments = await PaymentService.createPayment(db, suborders, {
          user_id: customer.id,
          order_id: order.id,
          payment_type: BKASH_PAYMENT_TYPE,
          details: JSON.stringify(bKashResponse),
          transection_key: bKashResponse.trxID,
          status: 1
        });
        const allCouponCodes = await PaymentService.generateCouponCodes(db, allGeneratedCouponCodes);

        await PaymentService.updateCart(cart.id, db, cartItems);

        await PaymentService.updateProductInventory(allOrderedProductsInventory, db);

        await PaymentTransactionLog.updateOne({
          id: transactionLogId
        }).set({
          order_id: order.id,
        }).usingConnection(db);

        return {
          order,
          suborders,
          payments,
          allCouponCodes,
        };

      });

    let orderForMail = await PaymentService.findAllOrderedProducts(order.id, suborders);
    orderForMail.payments = payments;

    if (customer.phone || (shippingAddress && shippingAddress.length > 0 && shippingAddress[0].phone)) {
      await PaymentService.sendSms(customer, order, allCouponCodes, shippingAddress[0]);
    }

    await PaymentService.sendEmail(orderForMail);

    return order;

  },
  makePartialPayment: async function (customer, order, request) {
    const billingAddress = order.billing_address;
    const shippingAddress = order.shipping_address;
    const amountToPay = parseFloat(request.body.amount_to_pay);
    if (amountToPay <= 0) {
      throw new Error('Invalid Payment Amount.');
    }
    const payerReference = request.body.payerReference;
    const agreementId = request.body.agreement_id;
    if (!(payerReference && agreementId)) {
      throw new Error('Invalid Bkash Payment Request');
    }

    let tokenRes = await bKashGrandToken(customer);
    const userWallets = await BkashCustomerWallet.find({
      user_id: customer.id,
      agreement_id: agreementId,
      wallet_no: payerReference,
      row_status: 3,
      deletedAt: null
    });

    if (!(userWallets && userWallets.length > 0)) {
      throw new Error('No bKash Wallet found with the provided agreementID');
    }

    const paymentTransactionLog = await PaymentTransactionLog.create({
      user_id: customer.id,
      payment_type: BKASH_PAYMENT_TYPE,
      payment_amount: amountToPay,
      payment_date: moment().format('YYYY-MM-DD HH:mm:ss'),
      status: '1',
      details: JSON.stringify({
        order_id: order.id,
        id_token: tokenRes.id_token,
        payerReference,
        agreementId,
        billingAddressId: billingAddress.id,
        shippingAddressId: shippingAddress.id
      })
    }).fetch();

    const payloadData = {
      'agreementID': agreementId,
      'mode': '0001',
      'payerReference': payerReference,
      'callbackURL': sslApiUrl + '/bkash-payment/payment-callback/' + customer.id + '/' + paymentTransactionLog.id + '?' + 'order_id=' + order.id,
      'amount': amountToPay,
      'currency': 'BDT',
      'intent': 'sale',
      'merchantInvoiceNumber': paymentTransactionLog.id
    };

    const bKashResponse = await bKashCreatePayment(customer, tokenRes.id_token, payloadData);

    if (bKashResponse.statusMessage === 'Successful' && bKashResponse.transactionStatus === 'Initiated') {
      await PaymentTransactionLog.updateOne({
        id: paymentTransactionLog.id
      }).set({
        status: '2',
        details: JSON.stringify({
          order_id: order.id,
          id_token: tokenRes.id_token,
          payerReference,
          agreementId,
          billingAddressId: billingAddress.id,
          shippingAddressId: shippingAddress.id,
          bKashResponse
        })
      });
      return bKashResponse;
    }

    await PaymentTransactionLog.updateOne({
      id: paymentTransactionLog.id
    }).set({
      status: '99',
      details: JSON.stringify({
        order_id: order.id,
        id_token: tokenRes.id_token,
        payerReference,
        agreementId,
        billingAddressId: billingAddress.id,
        shippingAddressId: shippingAddress.id,
        bKashResponse
      })
    });

    throw new Error('Problem in creating bKash payment');
  },
  savePartialPayment: async function (customer, order, bKashResponse, transactionLog, transactionDetails) {

    await PaymentTransactionLog.updateOne({
      id: transactionLog.id
    }).set({
      status: 3,
      details: JSON.stringify({
        order_id: order.id,
        id_token: transactionDetails.id_token,
        payerReference: bKashResponse.payerReference,
        agreement_id: bKashResponse.agreementID,
        billingAddressId: transactionDetails.billingAddressId,
        shippingAddressId: transactionDetails.shippingAddressId,
        bKashResponse
      })
    });

    const paidAmount = parseFloat(bKashResponse.amount);
    await sails.getDatastore()
      .transaction(async (db) => {
        await Payment.create({
          payment_amount: paidAmount,
          user_id: customer.id,
          order_id: order.id,
          payment_type: BKASH_PAYMENT_TYPE,
          details: JSON.stringify(bKashResponse),
          transection_key: bKashResponse.trxID,
          status: 1
        }).usingConnection(db);

        const totalPrice = parseFloat(order.total_price);
        const totalPaidAmount = parseFloat(order.paid_amount) + paidAmount;

        let paymentStatus = PAYMENT_STATUS_PARTIALLY_PAID;
        if (totalPrice <= totalPaidAmount) {
          paymentStatus = PAYMENT_STATUS_PAID;
        }

        await Order.updateOne({id: order.id}).set({
          paid_amount: totalPaidAmount,
          payment_status: paymentStatus,
        }).usingConnection(db);
      });

    const shippingAddress = order.shipping_address;

    if (customer.phone || (shippingAddress && shippingAddress.phone)) {
      await PaymentService.sendSmsForPartialPayment(customer, shippingAddress, order.id, {
        paidAmount: bKashResponse.amount,
        transaction_id: bKashResponse.trxID
      });
    }

    return order;
  },
  refundPayment: async function (customer, payload, globalConfigs) {

    const {
      paymentID,
      amount,
      trxID,
      sku = 'Anonder Bazar Product',
      reason = 'Order has been cancelled'
    } = payload;

    const bKashResponse = await bkashRefundTransaction(customer, payload.id_token, {
      amount,
      paymentID,
      trxID,
      sku,
      reason
    });

    /**
     * {
"completedTime":"string"
"originalTrxID":"string"
"refundTrxID":"string"
"transactionStatus":"string"
"amount":"string"
"currency":"string"
}
     or
     {
     errorCode:"string",
    errorMessage:"string"
     }
     */
    if (bKashResponse && bKashResponse.transactionStatus === 'Completed' && bKashResponse.refundTrxID && bKashResponse.amount) {

    }
  }
};
