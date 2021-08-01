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

  /**Method called to delete a group*/
  /**model: Group.js*/
  deleteGroup: async (req, res) => {
    try {
      const group = await Group.updateOne({id: req.query.id}).set({deletedAt: new Date()});
      return res.json(200, group);
    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: 'Failed to delete a group',
        error
      });
    }
  },

  /** Method called to get all the available permissions to create a group */
  /**Model models/Group.js*/

  getAllGroupsPermissions: async (req, res) => {
    try {
      let rawSQL = `
      SELECT
            GROUP_CONCAT(perm_key) AS perm_keys,
            GROUP_CONCAT(perm_label) AS perm_labels,
            perm_section
        FROM
            group_permissions
        WHERE
            deleted_at IS NULL
        GROUP BY
            perm_section
      `;

      let rawPermissions = await sails.sendNativeQuery(rawSQL, []);

      res.status(200).json({
        success: true,
        message: 'Successfully fetched all available group permissions',
        data: rawPermissions.rows
      });

    } catch (error) {
      console.log(error);
      res.status(400).json({
        success: false,
        message: 'Failed to get all the available group permissions',
        error
      });
    }
  },

  groupInsert: async (req, res) => {
    try {
      let body = {};

      body.name = req.body.name;
      body.description = req.body.description;
      body.accessList = JSON.parse(req.body.permissionKeysArray);

      let group = await Group.create(body).fetch();

      res.status(200).json({
        success: true,
        message: 'Successfully Created a new group',
        data: group
      });

    } catch (error) {
      console.log(error);
      res.status(400).json({
        success: false,
        message: 'Failed to Created a new group',
        error
      });
    }
  },

};

