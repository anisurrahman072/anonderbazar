/**
 * GenresController
 *
 * @description :: Server-side logic for managing brands
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const {performance} = require('perf_hooks');
const {pagination} = require('../../libs/pagination');
module.exports = {
  //Method called for getting all genre data
  //Model models/Genre.js
  getAll: async (req, res) => {
    try {
      const time1 = performance.now();

      let _pagination = pagination(req.query);

      /* WHERE condition for .......START.....................*/
      let _where = {};
      _where.deletedAt = null;


      if (req.query.searchTermName) {
        _where.name = {'like': `%${req.query.searchTermName}%`};
      }

      let _sort = {};
      if (req.query.sortName) {
        _sort.name = req.query.sortName;
      }

      let totalGenre = await  Genre.count().where(_where);
      _pagination.limit = _pagination.limit ? _pagination.limit : totalGenre;
      let genres = await Genre.find(
        {
          where: _where,
          limit: _pagination.limit,
          skip: _pagination.skip,
          sort: _sort,
        });


      const time2 = performance.now();
      sails.log.debug(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      res.status(200).json({
        success: true,
        total: totalGenre,
        limit: _pagination.limit,
        skip: _pagination.skip,
        page: _pagination.page,
        message: 'Get All design with pagination',
        data: genres
      });
    } catch (error) {
      console.log(error);
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      let message = 'Error in Getting All Genres with pagination';
      res.status(400).json({
        success: false,
        message,
        error
      });
    }
  },
};

