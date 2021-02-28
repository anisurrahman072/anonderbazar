const {asyncForEach, initLogPlaceholder, pagination} = require('../../libs');

/**
 * WarehouseVariantsController
 *
 * @description :: Server-side logic for managing warehousevariants
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  //Method called for getting all warehouse variant data
  //Model models/WarehouseVariant.js
  getAll: async (req, res) => {
    try {
      initLogPlaceholder(req, 'warehouseVariants');

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



      /* WHERE condition..........END................*/

      /*sort................*/
      let _sort = {};
      if (req.query.sortName) {
        _sort.name = req.query.sortName;
      }


      /*.....SORT END..............................*/


      let totalWarehouseVariant = await  WarehouseVariant.count().where(_where);
      _pagination.limit = _pagination.limit ? _pagination.limit : totalWarehouseVariant;
      let warehouseVariants = await WarehouseVariant.find(
        {
          where: _where,
          limit: _pagination.limit,
          skip: _pagination.skip,
          sort: _sort,
        })
        .populate('variant_id')
        .populate('warehouse_id')
        .populate('brand_id');


      res.status(200).json({
        success: true,
        total: totalWarehouseVariant,
        limit: _pagination.limit,
        skip: _pagination.skip,
        page: _pagination.page,
        message: 'Get All WarehouseVariant with pagination',
        data: warehouseVariants
      });
    } catch
    (error) {
      let message = 'Error in Get All WarehouseVariant  with pagination';

      res.status(400).json({
        success: false,
        message
      });
    }
  },
};

