/**
 * VariantsController
 *
 * @description :: Server-side logic for managing variants
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const {initLogPlaceholder, pagination} = require("../../libs");

module.exports = {
  //Method called for getting all variant data
  //Model models/Variant.js
  getAll: async (req, res) => {
    try {
      initLogPlaceholder(req, 'Variants');

      let _pagination = pagination(req.query);

      /* WHERE condition for .......START.....................*/
      let _where = {};
      _where.deletedAt = null;


      if (req.query.searchTermName) {
        _where.name = {'like': `%${req.query.searchTermName}%`}
      }



      /* WHERE condition..........END................*/

      /*sort................*/
      let _sort = {};
      if (req.query.sortName) {
        _sort.name = req.query.sortName
      }


      /*.....SORT END..............................*/


      let totalVariant = await  Variant.count().where(_where);
      _pagination.limit = _pagination.limit ? _pagination.limit : totalVariant;
      let variants = await Variant.find(
        {
          where: _where,
          limit: _pagination.limit,
          skip: _pagination.skip,
          sort: _sort,
        }).populateAll();


      res.status(200).json({
        success: true,
        total: totalVariant,
        limit: _pagination.limit,
        skip: _pagination.skip,
        page: _pagination.page,
        message: 'Get All variant with pagination',
        data: variants
      })
    } catch
      (error) {
      let message = 'Error in Get All Variant with pagination';

      res.status(400).json({
        success: false,
        message
      })
    }
  },


};

