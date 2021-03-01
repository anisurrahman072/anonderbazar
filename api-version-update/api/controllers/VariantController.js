/**
 * VariantController
 *
 * @description :: Server-side logic for managing variant
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
module.exports = {
  //Method called for deleting a variant data
  //Model models/Variant.js
  destroy: async (req, res) => {
    try {
      const user = Variant.update(
        {
          id: req.param('id')
        },
        {
          deletedAt: new Date()
        }
      );
      return res.json(user[0]);
    } catch (error) {
      return res.json(error.status, {message: '', error, success: false});
    }
  },
  //Method called for cerating a variant data
  //Model models/Variant.js
  create: async (req, res) => {
    try {
      const variant = await Variant.create(req.body).fetch();
      res.json(200, variant);
    }catch (error){
      return res.json(error.status, {message: '', error, success: false});
    }
  }
};
