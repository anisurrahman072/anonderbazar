/**
 * PaymentController
 * @description :: Server-side logic for managing payments
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  destroy: async (req, res) => {
    try {
      const payment = await Payment.updateOne({id: req.param('id')}).set({deletedAt: new Date()});
      return res.json(payment[0]);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Problems!',
        error
      });
    }
  },
};

