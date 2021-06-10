const {PARTIAL_ORDER_TYPE, CANCELED_ORDER, PAYMENT_STATUS_PAID} = require('../libs/constants');
const {getGlobalConfig} = require('../libs/helper');
const moment = require('moment');

module.exports = {


  friendlyName: 'Cancel payment timeout partial order',


  description: 'This script will auto run in linux server & will auto cancel the orders that were timed out for partial pay',


  fn: async function () {

    sails.log('Running custom shell script... (`sails run cancel-timeout-partial-order`)');

    try {
      let partialOrders = await Order.find({
        order_type: PARTIAL_ORDER_TYPE,
        status: { '!=': CANCELED_ORDER },
        payment_status: { '!=': PAYMENT_STATUS_PAID },
        deletedAt: null
      });

      const globalConfigs = await getGlobalConfig();
      const len = partialOrders.length;
      const presentTime = moment(new Date());

      for(let i = 0; i < len; i++){
        let createdAt = moment(partialOrders[i].createdAt);
        let duration = moment.duration(presentTime.diff(createdAt));
        let expendedHour = Math.floor(duration.asHours());

        if(expendedHour > globalConfigs.partial_payment_duration){
          let deletedOrder = await Order.updateOne({
            id: partialOrders[i].id
          }).set({
            status: CANCELED_ORDER
          });

          let user = await User.findOne({
            id: partialOrders[i].user_id,
            deletedAt: null
          });

          let smsText = `Your order ${deletedOrder.id} has been canceled!`;
          console.log(smsText);
          SmsService.sendingOneSmsToOne([user.phone], smsText);
        }
      }
      return exits.success();
    }
    catch (error){
      console.log('The cancel payment timeout for partial orders has been failed!');
      console.log(error);
      return exits.error(error);
    }
  }
};

