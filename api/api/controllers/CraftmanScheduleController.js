/**
 * CraftmanScheduleController
 *
 * @description :: Server-side logic for managing Craftmanschedules
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    // destroy a row
    destroy: function (req, res) {
        CraftmanSchedule.update({id: req.param('id')}, {deletedAt: new Date()})
            .exec(function (err, craftmanSchedule) {
                if (err) return res.json(err, 400);
                return res.json(craftmanSchedule[0]);
            });
    },
};

