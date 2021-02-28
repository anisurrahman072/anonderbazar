/**
 * DesignsController
 *
 * @description :: Server-side logic for managing categories
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const {initLogPlaceholder, pagination} = require('../../libs');
module.exports = {
  //Method called for getting all design image list data
  //Model models/DesignImage.js
  getAll: async (req, res) => {
    try {
      initLogPlaceholder(req, 'Designs');

      let _pagination = pagination(req.query);

      /* WHERE condition for .......START.....................*/
      let _where = {};

      _where.deletedAt = null;

      if (req.query.searchTermName) {
        _where.name = {'like': `%${req.query.searchTermName}%`};
      }

      if (req.query.warehouse_id) {
        _where.warehouse_id = req.query.warehouse_id;
      }

      let _sort = [];
      if (req.query.sortName) {
        _sort.push({name: req.query.sortName});
      } else {
        _sort.push({createdAt: 'DESC'});
      }

      let totalDesign = await Design.count().where(_where);
      _pagination.limit = _pagination.limit ? _pagination.limit : totalDesign;
      let designs = await Design.find(
        {
          where: _where,
          limit: _pagination.limit,
          skip: _pagination.skip,
          sort: _sort,
        })
        .populate('product_id')
        .populate('warehouse_id');

      return res.status(200).json({
        success: true,
        total: totalDesign,
        limit: _pagination.limit,
        skip: _pagination.skip,
        page: _pagination.page,
        message: 'Get All design with pagination',
        data: designs
      });
    } catch (error) {
      let message = 'Error in Get All design with pagination';
      res.status(400).json({
        success: false,
        message,
        error
      });
    }
  },
};

