/**
 * PRStatusController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const moment = require('moment');
const {pagination} = require('../../libs/pagination');

module.exports = {

  massInsert: async (req, res) => {

    console.log(req.body);

    if(!req.body.dataToInsert){
      return res.status(422).json({
        success: false,
        'message': 'Operation Failed (Validation Error)'
      });
    }
    const dataToInsert = req.body.dataToInsert;
    try {
      if (  dataToInsert.suborder_ids && dataToInsert.suborder_ids.length > 0 && dataToInsert.allPayloads && dataToInsert.allPayloads.length > 0) {
        const data = dataToInsert.allPayloads.map((prReq) => {
          const date = moment(prReq.date).format('YYYY-MM-DD HH:mm:ss');
          return {
            ...prReq,
            date
          };
        });

        await sails.getDatastore()
          .transaction(async (db) => {

            await PRStatus.createEach(data).usingConnection(db);
            await Suborder.update({
              id: dataToInsert.suborder_ids,
            }).set({PR_status: 1}).usingConnection(db);

          });

        return res.status(201).json({
          success: true,
          'message': 'Operation successful'
        });
      }

      return res.status(422).json({
        success: false,
        'message': 'Operation Failed (Validation Error)'
      });

    } catch (error) {
      console.log('error', error);
      let message = 'Error in Mass update pr status';
      return res.status(400).json({
        success: false,
        message,
        error
      });
    }
  },
  //Method called for creating PR Status
  //Model models/PRStatus.js
  create: async (req, res) => {
    try {
      req.body.date = moment(req.body.date).format('YYYY-MM-DD HH:mm:ss');
      let data = await PRStatus.create(req.body).fetch();
      if (data) {
        return res.json(200, data);
      } else {
        return res.status(422).json({success: false});
      }
    } catch (error) {
      return res.status(400).json({success: false, error});
    }

  },

  getAll: async (req, res) => {
    try{
      let _pagination = pagination(req.query);
      let _where = {};
      _where.deletedAt = null;

      let allPrStatus = await PRStatus.find({
        where: _where,
        limit: _pagination.limit,
        skip: _pagination.skip
      });

      let totalPrStatus = await PRStatus.count().where(_where);

      res.status(200).json({
        success: true,
        total: totalPrStatus,
        limit: _pagination.limit,
        skip: _pagination.skip,
        page: _pagination.page,
        message: 'Get All PRstatus with pagination.',
        data: allPrStatus
      });

    }
    catch (error){
      let message = 'Error in Get All PRstatus with pagination.';

      res.status(400).json({
        success: false,
        message,
        error
      });
    }
  },
};

