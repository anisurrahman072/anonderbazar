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
  preparePaymentRequest: function (authUser, addressId, grandOrderTotal, totalQuantity, finalPostalCode, finalAddress, randomstring) {
    return {
      total_amount: grandOrderTotal,
      currency: 'BDT',
      tran_id: randomstring,
      success_url: sslApiUrl + '/ssl-commerz/success/?user_id=' + authUser.id + '&billing_address=' + addressId + '&shipping_address=' + addressId,
      ipn_url: sslApiUrl + '/ssl-commerz/success-ipn/?user_id=' + authUser.id + '&billing_address=' + addressId + '&shipping_address=' + addressId,
      fail_url: sslApiUrl + '/ssl-commerz/failure/?user_id=' + authUser.id + '&billing_address=' + addressId + '&shipping_address=' + addressId,
      cancel_url: sslApiUrl + '/ssl-commerz/error/?user_id=' + authUser.id + '&billing_address=' + addressId + '&shipping_address=' + addressId,
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
  }
};
