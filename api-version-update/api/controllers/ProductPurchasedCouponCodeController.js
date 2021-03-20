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
      /* Check any prize left or not */
      const prizeLeft = await Lottery.find({
        deletedAt: null
      });
      if(!prizeLeft.length){
        return res.status(200).json({
          success: false,
          message: 'All prizes are already distributed!'
        });
      }

      /* Find all purchased coupon_id with owner of coupon */
      const productQuery = Promise.promisify(ProductPurchasedCouponCode.getDatastore().sendNativeQuery);
      const rawSelect =` SELECT productPurchasedCouponCode.user_id as user_id, GROUP_CONCAT (productPurchasedCouponCode.id) as id`;
      const fromSQL = ` FROM product_purchased_coupon_codes as productPurchasedCouponCode`;
      let _where = ' WHERE productPurchasedCouponCode.deleted_at IS NULL';
      const totalCoupon = await productQuery('SELECT COUNT(*) as totalCount ' + fromSQL + _where, []);
      _where += ' GROUP BY user_id';
      const rawResult = await productQuery(rawSelect + fromSQL + _where, []);

      /* Find & check weather random coupon is already taken */
      let randomCouponId;
      for(;;){
        randomCouponId = Math.floor(Math.random() * totalCoupon.rows[0].totalCount + 1);
        console.log('randomCouponId',randomCouponId);
        let lottery = await Lottery.find({
          coupon_id: randomCouponId
        });
        if(!lottery.length){
          break;
        }
      }

      /* Find winner details */
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
          console.log('Anis',Winner);
          break;
        }
      }

      /* Find remaining lotteries */
      _where = {};
      _where.deletedAt = null;
      let _sort = [];
      _sort.push({id: 'DESC'});
      let lottery = await Lottery.find({
        where: _where,
        sort: _sort
      });

      /* Update drawn lottery */
      let updatedLottery = await Lottery.updateOne({id: lottery[0].id})
        .set({deletedAt: new Date(), winner_id: Winner[0].id, coupon_id: randomCouponId});

      /* Find all drawn lotteries to show on table */
      _where.deletedAt = { '!=' : ['null'] };
      const allWinners = await Lottery.find({
        where: _where,
        sort: _sort
      }).populate('winner_id');

      res.status(200).json({
        success: true,
        message: 'Successfully draw the coupon!',
        winners: allWinners,
        winner: Winner[0].first_name+' '+Winner[0].last_name,
        prize: updatedLottery
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
