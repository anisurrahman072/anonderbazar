/**
 * UserLoginController
 *
 * @description :: Server-side logic for managing userlogins
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    destroy: function (req, res) {
        UserLogin.update({id: req.param('id')}, {deletedAt: new Date()})
            .exec(function (err, user) {
                if (err) return res.json(err, 400);
                return res.json(user[0]);
            });
    }
};

