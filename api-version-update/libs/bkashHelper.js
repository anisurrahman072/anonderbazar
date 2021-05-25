/**
 * bkashHelper
 *
 */
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

    const url = bKash[modeConfigKey].token_grant_url;

    const options = {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(postBody)
    };

    console.log('############# Grand Token Start ########################');
    console.log('bKash Grand Token-headers', headers);
    console.log('bKash Grand Token-postBody', postBody);

    let tokenResponse = await fetchWithTimeout(url, options);
    tokenResponse = await tokenResponse.json();

    console.log('bKash Grand Token-response', tokenResponse);
    console.log('############# Grand Token End ########################');
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
    console.log('############# Create Agreement Start ########################');
    console.log('bKash Create Agreement-headers', headers);
    console.log('bKash Create Agreement-postBody', postBody);
    let agreementResponse = await fetchWithTimeout(url, options);
    agreementResponse = await agreementResponse.json();
    console.log('bKash Create Agreement-response', agreementResponse);
    console.log('############# Create Agreement End ########################');
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
    console.log('############# Execute Agreement Start ########################');
    console.log('bKash Execute Agreement-headers', headers);
    console.log('bKash Execute Agreement-postBody', postBody);

    let tokenRes = await fetchWithTimeout(url, options);
    tokenRes = await tokenRes.json();
    console.log('bKash Execute Agreement-response', tokenRes);
    console.log('############# Execute Agreement End ########################');
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
    sails.log('############# Cancel Agreement Start ########################');
    sails.log('bKash Cancel Agreement-headers', headers);
    sails.log('bKash Cancel Agreement-postBody', postBody);
    let cancelAgreementResponse = await fetchWithTimeout(url, options);
    cancelAgreementResponse = await cancelAgreementResponse.json();
    sails.log('bKash Cancel Agreement-response', cancelAgreementResponse);
    sails.log('############# Cancel Agreement End ########################');
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

    sails.log('headers-postBody', headers, postBody);

    const options = {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(postBody)
    };
    sails.log('############# Create Payment Start ########################');
    sails.log('bKash Create Payment-headers', headers);
    sails.log('bKash Create Payment-postBody', postBody);
    let bKashResponse = await fetchWithTimeout(url, options);
    bKashResponse = await bKashResponse.json();
    sails.log('bKash Create Payment-response', bKashResponse);
    sails.log('############# Create Payment End ########################');
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

    sails.log('headers-postBody', headers, postBody);

    const options = {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(postBody)
    };
    sails.log('############# Execute Payment Start ########################');
    sails.log('bKash Execute Payment-headers', headers);
    sails.log('bKash Execute Payment-postBody', postBody);
    let bKashResponse = await fetchWithTimeout(url, options);
    bKashResponse = await bKashResponse.json();
    sails.log('bKashExecutePayment-response', bKashResponse);
    sails.log('############# Execute Payment End ########################');
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
    sails.log('############# Query Payment Start ########################');
    sails.log('bKash Query Payment-headers', headers);
    sails.log('bKash Query Payment-postBody', {paymentID});

    let bKashPaymentQueryResponse = await fetchWithTimeout(url, options);
    bKashPaymentQueryResponse = await bKashPaymentQueryResponse.json();
    sails.log('bKash Query Payment-response', bKashPaymentQueryResponse);
    sails.log('############# Query Payment End ########################');
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
  }
};
