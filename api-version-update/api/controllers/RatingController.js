/**
 * RatingController
 *
 * @description :: Server-side logic for managing ratings
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  // destroy a row
  destroy: function (req, res) {
    Rating.update({id: req.param('id')}, {deletedAt: new Date()})
            .exec((err, rating) => {
              if (err) {return res.json(err, 400);}
              return res.json(rating[0]);
            });
  },
};

