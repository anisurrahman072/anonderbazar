/**
 * PartsController
 *
 * @description :: Server-side logic for managing categories
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

import {asyncForEach, initLogPlaceholder, pagination} from "../../libs";

module.exports = {
    //Method called for getting all product part data
  //Model models/Part.js
  getAll: async (req, res) => {
    try {
      initLogPlaceholder(req, 'PartsList ');

      let _pagination = pagination(req.query);

      /* WHERE condition for .......START.....................*/
      let _where = {};
      _where.deletedAt = null;


      if (req.query.category_id) {
        _where.category_id = req.query.category_id
      }
      if (req.query.subcategory_id) {
        _where.subcategory_id = req.query.subcategory_id
      }

      if (req.query.search_term) {
        _where.or = [
          {name: {'like': `%${req.query.search_term}%`}},
        ]
      }
      /* WHERE condition..........END................*/

      /*sort................*/
      let _sort = {};
      if (req.query.sortName) {
        _sort.name = req.query.sortName
      }
      /*.....SORT END..............................*/


      let totalPart = await  Part.count().where(_where);
      _pagination.limit = _pagination.limit ? _pagination.limit : totalPart;
      let parts = await Part.find(
        {
          where: _where,
          limit: _pagination.limit,
          skip: _pagination.skip,
          sort: _sort,
        }).populateAll();


      res.status(200).json({
        success: true,
        total: totalPart,
        limit: _pagination.limit,
        skip: _pagination.skip,
        page: _pagination.page,
        message: 'Get All products with pagination',
        data: parts
      })
    } catch
      (error) {
      let message = 'Error in Get All products with pagination';
      res.status(400).json({
        success: false,
        message
      })
    }
  },
};

