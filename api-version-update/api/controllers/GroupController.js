/**
 * GroupController
 *
 * @description :: Server-side logic for managing groups
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  //Method called for deleting a group data
  //Model models/Group.js
  destroy: function (req, res) {
    Group.update({id: req.param('id')}, {deletedAt: new Date()})
            .exec((err, user) => {
              if (err) {return res.json(err, 400);}
              return res.json(user[0]);
            });
  }
};

