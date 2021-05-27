/**
 * BkashService
 *
 * @description :: Server-side logic for processing bkash payment method
 */
const moment = require('moment');
const _ = require('lodash');
const {BKASH_PAYMENT_TYPE} = require('../../libs/constants');
const {sslApiUrl} = require('../../config/softbd');
const {bKashGrandToken, bKashCreatePayment, bKashCreateAgreement} = require('../../libs/bkashHelper');
module.exports = {

  placeOrder: async (authUser, requestBody, urlParams, orderDetails, addresses, globalConfigs, cart, cartItems) => {

    const payerReference = requestBody.payerReference;
    const agreementId = requestBody.agreement_id;
    if (!(payerReference)) {
      throw new Error('Invalid Bkash Payment Request');
    }

    const {
      billingAddress,
      shippingAddress
    } = addresses;

    let tokenRes = await bKashGrandToken();

    let {
      grandOrderTotal,
    } = PaymentService.calcCartTotal(cart, cartItems);

    let courierCharge = await PaymentService.calcCourierCharge(cartItems, shippingAddress.zila_id, globalConfigs);
    /** adding shipping charge with grandtotal */
    grandOrderTotal += courierCharge;

    if (agreementId) {
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
        payment_type: BKASH_PAYMENT_TYPE  ,
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

      const bKashResponse = await bKashCreatePayment(tokenRes.id_token, payloadData);

      if (bKashResponse.statusMessage === 'Successful' && bKashResponse.transactionStatus === 'Initiated') {
        await PaymentTransactionLog.updateOne({
          id: paymentTransactionLog.id
        }).set({
          status: '2',
          details: JSON.stringify({
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
          id_token: tokenRes.id_token,
          payerReference,
          agreementId,
          billingAddressId: billingAddress.id,
          shippingAddressId: shippingAddress.id,
          bKashResponse
        })
      });

      throw new Error('Problem in creating bKash payment');
    }

    const foundAgreements = await BkashCustomerWallet.find({
      user_id: authUser.id,
      wallet_no: payerReference,
      row_status: 3,
      deletedAt: null
    });

    if (foundAgreements && foundAgreements.length > 0) {
      throw new Error('Invalid Payment Reference');
    }

    const callbackURL = sslApiUrl + '/bkash-payment/agreement-callback-checkout/' + authUser.id;

    let bKashAgreementCreateResponse = await bKashCreateAgreement(tokenRes.id_token, authUser.id, payerReference, callbackURL);

    if (bKashAgreementCreateResponse.statusMessage === 'Successful' && bKashAgreementCreateResponse.agreementStatus === 'Initiated') {
      await BkashCustomerWallet.create({
        user_id: authUser.id,
        wallet_no: bKashAgreementCreateResponse.payerReference,
        payment_id: bKashAgreementCreateResponse.paymentID,
        full_response: JSON.stringify({
          id_token: tokenRes.id_token,
          billingAddressId: billingAddress.id,
          shippingAddressId: shippingAddress.id,
          bKashAgreementCreateResponse,
        })
      });
      return bKashAgreementCreateResponse;
    }
    throw new Error(JSON.stringify(bKashAgreementCreateResponse));
  },
  createOrder: async function (bKashResponse, transactionLogId, transactionDetails, customer, globalConfigs) {

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

    const {billingAddressId,shippingAddressId } = transactionDetails;
    let shippingAddress = await PaymentAddress.findOne({
      id: shippingAddressId
    });

    let cart = await PaymentService.getCart(customer.id);
    let cartItems = await PaymentService.getCartItems(cart.id);
    let courierCharge = await PaymentService.calcCourierCharge(cartItems, shippingAddress.zila_id, globalConfigs);

    let {
      grandOrderTotal,
      totalQty
    } = PaymentService.calcCartTotal(cart, cartItems);

    /** adding shipping charge with grandtotal */
    grandOrderTotal += courierCharge;

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
          payment_type: BKASH_PAYMENT_TYPE ,
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
  makePartialPayment: async function (customer, order, request, globalConfigs) {
    const billingAddress = order.billing_address;
    const shippingAddress = order.shipping_address;
    const totalQuantity = parseFloat(order.total_quantity);
    const amountToPay = parseFloat(request.body.amount_to_pay);
    if (amountToPay <= 0) {
      throw new Error('Invalid Payment Amount.');
    }
    const payerReference = request.body.payerReference;
    const agreementId = request.body.agreement_id;
    if (!(payerReference && agreementId)) {
      throw new Error('Invalid Bkash Payment Request');
    }

    let tokenRes = await bKashGrandToken();
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
      payment_type: BKASH_PAYMENT_TYPE  ,
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
      'callbackURL': sslApiUrl + '/bkash-payment/payment-callback/' + customer.id + '/' + paymentTransactionLog.id,
      'amount': amountToPay,
      'currency': 'BDT',
      'intent': 'sale',
      'merchantInvoiceNumber': paymentTransactionLog.id
    };

    const bKashResponse = await bKashCreatePayment(tokenRes.id_token, payloadData);

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
  }
};
