const {initLogPlaceholder, pagination} = require('../../libs');

/**
 * GenresController
 *
 * @description :: Server-side logic for managing brands
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  //Method called for getting all genre data
  //Model models/Genre.js
  getAll: async (req, res) => {
    try {
      initLogPlaceholder(req, 'Genres');

      let _pagination = pagination(req.query);

      /* WHERE condition for .......START.....................*/
      let _where = {};
      _where.deletedAt = null;


      if (req.query.searchTermName) {
        _where.name = {'like': `%${req.query.searchTermName}%`};
      }



      /* WHERE condition..........END................*/

      /*sort................*/
      let _sort = {};
      if (req.query.sortName) {
        _sort.name = req.query.sortName;
      }


      /*.....SORT END..............................*/


      let totalGenre = await  Genre.count().where(_where);
      _pagination.limit = _pagination.limit ? _pagination.limit : totalGenre;
      let genres = await Genre.find(
        {
          where: _where,
          limit: _pagination.limit,
          skip: _pagination.skip,
          sort: _sort,
        }).populateAll();


      res.status(200).json({
        success: true,
        total: totalGenre,
        limit: _pagination.limit,
        skip: _pagination.skip,
        page: _pagination.page,
        message: 'Get All design with pagination',
        data: genres
      });
    } catch
    (error) {
      let message = 'Error in Get All Genres with pagination';
      res.status(400).json({
        success: false,
        message
      });
    }
  },
};
