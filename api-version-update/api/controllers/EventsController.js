/**
 * EventsController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const {pagination} = require('../../libs/pagination');
const {performance} = require('perf_hooks');

module.exports = {
  //Method called for getting all event list data
  //Model models/EventManagement.js
  index: async (req, res) => {

    try {
      const time1 = performance.now();


      let _pagination;
      _pagination = pagination(req.query);

      let _where = {};
      _where.deletedAt = null;

      let totalEvents = await EventManagement.count().where(_where);
      _pagination.limit = _pagination.limit ? _pagination.limit : totalEvents;
      let events = await EventManagement.find({
        where: _where,
        limit: _pagination.limit,
        skip: _pagination.skip,
      });

      let allevents = await Promise.all(
        events.map(async item => {
          item.registered_event = await EventRegistration.find({
            deletedAt: null,
            user_id: req.query.userId,
            event_id: item.id
          });
          return item;
        })
      );

      const time2 = performance.now();
      sails.log.debug(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.status(200).json({
        success: true,
        total: totalEvents,
        limit: _pagination.limit,
        skip: _pagination.skip,
        page: _pagination.page,
        message: 'Get All Events with pagination',
        data: allevents
      });
    } catch (error) {
      console.log(error);
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      let message = 'Error in Get All Events with pagination';
      res.status(400).json({
        success: false,
        message,
        error
      });
    }
  },


};

