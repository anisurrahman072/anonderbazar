const {bKash} = require('../../config/softbd');
const {bKashModeConfigKey} = require('../../libs/helper');
const fetch = require('node-fetch');
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
    const tokenResponse = await fetch(url, options);
    return await tokenResponse.json();
  },
  bKashCreateAgreement: async (idToken, userId, payerReference) => {
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
      payerReference: payerReference,
      callbackURL: 'http://api.test.anonderbazar.com/api/v1/bkash-payment/agreement-callback-checkout/' + userId,
    };

    const url = bKash[modeConfigKey].agreement_create;

    const options = {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(postBody)
    };

    let agreementResponse = await fetch(url, options);
    agreementResponse = await agreementResponse.json();
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

    let tokenRes = await fetch(url, options);
    return await tokenRes.json();

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
    let bKashResponse = await fetch(url, options);
    return await bKashResponse.json();
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
    let bKashResponse = await fetch(url, options);
    return await bKashResponse.json();

  }
};
