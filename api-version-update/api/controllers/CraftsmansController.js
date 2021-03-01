/**
 * CraftsmansController
 *
 * @description :: Server-side logic for managing brands
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const {initLogPlaceholder, pagination} = require('../../libs');

module.exports = {
  //Method called for getting all craftsman list data
  //Model models/User.js
  getAll: async (req, res) => {
    try {
      initLogPlaceholder(req, 'craftsman');

      let _pagination = pagination(req.query);

      /* WHERE condition for .......START.....................*/
      let _where = {};
      _where.deletedAt = null;
      _where.group_id = 6;


      if (req.query.warehouse_id) {
        _where.warehouse_id = req.query.warehouse_id;
      }

      if (req.query.searchTermEmail) {
        _where.email = {'like': `%${req.query.searchTermEmail}%`};
      }

      if (req.query.searchTermName) {
        _where.or = [
          {first_name: {'like': `%${req.query.searchTermName}%`}},
          {last_name: {'like': `%${req.query.searchTermName}%`}},
        ];
      }


      if (req.query.searchTermPhone) {
        _where.phone = {'like': `%${req.query.searchTermPhone}%`};
      }

      if (req.query.gender) {
        _where.gender = req.query.gender;
      }


      /* WHERE condition..........END................*/

      /*sort................*/
      let _sort = [];
      if (req.query.sortName) {
        _sort.push({name: req.query.sortName});
      }


      /*.....SORT END..............................*/


      let totalCraftsman = await User.count().where(_where);
      _pagination.limit = _pagination.limit ? _pagination.limit : totalCraftsman;
      let craftsmans = await User.find(
        {
          where: _where,
          limit: _pagination.limit,
          skip: _pagination.skip,
          sort: _sort,
        })
        .populate('group_id')
        .populate('warehouse_id')
        .populate('upazila_id')
        .populate('zila_id')
        .populate('division_id')
        .populate('permanent_upazila_id')
        .populate('permanent_zila_id')
        .populate('permanent_division_id');

      res.status(200).json({
        success: true,
        total: totalCraftsman,
        limit: _pagination.limit,
        skip: _pagination.skip,
        page: _pagination.page,
        message: 'Get All craftsmans with pagination',
        data: craftsmans
      });
    } catch (error) {
      let message = 'Error in Get All craftsmans with pagination';
      res.status(400).json({
        success: false,
        message,
        error
      });
    }
  },
};

