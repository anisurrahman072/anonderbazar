const {
  PARTIAL_ORDER_TYPE,
  PAYMENT_STATUS_PAID,
  CONFIRMED_ALL_OFFLINE_PAYMENTS_APPROVAL_STATUS
} = require('../libs/constants');
const Promise = require('bluebird');
const {NOT_APPLICABLE_OFFLINE_PAYMENTS_APPROVAL_STATUS} = require('../libs/constants');
const {ORDER_STATUSES} = require('../libs/orders');
const {SUB_ORDER_STATUSES} = require('../libs/subOrders');

const exludedOrderIds = [
  2204, 2205, 3192, 3194, 3196, 3201, 3203, 3204, 3206, 3208, 3209, 3212, 3213, 3214, 3215, 3217, 3218, 3220, 3221, 3222, 3223, 3224, 3225, 3227, 3229, 3232,
  3236, 3243, 3244, 3245, 3248, 3252, 3254, 3255, 3256, 3257, 3259, 3260, 3262, 3263, 3266, 3267, 3268, 3269, 3271, 3272, 3275, 3277, 3283, 3285, 3286, 3288,
  3290, 3291, 3297, 3299, 3300, 3301, 3302, 3303, 3304, 3305, 3306, 3307, 3310, 3311, 3312, 3313, 3314, 3316, 3317, 3318, 3319, 3320, 3323, 3324, 3325, 3326,
  3328, 3329, 3333, 3335, 3336, 3337, 3338, 3339, 3340, 3343, 3344, 3346, 3352, 3353, 3355, 3359, 3360, 3362, 3364, 3365, 3373, 3375, 3378, 3379, 3380, 3381,
  3382, 3383, 3384, 3385, 3390, 3392, 3396, 3397, 3399, 3400, 3401, 3402, 3403, 3404, 3405, 3407, 3409, 3415, 3416, 3419, 3420, 3421, 3422, 3423, 3426, 3431,
  3433, 3435, 3436, 3441, 3443, 3444, 3445, 3446, 3447, 3449, 3451, 3456, 3457, 3458, 3460, 3461, 3465, 3467, 3468, 3470, 3471, 3472, 3473, 3475, 3478, 3479,
  3484, 3485, 3486, 3490, 3491, 3492, 3493, 3496, 3497, 3498, 3499, 3500, 3501, 3502, 3504, 3506, 3507, 3508, 3509, 3511, 3512, 3516, 3517, 3519, 3521, 3522,
  3529, 3530, 3531, 3532, 3533, 3536, 3556, 3564, 3566, 3567, 3576, 3577, 3580, 3581, 3584, 3588, 3591, 3599, 3602, 3603, 3604, 3605, 3607
];


module.exports = {


  friendlyName: 'Reverse Cancel payment timeout partial order',


  description: 'This script will auto run in linux server & will auto cancel the orders that were timed out for partial pay',


  fn: async function (inputs, exits) {

    sails.log('Running custom shell script... (`sails run reverse-cancel-timeout-partial-order`)');

    try {
      const orderQuery = Promise.promisify(Order.getDatastore().sendNativeQuery);

      let rawQuery = `
      SELECT
            orders.id as id,
            orders.created_at,
            orders.updated_at,
            orders.status
      FROM
              product_orders as orders

      WHERE
            orders.deleted_at IS NULL AND
            orders.order_type = ${PARTIAL_ORDER_TYPE} AND
            orders.payment_status != ${PAYMENT_STATUS_PAID} AND
            orders.status = ${ORDER_STATUSES.canceled} AND
            orders.partial_offline_payment_approval_status IN (${NOT_APPLICABLE_OFFLINE_PAYMENTS_APPROVAL_STATUS}, ${CONFIRMED_ALL_OFFLINE_PAYMENTS_APPROVAL_STATUS}) AND
            orders.id NOT IN (${exludedOrderIds.join(',')})
      `;

      const rawResult = await orderQuery(rawQuery, []);

      const partialOrders = rawResult.rows;

      const len = partialOrders.length;

      for (let i = 0; i < len; i++) {
        let deletedOrder = await Order.updateOne({
          id: partialOrders[i].id
        }).set({
          status: ORDER_STATUSES.pending
        });

        await Suborder.update({
          product_order_id: partialOrders[i].id
        }).set({
          status: SUB_ORDER_STATUSES.pending
        });

        let user = await User.findOne({
          id: partialOrders[i].user_id,
          deletedAt: null
        });

        let smsText = `Your order ${deletedOrder.id} has been canceled!`;
        console.log(smsText);

        SmsService.sendingOneSmsToOne([user.phone], smsText);

      }
      return exits.success();
    } catch (error) {
      console.log('The cancel payment timeout for partial orders has been failed!');
      console.log(error);
      return exits.error(error);
    }
  }
};

