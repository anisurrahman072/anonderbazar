/**
 * VariantsController
 *
 * @description :: Server-side logic for managing variants
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const {pagination} = require('../../libs/pagination');
module.exports = {
  //Method called for getting all variant data
  //Model models/Variant.js
  getAll: async (req, res) => {
    try {

      let _pagination = pagination(req.query);

      let _where = {};
      _where.deletedAt = null;

      if (req.query.searchTermName) {
        _where.name = {'like': `%${req.query.searchTermName}%`};
      }

      let _sort = [];
      if (req.query.sortName) {
        _sort.push({name : req.query.sortName});
      }

      let totalVariant = await  Variant.count().where(_where);
      _pagination.limit = _pagination.limit ? _pagination.limit : totalVariant;
      let variants = await Variant.find(
        {
          where: _where,
          limit: _pagination.limit,
          skip: _pagination.skip,
          sort: _sort,
        });


      res.status(200).json({
        success: true,
        total: totalVariant,
        limit: _pagination.limit,
        skip: _pagination.skip,
        page: _pagination.page,
        message: 'Get All variant with pagination',
        data: variants
      });
    } catch
    (error) {
      let message = 'Error in Get All Variant with pagination';

      res.status(400).json({
        success: false,
        message
      });
    }
  },


};

