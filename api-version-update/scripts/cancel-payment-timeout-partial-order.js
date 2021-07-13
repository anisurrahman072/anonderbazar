const {
  PARTIAL_ORDER_TYPE,
  PAYMENT_STATUS_PAID,
  NOT_APPLICABLE_OFFLINE_PAYMENTS_APPROVAL_STATUS
} = require('../libs/constants');
const {getGlobalConfig} = require('../libs/helper');
const moment = require('moment');
const {ORDER_STATUSES} = require('../libs/orders');
const {SUB_ORDER_STATUSES} = require('../libs/subOrders');

module.exports = {

  friendlyName: 'Cancel payment timeout partial order',
  description: 'This script will auto run in linux server & will auto cancel the orders that were timed out for partial pay',

  fn: async function (inputs, exits) {

    sails.log('Running custom shell script... (`sails run cancel-payment-timeout-partial-order`)');

    try {
      let partialOrders = await Order.find({
        order_type: PARTIAL_ORDER_TYPE,
        status: {'!=': ORDER_STATUSES.canceled},
        payment_status: {'!=': PAYMENT_STATUS_PAID},
        partial_offline_payment_approval_status: NOT_APPLICABLE_OFFLINE_PAYMENTS_APPROVAL_STATUS,
        deletedAt: null
      });

      const globalConfigs = await getGlobalConfig();
      const len = partialOrders.length;
      const currentDate = moment();
      for (let i = 0; i < len; i++) {

        let allowedUpTo = moment(partialOrders[i].createdAt, 'YYYY-MM-DD HH:mm:ss').add(globalConfigs.partial_payment_duration, 'hours');

        if (allowedUpTo.isBefore(currentDate)) {

          let deletedOrder = await Order.updateOne({
            id: partialOrders[i].id
          }).set({
            status: ORDER_STATUSES.canceled
          });

          await StatusChange.create({
            order_id: partialOrders[i].id,
            suborder_id: null,
            changed_by: 9306,
            date: new Date(),
            status: ORDER_STATUSES.canceled,
            order_status: ORDER_STATUSES.canceled,
          });

          const subOrders = await Suborder.update({
            product_order_id: partialOrders[i].id
          }).set({
            status: SUB_ORDER_STATUSES.canceled
          }).fetch();

          const statusUpdatesSuborders = subOrders.map((sub) => {
            return {
              order_id: null,
              suborder_id: sub.id,
              changed_by: 9306,
              date: new Date(),
              status: SUB_ORDER_STATUSES.canceled
            };
          });

          await StatusChange.createEach(statusUpdatesSuborders);

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
    } catch (error) {
      console.log('The cancel payment timeout for partial orders has been failed!');
      console.log(error);
      return exits.error(error);
    }
  }
};

