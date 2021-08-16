const {fetchWithTimeout} = require('../libs/helper');
const {sslApiUrl} = require('../config/softbd');
const {nagad} = require('../config/softbd');
const {
  encryptSensitiveData,
  generateDigitalSignature,
  decryptSensitiveData,
  isVerifiedDigitalSignature
} = require('../api/services/PaymentService');

const crypto = require('crypto');
const moment = require('moment');

module.exports = {
  completePayment: async (payableAmount, orderInfo) => {
    const {userId, orderId, billingAddressId, shippingAddressId, isPartialOrder} = orderInfo;

    const random_order_id = PaymentService.generateRandomString().toUpperCase();
    const date_time = moment().format('YYYYMMDDHHmmss');
    const merchant_id = nagad.merchant_id;

    const publicKey = nagad.isSandboxMode ? nagad['sandbox'].pgPublicKey : nagad['production'].pgPublicKey;
    const privateKey = nagad.isSandboxMode ? nagad['sandbox'].merchantPrivateKey : nagad['production'].merchantPrivateKey;

    const api_public_key = `-----BEGIN PUBLIC KEY-----\n${publicKey}\n-----END PUBLIC KEY-----`;
    const api_private_key = `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----`;


    const checkout_init_sensitive_data = {
      merchantId: merchant_id,
      datetime: date_time,
      orderId: random_order_id,
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
    url += `${merchant_id}/${random_order_id}`;
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

    if (isCheckoutInitVerified) {
      const checkout_complete_sensitive_data = {
        merchantId: merchant_id,
        orderId: random_order_id,
        amount: payableAmount,
        currencyCode: '050',
        challenge: decrypted_checkout_init_res.challenge,
      };

      let callbackURL = sslApiUrl + '/nagad-payment/callback-checkout/' + userId + '/' + billingAddressId + '/' + shippingAddressId;
      if(isPartialOrder) {
        callbackURL = sslApiUrl + '/nagad-payment/callback-checkout-partial/' + userId + '/' + orderId + '/' + billingAddressId + '/' + shippingAddressId;
      }

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
      console.log('completeResponse: ', completeResponse);

      if (!completeResponse || completeResponse.status !== 'Success' || !completeResponse.callBackUrl) {
        throw new Error('Error occurred while completing payment process');
      }
    } else {
      throw new Error('Something went wrong when Nagad API initialization!');
    }

    return completeResponse;
  },

  verifyPayment: async (payment_ref_id) => {
    let payment_verification_url = nagad.isSandboxMode ? nagad['sandbox'].payment_verification_url : nagad['production'].payment_verification_url;
    payment_verification_url += `${payment_ref_id}`;

    let headers = {
      'X-KM-IP-V4': '45.118.63.56',
      'X-KM-Client-Type': 'PC_WEB',
      'X-KM-Api-Version': 'v-0.2.0',
      'Content-Type': 'application/json',
    };

    const options = {
      method: 'GET',
      headers: headers
    };

    let verificationResponse = await fetchWithTimeout(payment_verification_url, options);
    verificationResponse = await verificationResponse.json();

    console.log('Verification result: ', verificationResponse);

    return verificationResponse;
  }
};
