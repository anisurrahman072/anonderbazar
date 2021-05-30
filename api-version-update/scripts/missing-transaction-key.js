const {SSL_COMMERZ_PAYMENT_TYPE} = require('../libs/constants');
const _ = require('lodash');

module.exports = {


  friendlyName: 'Missing transaction key',


  description: '',


  fn: async function () {

    sails.log('Running custom shell script... (`sails run missing-transaction-key`)');

    const payments = await Payment.find({
      payment_type: SSL_COMMERZ_PAYMENT_TYPE,
      deletedAt: null,
    });

    const length = await Payment.count().where({
      payment_type: SSL_COMMERZ_PAYMENT_TYPE,
      deletedAt: null
    });

    for (let i = 0; i < length; i++){
      const tranDetails = JSON.stringify(payments[i].details);
      const transactionKey = tranDetails.tran_id;
      if(_.isUndefined(tranDetails) || _.isNull(tranDetails) || _.isUndefined(tranDetails.tran_id) || _.isNull(tranDetails.tran_id)){

      }

    }

  }


};

