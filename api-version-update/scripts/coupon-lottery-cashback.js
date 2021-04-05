const Promise = require('bluebird');

module.exports = {
  friendlyName: 'Coupon lottery cashback',

  description: 'Customers will get 60% cashback for each not drawn coupon',

  inputs: {
    product_id: {
      description: 'Product ID of Coupon Lotteries',
      type: 'string'
    }
  },

  fn: async function ({product_id}, exits) {

    sails.log('Running custom shell script... (`sails run coupon-lottery-cashback`)');
    try {
      const couponNativeQuery = Promise.promisify(ProductPurchasedCouponCode.getDatastore().sendNativeQuery);
      let _rawSelect = `
              SELECT
                  purchasedCoupon.user_id as user_id,
                  COUNT(purchasedCoupon.id) as coupon_count

              FROM product_purchased_coupon_codes as purchasedCoupon

              LEFT JOIN users as customer ON customer.id = purchasedCoupon.user_id
              LEFT JOIN product_orders as orders ON orders.id = purchasedCoupon.order_id
              LEFT JOIN product_suborders as suborders ON suborders.id = purchasedCoupon.suborder_id

              WHERE
                  purchasedCoupon.product_id = ${product_id} AND
                  purchasedCoupon.deleted_at IS NULL AND
                  purchasedCoupon.coupon_lottery_draw_id IS NULL AND
                  orders.deleted_at IS NULL AND
                  orders.status != '12' AND
                  suborders.deleted_at IS NULL AND
                  suborders.status != '12'

              GROUP BY purchasedCoupon.user_id
      `;

      let allPurchasedCouponCode = await couponNativeQuery(_rawSelect + []);

      let product = await Product.findOne({
        deletedAt: null,
        id: product_id
      });

      let price = product.price;

      await sails.getDatastore()
        .transaction(async (db) => {
          for (let i = 0; i < allPurchasedCouponCode.rows.length; i++) {
            let data = allPurchasedCouponCode.rows[i];
            let count = parseInt(data.coupon_count, 10);
            let amount = count * ((120.0 * price) / 100.0);

            let cashBackInfo = await CouponLotteryCashback.findOne({
              deletedAt: null,
              user_id: data.user_id
            }).usingConnection(db);

            if (cashBackInfo) {
              let newAmount = amount + cashBackInfo.amount;
              await CouponLotteryCashback.updateOne({
                user_id: data.user_id
              }).set({amount: newAmount});
            } else {
              let newCashbackInfo = await CouponLotteryCashback.create({
                user_id: data.user_id,
                amount: amount
              }).fetch().usingConnection(db);

              await ProductPurchasedCouponCode.update({
                user_id: data.user_id,
              }).set({coupon_lottery_cashback_id: newCashbackInfo.id}).usingConnection(db);
            }
          }
        });
      return exits.success();
    } catch (error) {
      console.log('Coupon Lottery Cashback failed to load!');
      if (error.data) {
        console.log(error.data);
      } else {
        console.log(error);
      }
      return exits.error(error);
    }
  }
};

