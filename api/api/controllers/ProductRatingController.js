/**
 * ProductRatingController
 *
 * @description :: Server-side logic for managing Productratings
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

    // destroy a row
    destroy: function (req, res) {
        ProductRating.update({id: req.param('id')}, {deletedAt: new Date()})
            .exec(function (err, productRating) {
                if (err) return res.json(err, 400);
                return res.json(productRating[0]);
            });
    },
	
};

