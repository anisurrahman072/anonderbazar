/**
 * bkashHelper
 *
 */
const {fetchWithTimeout} = require('../libs/helper');
const {bKash} = require('../config/softbd');
const {bKashModeConfigKey} = require('../libs/helper');
const logger = require('../libs/softbd-logger').Logger;
module.exports = {
  bKashGrandToken: async (authUser) => {
    let modeConfigKey = bKashModeConfigKey();

    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      username: bKash[modeConfigKey].username,
      password: bKash[modeConfigKey].password,
    };

    const postBody = {
      app_key: bKash[modeConfigKey].app_key,
      app_secret: bKash[modeConfigKey].app_secret,
    };

    const url = bKash[modeConfigKey].token_grant_url;

    const options = {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(postBody)
    };

    logger.orderLog(authUser.id, '############# Grand Token Start ########################');
    logger.orderLog(authUser.id, 'bKash Grand Token-headers', headers);
    logger.orderLog(authUser.id, 'bKash Grand Token-postBody', postBody);

    let tokenResponse = await fetchWithTimeout(url, options);
    tokenResponse = await tokenResponse.json();

    logger.orderLog(authUser.id, 'bKash Grand Token-response', tokenResponse);
    logger.orderLog(authUser.id, '############# Grand Token End ########################');
    return tokenResponse;
  },
  bKashCreateAgreement: async (idToken, userId, payerReference, callbackURL) => {

    if (!idToken) {
      return false;
    }

    let modeConfigKey = bKashModeConfigKey();
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: idToken,
      'X-APP-Key': bKash[modeConfigKey].app_key,
    };

    const postBody = {
      mode: '0000',
      payerReference,
      callbackURL
    };

    const url = bKash[modeConfigKey].agreement_create;

    const options = {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(postBody)
    };
    logger.orderLog(userId, '############# Create Agreement Start ########################');
    logger.orderLog(userId,'bKash Create Agreement-headers', headers);
    logger.orderLog(userId,'bKash Create Agreement-postBody', postBody);
    let agreementResponse = await fetchWithTimeout(url, options);
    agreementResponse = await agreementResponse.json();
    logger.orderLog(userId,'bKash Create Agreement-response', agreementResponse);
    logger.orderLog(userId,'############# Create Agreement End ########################');
    return agreementResponse;
  },
  bKashExecuteAgreement: async (customer, idToken, paymentID) => {

    let modeConfigKey = bKashModeConfigKey();
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: idToken,
      'X-APP-Key': bKash[modeConfigKey].app_key,
    };

    const postBody = {
      'paymentID': paymentID,
    };

    const url = bKash[modeConfigKey].agreement_execute;

    const options = {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(postBody)
    };
    logger.orderLog(customer.id,'############# Execute Agreement Start ########################');
    logger.orderLog(customer.id,'bKash Execute Agreement-headers', headers);
    logger.orderLog(customer.id,'bKash Execute Agreement-postBody', postBody);

    let tokenRes = await fetchWithTimeout(url, options);
    tokenRes = await tokenRes.json();
    logger.orderLog(customer.id,'bKash Execute Agreement-response', tokenRes);
    logger.orderLog(customer.id,'############# Execute Agreement End ########################');
    return tokenRes;
  },
  bKashQueryAgreement: async (idToken, agreementID) => {
    let modeConfigKey = bKashModeConfigKey();
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: idToken,
      'X-APP-Key': bKash[modeConfigKey].app_key,
    };

    const postBody = {
      'agreementID': agreementID,
    };
    const url = bKash[modeConfigKey].agreement_status;

    const options = {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(postBody)
    };
    console.log('############# Query Agreement Start ########################');
    console.log('bKash Query Agreement-headers', headers);
    console.log('bKash Query Agreement-postBody', postBody);
    let agreementQueryResponse = await fetchWithTimeout(url, options);
    agreementQueryResponse = await agreementQueryResponse.json();
    console.log('bKash Query Agreement-response', agreementQueryResponse);
    console.log('############# Query Agreement End ########################');
    return agreementQueryResponse;
  },
  bKashCancelAgreement: async (authUser, idToken, agreementID) => {
    let modeConfigKey = bKashModeConfigKey();
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: idToken,
      'X-APP-Key': bKash[modeConfigKey].app_key,
    };

    const postBody = {
      'agreementID': agreementID,
    };

    const url = bKash[modeConfigKey].agreement_cancel;

    const options = {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(postBody)
    };
    logger.orderLog(authUser.id,'############# Cancel Agreement Start ########################');
    logger.orderLog(authUser.id,'bKash Cancel Agreement-headers', headers);
    logger.orderLog(authUser.id,'bKash Cancel Agreement-postBody', postBody);
    let cancelAgreementResponse = await fetchWithTimeout(url, options);
    cancelAgreementResponse = await cancelAgreementResponse.json();
    logger.orderLog(authUser.id,'bKash Cancel Agreement-response', cancelAgreementResponse);
    logger.orderLog(authUser.id,'############# Cancel Agreement End ########################');
    return cancelAgreementResponse;
  },
  bKashCreatePayment: async (authUser, idToken, postBody) => {
    let modeConfigKey = bKashModeConfigKey();
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: idToken,
      'X-APP-Key': bKash[modeConfigKey].app_key,
    };
    const url = bKash[modeConfigKey].payment_create;
    const options = {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(postBody)
    };
    logger.orderLog(authUser.id,'############# Create Payment Start ########################');
    logger.orderLog(authUser.id,'bKash Create Payment-headers', headers);
    logger.orderLog(authUser.id,'bKash Create Payment-postBody', postBody);
    let bKashResponse = await fetchWithTimeout(url, options);
    bKashResponse = await bKashResponse.json();
    logger.orderLog(authUser.id,'bKash Create Payment-response', bKashResponse);
    logger.orderLog(authUser.id,'############# Create Payment End ########################');
    return bKashResponse;
  },
  bKashExecutePayment: async (customer, idToken, postBody) => {
    let modeConfigKey = bKashModeConfigKey();

    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: idToken,
      'X-APP-Key': bKash[modeConfigKey].app_key,
    };

    const url = bKash[modeConfigKey].payment_execute;
    const options = {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(postBody)
    };
    logger.orderLog(customer.id,'############# Execute Payment Start ########################');
    logger.orderLog(customer.id,'bKash Execute Payment-headers', headers);
    logger.orderLog(customer.id,'bKash Execute Payment-postBody', postBody);
    let bKashResponse = await fetchWithTimeout(url, options);
    bKashResponse = await bKashResponse.json();
    logger.orderLog(customer.id,'bKashExecutePayment-response', bKashResponse);
    logger.orderLog(customer.id,'############# Execute Payment End ########################');
    return bKashResponse;
  },
  bKasQueryPayment: async (customer, idToken, paymentID) => {
    let modeConfigKey = bKashModeConfigKey();

    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: idToken,
      'X-APP-Key': bKash[modeConfigKey].app_key,
    };

    const url = bKash[modeConfigKey].payment_query;

    const options = {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        paymentID: paymentID
      })
    };
    logger.orderLog(customer.id,'############# Query Payment Start ########################');
    logger.orderLog(customer.id,'bKash Query Payment-headers', headers);
    logger.orderLog(customer.id,'bKash Query Payment-postBody', {paymentID});

    let bKashPaymentQueryResponse = await fetchWithTimeout(url, options);
    bKashPaymentQueryResponse = await bKashPaymentQueryResponse.json();
    logger.orderLog(customer.id,'bKash Query Payment-response', bKashPaymentQueryResponse);
    logger.orderLog(customer.id,'############# Query Payment End ########################');
    return bKashPaymentQueryResponse;
  },
  bKasSearchTransaction: async (idToken, trxID) => {
    let modeConfigKey = bKashModeConfigKey();

    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: idToken,
      'X-APP-Key': bKash[modeConfigKey].app_key,
    };

    const url = bKash[modeConfigKey].transaction_search;

    const options = {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        trxID: trxID
      })
    };
    sails.log('############# Search Transaction Start ########################');
    sails.log('bKash Search Transaction-headers', headers);
    sails.log('bKash Search Transaction-postBody', {trxID});
    let bKashSearchTranxResponse = await fetchWithTimeout(url, options);
    bKashSearchTranxResponse = await bKashSearchTranxResponse.json();
    sails.log('bKash Search Transaction-response', bKashSearchTranxResponse);
    sails.log('############# Search Transaction End ########################');
    return bKashSearchTranxResponse;
  },
  bkashRefundTransaction: async (customer, idToken, payload) => {
    let modeConfigKey = bKashModeConfigKey();

    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: idToken,
      'X-APP-Key': bKash[modeConfigKey].app_key,
    };

    const url = bKash[modeConfigKey].refund_transaction;

    const options = {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        amount: payload.amount,
        trxID: payload.trxID,
        paymentID: payload.paymentID,
        sku: payload.sku,
        reason: payload.reason
      })
    };
    logger.orderLog(customer.id,'############# Bkash Refund Transaction Start ########################');
    logger.orderLog(customer.id,'bKash Refund Transaction -headers', headers);
    logger.orderLog(customer.id,'bKash Refund Transaction -postBody', options);
    let bKashRefundTranxResponse = await fetchWithTimeout(url, options);
    bKashRefundTranxResponse = await bKashRefundTranxResponse.json();
    logger.orderLog(customer.id,'bKash Refund Transaction -response', bKashRefundTranxResponse);
    logger.orderLog(customer.id,'############# Bkash Refund Transaction End ########################');
    return bKashRefundTranxResponse;
  }
};
