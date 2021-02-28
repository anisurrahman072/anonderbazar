/**
 * CartItemVariantController
 *
 * @description :: Server-side logic for managing cartitemvariants
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  //Method called for deleting cart item variant data
  //Model models/CartItemVariant.js
  destroy: async (req, res) => {
    try {
      const cartItemVariant = await CartItemVariant.updateOne({id: req.param('id')}).set({deletedAt: new Date()});
      return res.json(cartItemVariant);
    } catch (error) {
      return res.json(400, {
        success: false,
        error
      });
    }
  },
};

