import {asyncForEach, initLogPlaceholder, pagination} from "../../libs";

/**
 * DesignCategoriesController
 *
 * @description :: Server-side logic for managing categories
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  //Method called for getting all category design list data
  //Model models/DesignCategory.js
  getAll: async (req, res) => {
    try {
      initLogPlaceholder(req, 'Design categories');

      let _pagination = pagination(req.query);

      /* WHERE condition for .......START.....................*/
      let _where = {};
      _where.deletedAt = null;
      _where.parent_id = 0;


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


      let totalDesignCategories = await  DesignCategory.count().where(_where);
      _pagination.limit = _pagination.limit ? _pagination.limit : totalDesignCategories;
      let designCategories = await DesignCategory.find(
        {
          where: _where,
          limit: _pagination.limit,
          skip: _pagination.skip,
          sort: _sort,
        });


      res.status(200).json({
        success: true,
        total: totalDesignCategories,
        limit: _pagination.limit,
        skip: _pagination.skip,
        page: _pagination.page,
        message: 'Get All designCategories with pagination',
        data: designCategories
      })
    } catch
      (error) {
      let message = 'Error in Get All designCategories with pagination';
      res.status(400).json({
        success: false,
        message
      })
    }
  },
  //Method called for getting all category design list with sub categories
  //Model models/DesignCategory.js
  withDesignSubcategory: async (req, res) => {
    try {
      initLogPlaceholder(req, 'product category  withsubcategory');
      let _pagination = pagination(req.query);

      /* WHERE condition for .............START ...............................*/
      let _where = {};
      _where.deletedAt = null;
      _where.parent_id = 0;

      /*  WHERE condition ...................END ...........*/
      /*sort.....................*/
      let _sort = {};
      if (req.query.sortName) {
        _sort.name = req.query.sortName
      }

      if (req.query.searchTermName) {
        _where.or = [
          {name: {'like': `%${req.query.searchTermName}%`}}
        ]
      }

      let totalCategory = await DesignCategory.count().where(_where);
      let categories = await DesignCategory.find({
        where: _where,
        limit: _pagination.limit,
        skip: _pagination.skip,
        sort: _sort,
      });


      await asyncForEach(categories, async (_category) => {
        _category.subCategories = await DesignCategory.find({parent_id: _category.id, deletedAt: null})
      });

      res.status(200).json({
        success: true,
        total: totalCategory,
        limit: _pagination.limit,
        skip: _pagination.skip,
        page: _pagination.page,
        message: "product category  withsubcategory",
        data: categories

      })
    } catch (error) {

      res.status(400).json({
        success: false,
        message: "",
        error
      })
    }

  }

};

