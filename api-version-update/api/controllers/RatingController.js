/**
 * RatingController
 *
 * @description :: Server-side logic for managing ratings
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  // destroy a row
  destroy: async (req, res) => {
    try {
      const rating = await Rating.update({id: req.param('id')}, {deletedAt: new Date()}).fetch();
      return res.json(rating[0]);
    }
    catch (error){
      return res.json(err, 400);
    }
  }
};

