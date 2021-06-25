/**
 * AnonderJhorController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const {imageUploadConfig} = require('../../libs/helper');
const OfferService = require('../services/OfferService');
const {pagination} = require('../../libs/pagination');

module.exports = {
  getAnonderJhor: async (req, res) => {
    try {
      let anonderJhorData = await AnonderJhor.findOne({id: 1});
      console.log('anonderJhorData: aaa', anonderJhorData);
      return res.status(200).json({
        success: true,
        message: 'AnonderJhor Data fetched successfully',
        data: anonderJhorData
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: 'Failed to get AnonderJhor Data',
        error
      });
    }
  },

  jhorActiveStatusChange: async (req, res) => {
    try {
      let anonderJhorData = await AnonderJhor.findOne({id: 1});
      const endDate = anonderJhorData.end_date.getTime();
      const presentTime = (new Date(Date.now())).getTime();

      let jhorStatus;

      if (endDate > presentTime) {
        jhorStatus = await AnonderJhor.updateOne({id: 1}).set({status: req.body});
      } else {
        await AnonderJhor.updateOne({id: 1}).set({status: 0});
        return res.status(200).json({
          code: 'INVALID_ACTION',
          message: 'status can not be changed'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'AnonderJhor status changed successfully',
        status: jhorStatus.status
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: 'Failed to change AnonderJhor status',
        error
      });
    }
  },

  updateAnonderJhor: async (req, res) => {
    try {
      console.log('in jhor update: ', req.body);
      let body = req.body;
      if (body.hasImage === 'true') {
        req.file('image').upload(imageUploadConfig(), async (err, files) => {
          if (err) {
            return res.serverError(err);
          }

          if (files.length === 0) {
            return res.badRequest('No image was uploaded');
          }

          const newPath = files[0].fd.split(/[\\//]+/).reverse()[0];
          body.banner_image = '/' + newPath;

          let jhorData = {
            start_date: body.startDate,
            end_date: body.endDate,
            banner_image: body.banner_image,
            status: 0
          };

          let data = await AnonderJhor.updateOne({id: 1}).set(jhorData);

          return res.status(200).json({
            success: true,
            message: 'Anonder Jhor updated successfully',
            data
          });
        });
      } else {
        let jhorData = {
          start_date: req.body.startDate,
          end_date: req.body.endDate,
          status: 0
        };

        let data = await AnonderJhor.updateOne({id: 1}).set(jhorData);

        return res.status(200).json({
          success: true,
          message: 'AnonderJhor Data updated successfully',
          data: data
        });
      }
    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: 'Failed to update AnonderJhor Data',
        error
      });
    }
  },

  getAllAnonderJhorOffersData: async (req, res) => {
    try {
      await OfferService.anonderJhorOfferDurationCheck();

      let _pagination = pagination(req.query);

      let _where = {};
      _where.deletedAt = null;

      let allAnonderJhorOffersData = await AnonderJhorOffers.find({
        where: _where,
        limit: _pagination.limit,
        skip: _pagination.skip
      }).populate('category_id')
        .populate('sub_category_id')
        .populate('sub_sub_category_id');

      let totalAnonderJhorOffersData = await AnonderJhorOffers.count().where(_where);
      console.log('jhor offrs data: ', allAnonderJhorOffersData);
      console.log('total offrs data: ', totalAnonderJhorOffersData);

      res.status(200).json({
        success: true,
        total: totalAnonderJhorOffersData,
        limit: _pagination.limit,
        skip: _pagination.skip,
        page: _pagination.page,
        message: 'All Anonder Jhor offers with pagination',
        data: allAnonderJhorOffersData
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: 'Failed to get all Anonder Jhor Offers Data',
        error
      });
    }
  },

  offerActiveStatusChange: async (req, res) => {
    try {
      await OfferService.anonderJhorOfferDurationCheck();

      let anonderJhorData = await AnonderJhor.findOne({id: 1});
      const presentTime = (new Date(Date.now())).getTime();
      let jhorOfferData = await AnonderJhorOffers.findOne({id: req.body.offerId});
      let jhorOfferEndTime = jhorOfferData.end_date.getTime();

      if (presentTime > jhorOfferEndTime || anonderJhorData.status === 0) {
        return res.status(200).json({
          code: 'NOT_ALLOWED',
          message: 'status can not be changed'
        });
      }

      let anonderJhorOffer = await AnonderJhorOffers.updateOne({id: req.body.offerId})
        .set({status: req.body.event});

      res.status(200).json({
        success: true,
        message: 'Successfully updated offer status',
        status: anonderJhorOffer.status
      });
    } catch (error) {
      console.log('error: ', error);
      res.status(400).json({
        success: false,
        message: 'failed to update offer status',
        error
      });
    }
  },

  deleteAnonderJhorOffer: async (req, res) => {
    try {
      const anonderJhorOffer = await AnonderJhorOffers.updateOne({id: req.body}).set({deletedAt: new Date()});

      return res.status(201).json({
        success: true,
        message: 'Successfully deleted an anonder jhor offer',
        anonderJhorOffer
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: 'Failed to delete an anonder jhor offer',
        error
      });
    }
  },

};

