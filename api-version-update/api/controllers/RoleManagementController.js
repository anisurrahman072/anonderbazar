/**
 * RoleManagementController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const {pagination} = require('../../libs/pagination');

module.exports = {

  /**Method called for getting all Groups data*/
  /**Model models/Group.js*/

  getAllGroups: async (req, res) => {
    try {
      let _pagination = pagination(req.query);

      let _where = {};
      _where.deletedAt = null;

      let allGroups = await Group.find({
        where: _where,
        limit: _pagination.limit,
        skip: _pagination.skip
      }).sort([
        {name: 'ASC'},
      ]);

      let totalGroups = await Group.count().where(_where);

      res.status(200).json({
        success: true,
        total: totalGroups,
        limit: _pagination.limit,
        skip: _pagination.skip,
        page: _pagination.page,
        message: 'All existing groups with pagination',
        data: allGroups
      });

    } catch (error) {
      console.log(error);
      let message = 'Failed to get all all existing groups with pagination';
      res.status(400).json({
        success: false,
        message,
        error
      });
    }
  },

};

