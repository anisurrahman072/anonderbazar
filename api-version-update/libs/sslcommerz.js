const SSLCommerz = require('sslcommerz-nodejs');
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
  }
};
