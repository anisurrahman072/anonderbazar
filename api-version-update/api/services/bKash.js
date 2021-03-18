const {fetchWithTimeout, bKashModeConfigKey} = require('../../libs/helper');
const {bKash} = require('../../config/softbd');

module.exports = {

  bKashGrandToken: async () => {
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

    console.log('bKashGrandToken-headers', headers);
    console.log('bKashGrandToken-postBody', postBody);

    const url = bKash[modeConfigKey].token_grant_url;

    const options = {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(postBody)
    };

    let tokenResponse = await fetchWithTimeout(url, options);
    tokenResponse = await tokenResponse.json();

    console.log('bKashGrandToken-response', tokenResponse);
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
    console.log('bKashCreateAgreement-headers', headers);
    console.log('bKashCreateAgreement-postBody', postBody);
    let agreementResponse = await fetchWithTimeout(url, options);
    agreementResponse = await agreementResponse.json();
    console.log('bKashCreateAgreement-response', agreementResponse);
    return agreementResponse;
  },
  bKashExecuteAgreement: async (idToken, paymentID) => {

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
    console.log('bKashExecuteAgreement-headers', headers);
    console.log('bKashExecuteAgreement-postBody', postBody);

    let tokenRes = await fetchWithTimeout(url, options);
    tokenRes = await tokenRes.json();
    console.log('bKashExecuteAgreement-response', tokenRes);
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

    let agreementQueryResponse = await fetchWithTimeout(url, options);
    return await agreementQueryResponse.json();
  },
  bKashCancelAgreement: async (idToken, agreementID) => {
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
    console.log('bKashCancelAgreement-headers', headers);
    console.log('bKashCancelAgreement-postBody', postBody);
    let cancelAgreementResponse = await fetchWithTimeout(url, options);
    cancelAgreementResponse = await cancelAgreementResponse.json();
    console.log('bKashCancelAgreement-response', cancelAgreementResponse);
    return cancelAgreementResponse;
  },
  bKashCreatePayment: async (idToken, postBody) => {
    let modeConfigKey = bKashModeConfigKey();
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: idToken,
      'X-APP-Key': bKash[modeConfigKey].app_key,
    };
    const url = bKash[modeConfigKey].payment_create;

    console.log('headers-postBody', headers, postBody);

    const options = {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(postBody)
    };
    console.log('bKashCreatePayment-headers', headers);
    console.log('bKashCreatePayment-postBody', postBody);
    let bKashResponse = await fetchWithTimeout(url, options);
    bKashResponse = await bKashResponse.json();
    console.log('bKashCreatePayment-response', bKashResponse);
    return bKashResponse;
  },
  bKashExecutePayment: async (idToken, postBody) => {
    let modeConfigKey = bKashModeConfigKey();

    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: idToken,
      'X-APP-Key': bKash[modeConfigKey].app_key,
    };

    const url = bKash[modeConfigKey].payment_execute;

    console.log('headers-postBody', headers, postBody);

    const options = {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(postBody)
    };
    console.log('bKashExecutePayment-headers', headers);
    console.log('bKashExecutePayment-postBody', postBody);
    let bKashResponse = await fetchWithTimeout(url, options);
    bKashResponse = await bKashResponse.json();
    console.log('bKashExecutePayment-response', bKashResponse);

    return bKashResponse;
  },
  bKasQueryPayment: async (idToken, paymentID) => {
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
    console.log('bKasQueryPayment-headers', headers);
    console.log('bKasQueryPayment-postBody', postBody);

    let bKashPaymentQueryResponse = await fetchWithTimeout(url, options);
    bKashPaymentQueryResponse = await bKashPaymentQueryResponse.json();
    console.log('bKasQueryPayment-response', bKashPaymentQueryResponse);

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
    let bKashSearchTranxResponse = await fetchWithTimeout(url, options);
    return await bKashSearchTranxResponse.json();

  }
};
