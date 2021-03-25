/**
 * CouponLotteryDrawController.js
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const Promise = require('bluebird');
const moment = require('moment');

module.exports = {
  byLotteryId: async (req, res) => {
    const couponLotteryDrawNativeQuery = Promise.promisify(CouponLotteryDraw.getDatastore().sendNativeQuery);
    try {
      let rawQuery = `
      SELECT
          coupon_draw.id as id,
          coupon_draw.user_id as user_id,
          coupon_draw.product_purchased_coupon_code_id as coupon_code,
          coupon_lottery_prizes.name as prize_name,
          coupon_lottery_prizes.place as prize_place,
          coupon_draw.status,
          CONCAT(customer.first_name, ' ', customer.last_name) as customer_name

      FROM coupon_lottery_draws as coupon_draw
      LEFT JOIN users as customer ON customer.id = coupon_draw.user_id
      LEFT JOIN coupon_lottery_prizes  ON coupon_lottery_prizes.id = coupon_draw.coupon_lottery_prize_id

      `;
      let rawWhere = ` WHERE coupon_draw.deleted_at IS NULL AND coupon_draw.coupon_lottery_id = '${req.param('lotteryId')}' `;
      let totalDraws = 0;
      let allDraws = [];
      const totalDrawsRaw = await couponLotteryDrawNativeQuery('SELECT COUNT(*) as totalCount FROM coupon_lottery_draws as coupon_draw ' + rawWhere, []);
      if (totalDrawsRaw && totalDrawsRaw.rows && totalDrawsRaw.rows.length > 0) {
        totalDraws = totalDrawsRaw.rows[0].totalCount;
        const rawResult = await couponLotteryDrawNativeQuery(rawQuery + rawWhere, []);
        allDraws = rawResult.rows;
      }

      return res.status(200).json({
        success: true,
        total: totalDraws,
        message: 'Getting all coupon lottery draws',
        data: allDraws
      });

    } catch (error) {
      console.log(error);
      let message = 'Error in getting all coupon lottery draws';
      return res.status(400).json({
        success: false,
        message,
        error
      });
    }
  },
  getAllWinner: async (req, res) => {
    try {
      /** Find the Lottery Coupon by code */
      let code = req.param('code');
      let _where = {};
      _where.code = code;
      _where.deletedAt = null;
      let currentLotteryCoupon = await CouponLottery.find({
        where: _where
      });
      const lotteryCoupon = currentLotteryCoupon[0];

      if (lotteryCoupon.status === 1) {
        return res.status(200).json({
          success: false,
          code: 'notStarted',
          message: 'Lottery draw is not started! DRAW date: ' + lotteryCoupon.draw_date,
        });
      }

      /** Find all winners for the Lottery Coupon */
      let allWinners = await CouponLotteryDraw.find({
        where: {coupon_lottery_id: lotteryCoupon.id, deletedAt: null},
        sort: [{id: 'ASC'}]
      }).populate('user_id')
        .populate('coupon_lottery_prize_id');

      let message = '';
      let resCode = '';
      if (lotteryCoupon.status === 3) {
        message = 'Lottery draw has been finished! Drawn date: ' + lotteryCoupon.draw_date;
        resCode = 'completed';
      } else {
        message = 'Successfully get all winners!';
        resCode = 'success';
      }
      return res.status(200).json({
        success: true,
        message,
        code: resCode,
        data: allWinners,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Error occurred while getting all winners!',
        error
      });
    }
  },

  makeDraw: async (req, res) => {
    try {
      /** Find the Lottery Coupon by code */
      let code = req.param('code');
      let _where = {};
      _where.code = code;
      _where.deletedAt = null;
      let currentLotteryCoupon = await CouponLottery.find({
        where: _where
      });
      let lotteryCoupon = currentLotteryCoupon[0];


      /** Check weather today is the correct day for DRAW the coupon */
      let couponLotteryDate = lotteryCoupon.draw_date;
      let todayDate = moment().format('YYYY-MM-DD').slice(0, 10);
      let date = moment(couponLotteryDate).format('YYYY-MM-DD');

      if (todayDate !== date) {
        return res.status(200).json({
          success: false,
          code: 'notDay',
          message: 'Today is not the day to DRAW!'
        });
      }

      /** Check weather the Coupon Lottery is already completed or not */
      if (lotteryCoupon.status === 3) {
        return res.status(200).json({
          success: false,
          code: 'completed',
          message: 'Lottery has been completed for this session!'
        });
      }

      /** Find all purchased coupon for today's draw coupon */
      const couponQuery = Promise.promisify(ProductPurchasedCouponCode.getDatastore().sendNativeQuery);
      const rawSelect = ` SELECT productPurchasedCouponCode.user_id as user_id, GROUP_CONCAT (productPurchasedCouponCode.id) as id`;
      const fromSQL = ` FROM product_purchased_coupon_codes as productPurchasedCouponCode`;
      _where = {};
      _where = ' WHERE productPurchasedCouponCode.deleted_at IS NULL';
      _where += ` AND productPurchasedCouponCode.product_id = ${lotteryCoupon.product_id}`;
      const totalCoupon = await couponQuery('SELECT COUNT(*) as totalCount ' + fromSQL + _where, []);
      _where += ' GROUP BY user_id';
      const rawResult = await couponQuery(rawSelect + fromSQL + _where, []);


      /** make an array of all purchased coupon ids */
      let allPurchasedCoupons = [];
      for (let i = 0; i < rawResult.rows.length; i++) {
        let ids = rawResult.rows[i].id.split(',');
        ids = ids.map(id => {
          return parseInt(id);
        });
        allPurchasedCoupons = [...allPurchasedCoupons, ...ids];
      }

      /** Find coupon_lottery_prize_id (it is current prize that is going to be drawn) */
      /* First find all drawn lotteries from CouponLotteryDraw for same product_id. */
      let allDrawnLotteries = await CouponLotteryDraw.find({
        where: {coupon_lottery_id: lotteryCoupon.id, deletedAt: null}
      }).populate('coupon_lottery_prize_id');

      /* Then Make place highest place if no lottery was drawn. If not drawn then,
       Find the smallest place of prize from all drawn lotteries */
      let place;
      if (allDrawnLotteries.length === 0) {
        place = await CouponLotteryPrize.count({
          coupon_lottery_id: lotteryCoupon.id, deletedAt: null
        });
      } else {
        place = Math.pow(10, 1000);
        for (let i = 0; i < allDrawnLotteries.length; i++) {
          if (allDrawnLotteries[i].coupon_lottery_prize_id.place < place) {
            place = allDrawnLotteries[i].coupon_lottery_prize_id.place;
          }
        }
        place--;
      }
      /* Finally Find the prize for current draw */
      let currentPrize = await CouponLotteryPrize.find({
        where: {coupon_lottery_id: lotteryCoupon.id, place: place, deletedAt: null}
      });

      let randomCouponId;
      await sails.getDatastore()
        .transaction(async (db) => {
          /** Check weather all lotteries are drawn or not. If not then set status = 2 */
          if (currentPrize.length === 0) {
            await CouponLottery.update({
              product_id: lotteryCoupon.product_id
            }).set({status: 3}).usingConnection(db);
            return res.status(200).json({
              success: false,
              code: 'completed',
              message: 'Lottery has been completed for this Coupon!'
            });
          } else {
            await CouponLottery.update({
              product_id: lotteryCoupon.product_id
            }).set({status: 2}).usingConnection(db);
          }


          /** Find a random Coupon Id & check weather it already got prize or not */
          for (; ;) {
            let randomNumber = Math.floor(Math.random() * totalCoupon.rows[0].totalCount + 1);
            randomCouponId = allPurchasedCoupons[randomNumber - 1];
            let alreadyGotPrize = await CouponLotteryDraw.find({
              product_purchased_coupon_code_id: randomCouponId
            }).usingConnection(db);
            if (alreadyGotPrize.length === 0) {
              break;
            }
          }

          /** Find user_id */
          let winner_id;
          for (let i = 0; i < rawResult.rows.length; i++) {
            const couponIds = rawResult.rows[i].id.split(',');
            const winnerCoupon = couponIds.find(id => {
              return parseInt(id) === randomCouponId;
            });
            if (winnerCoupon) {
              winner_id = rawResult.rows[i].user_id;
              break;
            }
          }

          /** Find order_id */
          let order_id = await ProductPurchasedCouponCode.find({
            id: randomCouponId
          }).usingConnection(db);

          /** Create new row for drawn prize in CouponLotteryDraw */
          let newDrawnLottery = {
            user_id: winner_id,
            coupon_lottery_id: lotteryCoupon.id,
            coupon_lottery_prize_id: currentPrize[0].id,
            order_id: order_id[0].order_id,
            product_purchased_coupon_code_id: randomCouponId
          };
          let drawnLottery = await CouponLotteryDraw.create(newDrawnLottery).fetch().usingConnection(db);


          /** Update ProductPurchasedCouponCode */
          await ProductPurchasedCouponCode.update({id: randomCouponId})
            .set({coupon_lottery_draw_id: drawnLottery.id}).usingConnection(db);
        });

      return res.status(200).json({
        success: true,
        code: 'success',
        message: 'Successfully drawn the coupon!',
        data: randomCouponId
      });
    } catch (error) {
      let message = 'Error occurred while making a draw!';
      res.status(400).json({
        success: false,
        message,
        error
      });
    }
  }
};
