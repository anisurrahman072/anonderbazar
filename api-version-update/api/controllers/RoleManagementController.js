/**
 * RoleManagementController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const {pagination} = require('../../libs/pagination');
const {performance} = require('perf_hooks');

module.exports = {

  /**Method called for getting all Groups data*/
  /**Model models/Group.js*/

  getAllGroups: async (req, res) => {
    try {
      const time1 = performance.now();

      let _pagination = pagination(req.query);

      let rawSQL = `
      SELECT
          groups.*,
          COUNT(users.username) AS num_of_user
      FROM
          groups
      LEFT JOIN users ON groups.id = users.group_id
      WHERE
          groups.deleted_at IS NULL AND users.deleted_at IS NULL
      GROUP BY
          groups.id
      ORDER BY
          groups.name ASC
      LIMIT ${_pagination.skip}, ${_pagination.limit}
      `;

      const allGroups = await sails.sendNativeQuery(rawSQL, []);

      let totalGroups = await Group.count().where({deletedAt: null});

      res.status(200).json({
        success: true,
        total: totalGroups,
        limit: _pagination.limit,
        skip: _pagination.skip,
        page: _pagination.page,
        message: 'All existing groups with pagination',
        data: allGroups.rows
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
      const time1 = performance.now();

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
      const time1 = performance.now();

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

  /** Method called to create a new group */
  /**Model models/Group.js*/
  groupInsert: async (req, res) => {
    try {
      const time1 = performance.now();

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

  /** Method called to create a new group */
  /**Model models/Group.js*/
  getGroupsById: async (req, res) => {
    try {
      const time1 = performance.now();

      let group = await Group.findOne({id: req.query.id});
      res.status(200).json({
        success: true,
        message: 'Successfully fetched group data by id',
        data: group
      });

    } catch (error) {
      console.log(error);
      res.status(400).json({
        success: false,
        message: 'Failed to fetched group data by id',
        error
      });
    }
  },

  /** Method called to update a group */
  /**Model models/Group.js*/
  groupUpdate: async (req, res) => {
    console.log('req.here: ');
    try {
      const time1 = performance.now();

      let body = {};

      id = req.query.id;
      body.name = req.body.name;
      body.description = req.body.description;
      body.accessList = JSON.parse(req.body.permissionKeysArray);

      let group = await Group.updateOne({id: id}).set(body);

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

  /** Method called to check whether group name exists or not */
  /**Model models/Group.js*/
  checkGroupName: async (req, res) => {
    try {
      const time1 = performance.now();

      if (!req.body.groupName) {
        return res.status(422).json({
          success: false,
          isunique: false,
        });
      }

      const where = {
        name: req.body.groupName,
        deletedAt: null
      };

      const group = await Group.find(where);

      if (group && group.length > 0) {
        return res.status(200).json({
          success: false,
          isunique: false,
        });
      }
      return res.status(200).json({
        success: true,
        isunique: true,
      });
    } catch (error) {
      console.log(error);
      return res.status(400).json({
        success: false,
        isunique: false,
        error
      });
    }
  }

};

