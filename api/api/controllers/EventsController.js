/**
 * EventsController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
import {Helper, asyncForEach, initLogPlaceholder, pagination } from '../../libs';

module.exports = {
  //Method called for getting all event list data
  //Model models/EventManagement.js
  index: async (req, res) => {


    try {
      initLogPlaceholder(req, 'EventList');

      let _pagination = pagination(req.query);

      /* WHERE condition for .......START.....................*/
      let _where = {};
      _where.deletedAt = null;

      /*.....SORT END..............................*/

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
            user_id:req.query.userId,
            event_id: item.id
          });
          return item;
        })
      );
      res.status(200).json({
        success: true,
        total: totalEvents,
        limit: _pagination.limit,
        skip: _pagination.skip,
        page: _pagination.page,
        message: 'Get All products with pagination',
        data: allevents
      });
    } catch (error) {
      let message = 'Error in Get All products with pagination';
      res.status(400).json({
        success: false,
        message
      });
    }
  },


};

