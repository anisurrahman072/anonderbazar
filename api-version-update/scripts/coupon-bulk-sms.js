const Promise = require('bluebird');
const ___ = require('lodash');
const SmsService = require('../api/services/SmsService');
module.exports = {


  friendlyName: 'Coupon bulk sms',


  description: '',


  fn: async function (inputs, exits) {

    sails.log('Running custom shell script... (`sails run coupon-bulk-sms`)');
    const couponQury = Promise.promisify(ProductPurchasedCouponCode.getDatastore().sendNativeQuery);

    let rawSelect = `
        SELECT
            GROUP_CONCAT(coupon.id) as allCouponIds,
            coupon.user_id as user_id
    `;
    let fromSQL = `
          FROM product_purchased_coupon_codes as coupon
          LEFT JOIN users as customer ON customer.id = coupon.user_id
          LEFT JOIN product_orders as orders ON orders.id = coupon.order_id
          LEFT JOIN product_suborders as suborders ON suborders.id = coupon.suborder_id
      `;

    let _where = `
        WHERE
          coupon.deleted_at IS NULL AND
          orders.deleted_at IS NULL AND
          orders.status != '12' AND
          suborders.deleted_at IS NULL AND
          suborders.status != '12' AND
          coupon.product_id = '6016'

          GROUP BY coupon.user_id HAVING coupon.user_id = 130
    `;

    const rawResult = await couponQury(rawSelect + fromSQL + _where, []);

    if (!(rawResult && rawResult.rows && rawResult.rows.length > 0)) {
      return exits.error(new Error('No Coupon code found'));
    }

    const allCoupons = rawResult.rows.map(row => {
      let allCouponIds = '';
      if (row.allCouponIds) {
        allCouponIds = row.allCouponIds.split(',').map((coupon) => {
          return '1' + ___.padStart(coupon, 6, '0');
        });
      }
      return {
        user_id: row.user_id,
        allCouponIds: allCouponIds
      };
    });

    const allUserIds = ___.map(allCoupons, 'user_id');

    const allCouponKeyValues = ___.keyBy(allCoupons, 'user_id');

    const allUsers = await User.find({
      id: allUserIds
    });

    const sms = [];
    for (let i = 0; i < allUsers.length; i++) {
      const user = allUsers[i];
      if (!___.isNil(allCouponKeyValues[user.id])) {
        const couponCodes = allCouponKeyValues[user.id].allCouponIds;
        let smsText = 'anonderbazar.com এ আপনার ক্রয়কৃত';
        if (couponCodes.length === 1) {
          smsText += ' স্বাধীনতার ৫০ এর কুপন কোড: ' + couponCodes.join(',');
        } else {
          smsText += ' স্বাধীনতার ৫০ এর কুপন কোডগুলি: ' + couponCodes.join(',');
        }
        if (user.phone) {
          sms.push({
            msisdn: user.phone,
            user_id: user.id,
            text: smsText
          });
        }
      }
    }

    try {
      await SmsService.sendingDynamicSmsToMany(sms);
      return exits.success();
    } catch (err) {
      console.log('SMS sending error');
      console.log(err);
      return exits.error(err);
    }
  }
};

