exports.CouponLotteryRoute = {
  'GET /api/v1/CouponLotteryDraw/getAllWinner': 'CouponLotteryDrawController.getAllWinner',
  'GET /api/v1/CouponLotteryDraw/makeDraw': 'CouponLotteryDrawController.makeDraw',
  'GET /api/v1/couponLotteryDraw/byLotteryId/:lotteryId': [
    {controller: 'CouponLotteryDrawController', action: 'byLotteryId'}
  ],
};
