/**
 * ProductPurchasedCouponCodeController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const Promise = require('bluebird');

module.exports = {
  getAll: async (req, res) => {
    let _where = {};
    let _sort = [];
    _sort.push({id: 'DESC'});
    _where.deletedAt = { '!=' : ['null'] };
    const allWinners = await ProductCouponLotteries.find({
      where: _where,
      sort: _sort
    }).populate('winner_id');

    res.status(200).json({
      success: true,
      message: 'Successfully get all winners!',
      winners: allWinners
    });
  },

  makeDraw: async(req, res) => {
    try {
      let updatedLottery;

      /* Check any prize left for draw or not */
      const prizeLeft = await ProductCouponLotteries.find({
        deletedAt: null
      });
      if(prizeLeft.length){
        const couponQuery = Promise.promisify(ProductPurchasedCouponCode.getDatastore().sendNativeQuery);
        const rawSelect =` SELECT productPurchasedCouponCode.user_id as user_id, GROUP_CONCAT (productPurchasedCouponCode.id) as id`;
        const fromSQL = ` FROM product_purchased_coupon_codes as productPurchasedCouponCode`;
        let _where = {};
        _where = ' WHERE productPurchasedCouponCode.deleted_at IS NULL';
        const totalCoupon = await couponQuery('SELECT COUNT(*) as totalCount ' + fromSQL + _where, []);
        _where += ' GROUP BY user_id';
        const rawResult = await couponQuery(rawSelect + fromSQL + _where, []);

        /* Find & check weather random coupon is already taken or not */
        let randomCouponId;
        for(;;){
          randomCouponId = Math.floor(Math.random() * totalCoupon.rows[0].totalCount + 1);
          let lottery = await ProductCouponLotteries.find({
            coupon_id: randomCouponId
          });
          if(!lottery.length){
            break;
          }
        }

        /* Find current winner ID */
        let winner_id;
        for(let i = 0; i < rawResult.rows.length; i++){
          const couponIds = rawResult.rows[i].id.split(',');
          const winnerCoupon = couponIds.find(id => {
            return parseInt(id) === randomCouponId;
          });
          if(winnerCoupon){
            winner_id = rawResult.rows[i].user_id;
            break;
          }
        }

        /* Find remaining lotteries */
        _where = {};
        _where.deletedAt = null;
        let _sort = [];
        _sort.push({id: 'DESC'});
        let lottery = await ProductCouponLotteries.find({
          where: _where,
          sort: _sort
        });

        /* Update lottery */
        updatedLottery = await ProductCouponLotteries.updateOne({id: lottery[0].id})
          .set({deletedAt: new Date(), winner_id: winner_id, coupon_id: randomCouponId});
      }

      /* Find all drawn lotteries to show on table */
      const allWinners = await ProductCouponLotteries.find({
        where: {deletedAt: { '!=' : ['null'] }},
        sort: [{id: 'DESC'}]
      }).populate('winner_id');

      if(!prizeLeft.length){
        return res.status(200).json({
          success: false,
          message: 'All prizes are already distributed!',
          winners: allWinners,

        });
      }
      else{
        res.status(200).json({
          success: true,
          message: 'Successfully drawn the coupon!',
          winners: allWinners,
          winner: allWinners[allWinners.length-1].winner_id.first_name+' '+allWinners[allWinners.length-1].winner_id.last_name,
          prize: updatedLottery
        });
      }
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
