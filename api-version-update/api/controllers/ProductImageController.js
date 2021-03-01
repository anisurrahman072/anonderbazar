/**
 * ProductImageController
 *
 * @description :: Server-side logic for managing Productimages
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  //Method called for deleting a product Image
  //Model models/ProductImage.js
  destroy: async (req, res) => {
    try {
      const productImage = await ProductImage.updateOne({id: req.param('id')}).set({deletedAt: new Date()});
      return res.json(productImage);
    } catch (error) {
      console.log(error);
      return res.status(400).json(error);
    }
  },
};

