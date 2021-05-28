module.exports = {
  getCurrentUserCashBack: async (authUser) => {
    return await CouponLotteryCashback.findOne({
      user_id: authUser.id,
      deletedAt: null
    });
  }
};
