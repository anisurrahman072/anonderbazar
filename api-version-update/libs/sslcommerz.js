const SSLCommerz = require('sslcommerz-nodejs');
const {sslApiUrl} = require('../config/softbd');
const {sslCommerzSandboxCred} = require('../config/softbd');
const {sslCommerceSandbox} = require('../config/softbd');

module.exports = {
  sslcommerzInstance: function (globalConfigs) {

    let settings = {
      isSandboxMode: sslCommerceSandbox, //false if live version
      store_id: globalConfigs && globalConfigs.sslcommerce_user ? globalConfigs.sslcommerce_user : 'anonderbazarlive@ssl',
      store_passwd: globalConfigs && globalConfigs.sslcommerce_pass ? globalConfigs.sslcommerce_pass : 'i2EFz@ZNt57@t@r',
    };

    if (sslCommerceSandbox) {
      settings = {
        isSandboxMode: true,
        ...sslCommerzSandboxCred
      };
    }
    return new SSLCommerz(settings);
  },
  preparePaymentRequest: function (authUser, additionalParams) {
    const {
      shippingAddressId,
      billingAddressId,
      amountToPay,
      totalQuantity,
      finalPostalCode,
      finalAddress,
      randomstring,
      isPartialPayment = false,
      orderId = null
    } = additionalParams;

    let successUrl = sslApiUrl + '/ssl-commerz/success/?user_id=' + authUser.id + '&billing_address=' + billingAddressId + '&shipping_address=' + shippingAddressId;
    if (isPartialPayment) {
      successUrl = sslApiUrl + '/ssl-commerz/success-partial/?user_id=' + authUser.id + '&order_id=' + orderId + '&billing_address=' + billingAddressId + '&shipping_address=' + shippingAddressId;
    }
    let ipnUrl = sslApiUrl + '/ssl-commerz/success-ipn/?user_id=' + authUser.id + '&billing_address=' + billingAddressId + '&shipping_address=' + shippingAddressId;
    if (isPartialPayment) {
      ipnUrl = sslApiUrl + '/ssl-commerz/success-ipn-partial/?user_id=' + authUser.id + '&order_id=' + orderId + '&billing_address=' + billingAddressId + '&shipping_address=' + shippingAddressId;
    }
    let failUrl = sslApiUrl + '/ssl-commerz/failure/?user_id=' + authUser.id + '&billing_address=' + billingAddressId + '&shipping_address=' + shippingAddressId;
    if (isPartialPayment) {
      failUrl = sslApiUrl + '/ssl-commerz/failure-partial/?user_id=' + authUser.id + '&order_id=' + orderId + '&billing_address=' + billingAddressId + '&shipping_address=' + shippingAddressId;
    }
    let cancelUrl = sslApiUrl + '/ssl-commerz/error/?user_id=' + authUser.id + '&billing_address=' + billingAddressId + '&shipping_address=' + shippingAddressId;
    if (isPartialPayment) {
      cancelUrl = sslApiUrl + '/ssl-commerz/error-partial/?user_id=' + authUser.id + '&order_id=' + orderId + '&billing_address=' + billingAddressId + '&shipping_address=' + shippingAddressId;
    }

    return {
      total_amount: amountToPay,
      currency: 'BDT',
      tran_id: randomstring,
      success_url: successUrl,
      ipn_url: ipnUrl,
      fail_url: failUrl,
      cancel_url: cancelUrl,
      emi_option: 0,
      cus_name: authUser.first_name + ' ' + authUser.last_name,
      cus_email: authUser.email ? authUser.email : 'anonderbazar@gmail.com',
      cus_phone: authUser.phone,
      cus_postcode: finalPostalCode ? finalPostalCode : '1212',
      cus_add1: finalAddress ? finalAddress : 'Urban Rose, Suite-3B, House-61, Road-24, Gulshan-1',
      cus_city: 'Dhaka',
      cus_country: 'Bangladesh',
      shipping_method: 'NO',
      num_of_item: totalQuantity,
      product_name: 'Product Name',
      product_category: 'Anonder Bazar',
      product_profile: 'General'
    };
  },
  generateRandomString: function () {
    let chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';
    let string_length = 16;
    let randomstring = '';

    for (let i = 0; i < string_length; i++) {
      let rnum = Math.floor(Math.random() * chars.length);
      randomstring += chars.substring(rnum, rnum + 1);
    }
    return randomstring;
  }
};
