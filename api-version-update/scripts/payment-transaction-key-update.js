const _ = require('lodash');
const {PAYMENT_TRAN_TYPE_PAY, SSL_COMMERZ_PAYMENT_TYPE} = require('../libs/constants');

module.exports = {

  friendlyName: 'Payment Transaction Key Update for sslcommerz',
  description: '',

  fn: async function (inputs, exits) {

    sails.log('Running custom shell script... (`sails run payment-transaction-key-update`)');

    try {
      const payments = await Payment.find({
        payment_type: SSL_COMMERZ_PAYMENT_TYPE,
        transaction_type: PAYMENT_TRAN_TYPE_PAY,
        deletedAt: null
      });

      console.log('Total Payment Entry Found: ', payments.length);

      for (let payment of payments) {
        let tranDetails = null;
        try {
          tranDetails = JSON.parse(payment.details);
        } catch (_) {
        }
        let transactionId = null;
        if (tranDetails && !_.isUndefined(tranDetails.tran_id) && !_.isNull(tranDetails.tran_id)) {
          transactionId = tranDetails.tran_id;
        } else {
          const order = await Order.findOne({id: payment.order_id});
          if (order && order.id && order.ssl_transaction_id) {
            transactionId = order.ssl_transaction_id;
          }
        }
        if (transactionId && transactionId !== payment.transection_key) {
          await Payment.update({id: payment.id}).set({
            transection_key: transactionId
          });
        }
      }
      return exits.success();
    } catch (Error) {
      console.log('Transaction Key Update Error');
      if (Error.data) {
        console.log(Error.data);
      } else {
        console.log(Error);
      }
      return exits.error(Error);
    }

  }
};

