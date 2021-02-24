/**
 * PaymentController
 *
 * @description :: Server-side logic for managing payments
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    // destroy a row
    destroy: function (req, res) {
        Payment.update({id: req.param('id')}, {deletedAt: new Date()})
            .exec(function (err, payment) {
                if (err) return res.json(err, 400);
                return res.json(payment[0]);
            });
    },
};

