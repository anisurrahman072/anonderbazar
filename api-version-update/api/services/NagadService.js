const {sslApiUrl} = require('../../config/softbd');
const {toHexString} = require('../../libs/nagad');

const {nagad} = require('../../config/softbd');
const {fetchWithTimeout} = require('../../libs/helper');
const {
  encryptSensitiveData,
  generateDigitalSignature,
  decryptSensitiveData,
  isVerifiedDigitalSignature
} = require('../services/PaymentService');

const crypto = require('crypto');
const moment = require('moment');

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
    const order_id = PaymentService.generateRandomString().toUpperCase();
    const date_time = moment().format('YYYYMMDDHHmmss');
    const merchant_id = nagad.merchant_id;

    const publicKey = nagad.isSandboxMode ? nagad['sandbox'].pgPublicKey : nagad['production'].pgPublicKey;
    const privateKey = nagad.isSandboxMode ? nagad['sandbox'].merchantPrivateKey : nagad['production'].merchantPrivateKey;

    const api_public_key = `-----BEGIN PUBLIC KEY-----\n${publicKey}\n-----END PUBLIC KEY-----`;
    const api_private_key = `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----`;


    const checkout_init_sensitive_data = {
      merchantId: merchant_id,
      datetime: date_time,
      orderId: order_id,
      challenge: crypto.randomBytes(20).toString('hex')
    };

    const checkout_init_body = {
      dateTime: date_time,
      sensitiveData: encryptSensitiveData({
        sensitive_data: JSON.stringify(checkout_init_sensitive_data),
        public_key: api_public_key,
      }),
      signature: generateDigitalSignature({
        sensitive_data: JSON.stringify(checkout_init_sensitive_data),
        private_key: api_private_key,
      }),
    };

    let url = nagad.isSandboxMode ? nagad['sandbox'].initialize_url : nagad['production'].initialize_url;
    url += `${merchant_id}/${order_id}`;
    const headers = {
      'X-KM-IP-V4': '192.168.10.8',
      'X-KM-Client-Type': 'PC_WEB',
      'X-KM-Api-Version': 'v-0.2.0',
      'Content-Type': 'application/json',
    };
    const options = {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(checkout_init_body)
    };

    let initializeResponse = await fetchWithTimeout(url, options);
    initializeResponse = await initializeResponse.json();
    console.log('initializeResponse: ', initializeResponse);

    const decrypted_checkout_init_res = JSON.parse(
      decryptSensitiveData({
        sensitive_data: initializeResponse.sensitiveData,
        private_key: api_private_key,
      })
    );

    const isCheckoutInitVerified = isVerifiedDigitalSignature({
      sensitive_data: JSON.stringify(decrypted_checkout_init_res),
      signature: initializeResponse.signature,
      public_key: api_public_key,
    });

    let completeResponse;

    if(isCheckoutInitVerified){
      const checkout_complete_sensitive_data = {
        merchantId: merchant_id,
        orderId: order_id,
        amount: grandOrderTotal,
        currencyCode: '050',
        challenge: decrypted_checkout_init_res.challenge,
      };

      const callbackURL = sslApiUrl + '/nagad-payment/callback-checkout/' + authUser.id + '/' + billingAddress.id + '/' + shippingAddress.id;

      const checkout_complete_body = {
        sensitiveData: encryptSensitiveData({
          sensitive_data: JSON.stringify(checkout_complete_sensitive_data),
          public_key: api_public_key,
        }),
        signature: generateDigitalSignature({
          sensitive_data: JSON.stringify(checkout_complete_sensitive_data),
          private_key: api_private_key,
        }),
        merchantCallbackURL: callbackURL
      };

      let complete_payment_options = {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(checkout_complete_body)
      };

      let complete_payment_url = nagad.isSandboxMode ? nagad['sandbox'].complete_payment_url : nagad['production'].complete_payment_url;
      complete_payment_url += `${decrypted_checkout_init_res.paymentReferenceId}`;

      completeResponse = await fetchWithTimeout(complete_payment_url, complete_payment_options);
      completeResponse = await completeResponse.json();
      console.log('initializeResponse: ', completeResponse);
      console.log('Anissss: ', 1);

      if(!completeResponse || completeResponse.status !== 'Success' || !completeResponse.callBackUrl){
        throw new Error('Error occurred while completing payment process');
      }
    } else {
      throw new Error('Something went wrong when Nagad API initialization!');
    }

    return completeResponse;
  }
};
