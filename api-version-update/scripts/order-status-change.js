const {ORDER_STATUSES} = require('../libs/orders');
const {SUB_ORDER_STATUSES} = require('../libs/subOrders');

module.exports = {

  friendlyName: 'Change Order Status for a group of orders',
  description: 'This script will auto run in linux server & will auto change the order status to the given status',
  inputs: {
    status: {type: 'number', required: true},
    ids: {type: ['number'], required: true},
  },
  fn: async function ({status, ids}, exits) {

    sails.log('Running custom shell script... (`sails run order-status-change`)');

    sails.log(status);
    sails.log(ids);
    sails.log(ids.length);
    sails.log(ids[ids.length - 1]);
    sails.log(ids[0]);

    if (!(status && ids.length > 0)) {
      return exits.error(new Error('Invalid Argument Supplied.'));
    }

    try {
      let orders = await Order.find({
        id: ids
      });

      const len = orders.length;
      for (let i = 0; i < len; i++) {

        await Order.updateOne({
          id: orders[i].id
        }).set({
          status: ORDER_STATUSES.delivered
        });

        await StatusChange.create({
          order_id: orders[i].id,
          suborder_id: null,
          changed_by: 9306,
          date: new Date(),
          status: ORDER_STATUSES.delivered,
          order_status: ORDER_STATUSES.delivered,
        });

        const subOrders = await Suborder.update({
          product_order_id: orders[i].id
        }).set({
          status: SUB_ORDER_STATUSES.delivered
        }).fetch();

        const statusUpdatesSuborders = subOrders.map((sub) => {
          return {
            order_id: null,
            suborder_id: sub.id,
            changed_by: 9306,
            date: new Date(),
            status: SUB_ORDER_STATUSES.delivered
          };
        });

        await StatusChange.createEach(statusUpdatesSuborders);

      }
      return exits.success();
    } catch (error) {
      console.log('The cancel payment timeout for partial orders has been failed!');
      console.log(error);
      return exits.error(error);
    }
  }
};

