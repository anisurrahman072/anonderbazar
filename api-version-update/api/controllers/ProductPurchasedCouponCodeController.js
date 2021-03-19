/**
 * ProductPurchasedCouponCodeController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const Promise = require('bluebird');

module.exports = {
  takeDraw: async(req, res) => {
    try {
      const productQuery = Promise.promisify(ProductPurchasedCouponCode.getDatastore().sendNativeQuery);
      const rawSelect =` SELECT productPurchasedCouponCode.user_id as user_id, GROUP_CONCAT (productPurchasedCouponCode.id) as id`;
      const fromSQL = ` FROM product_purchased_coupon_codes as productPurchasedCouponCode`;
      let _where = ' WHERE productPurchasedCouponCode.deleted_at IS NULL';
      const totalCoupon = await productQuery('SELECT COUNT(*) as totalCount ' + fromSQL + _where, []);
      _where += ' GROUP BY user_id';
      const rawResult = await productQuery(rawSelect + fromSQL + _where, []);

      const randomCouponId = Math.floor(Math.random() * totalCoupon.rows[0].totalCount + 1);

      let Winner;
      for(let i = 0; i < rawResult.rows.length; i++){
        const couponIds = rawResult.rows[i].id.split(',');
        const winnerCoupon = couponIds.find(id => {
          return parseInt(id) === randomCouponId;
        });
        if(winnerCoupon){
          Winner = await User.find({
            id: rawResult.rows[i].user_id
          });
          console.log(Winner);
          break;
        }
      }
      res.status(200).json({
        success: true,
        message: 'Successfully draw the coupon!',
        coupon: randomCouponId,
        winner: Winner
      });
    }
    catch (error){
      let message = 'Error occurred while taking a draw!';
      res.status(400).json({
        success: false,
        message,
        error
      });
    }
  }
};
