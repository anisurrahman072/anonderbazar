/**
 * BkashService
 *
 * @description :: Server-side logic for processing bkash payment method
 */
const {fetchWithTimeout} = require('../../libs/helper');
const {bKash} = require('../../config/softbd');
const {bKashModeConfigKey} = require('../../libs/helper');

module.exports = {

  placeOrder: async (authUser, requestBody, urlParams, orderDetails, addresses, globalConfigs, cart, cartItems) => {
  },
  createOrder: async (db, customer, transDetails, addressIds, orderDetails) => {
  },
  createBKashPayment: async (authUser, orderDetails, addresses) => {

    const {
      payerReference,
      agreement_id,
      grandOrderTotal
    } = orderDetails;

    const {
      adminPaymentAddress,
      billingAddress,
      shippingAddress
    } = addresses;

    let tokenRes = await bKashGrandToken();

    let finalBillingAddressId = null;
    let finalShippingAddressId = null;

    if (billingAddress && billingAddress.id) {
      finalBillingAddressId = billingAddress.id;
    } else if (adminPaymentAddress && adminPaymentAddress.id) {
      finalBillingAddressId = adminPaymentAddress.id;
    }

    if (shippingAddress && shippingAddress.id) {
      finalShippingAddressId = shippingAddress.id;
    } else if (adminPaymentAddress && adminPaymentAddress.id) {
      finalShippingAddressId = adminPaymentAddress.id;
    }

    if (!(payerReference)) {
      throw new Error('Invalid Request');
    }

    console.log('orderDetails', orderDetails);
    console.log('addresses', addresses);

    if (agreement_id) {
      const userWallets = await BkashCustomerWallet.find({
        user_id: authUser.id,
        agreement_id: agreement_id,
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
          agreement_id,
          billingAddressId: finalBillingAddressId,
          shippingAddressId: finalShippingAddressId
        })
      }).fetch();

      const payloadData = {
        'agreementID': agreement_id,
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
            agreement_id,
            billingAddressId: finalBillingAddressId,
            shippingAddressId: finalShippingAddressId,
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
          agreement_id,
          billingAddressId: finalBillingAddressId,
          shippingAddressId: finalShippingAddressId,
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
          billingAddressId: finalBillingAddressId,
          shippingAddressId: finalShippingAddressId,
          bKashAgreementCreateResponse,
        })
      });
      return bKashAgreementCreateResponse;
    }
    throw new Error(JSON.stringify(bKashAgreementCreateResponse));
  },
};
