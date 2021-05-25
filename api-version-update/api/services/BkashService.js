/**
 * BkashService
 *
 * @description :: Server-side logic for processing bkash payment method
 */
const moment = require('moment');
const _ = require('lodash');
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
        payment_type: 'bKash',
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
};
