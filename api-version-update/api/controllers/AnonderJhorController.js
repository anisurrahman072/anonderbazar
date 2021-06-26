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
      /*console.log('anonderJhorData: aaa', anonderJhorData);*/
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
      /*console.log('in jhor update: ', req.body);*/
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
      /*console.log('jhor offrs data: ', allAnonderJhorOffersData);
      console.log('total offrs data: ', totalAnonderJhorOffersData);*/

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

  anonderJhorOfferInsert: async (req, res) => {
    try {
      let body = req.body;
      if (req.body.hasImage === 'true') {
        req.file('image').upload(imageUploadConfig(), async (err, files) => {
          if (err) {
            return res.serverError(err);
          }

          if (files.length === 0) {
            return res.badRequest('No image was uploaded');
          }

          const newPath = files[0].fd.split(/[\\//]+/).reverse()[0];

          body.image = '/' + newPath;

          let offerData = {
            image: body.image,
            calculation_type: body.calculationType,
            discount_amount: body.discountAmount,
            start_date: body.offerStartDate,
            end_date: body.offerEndDate,
            category_id: body.categoryId,
            anonder_jhor_id: 1,
            status: 0
          };

          if (body.subSubCategoryId && body.subSubCategoryId !== 'null' && body.subSubCategoryId !== 'undefined') {
            offerData.sub_sub_category_id = body.subSubCategoryId;
            const subSubCat = await AnonderJhorOffers.findOne({
              sub_sub_category_id: body.subSubCategoryId,
              status: 1
            });
            if (subSubCat !== undefined) {
              return res.status(200).json({
                code: 'INVALID_SUBSUBCAT',
                message: 'Subsub category already in another anonder jhor offer'
              });
            }
          }

          if (body.subCategoryId && body.subCategoryId !== 'null' && body.subCategoryId !== 'undefined') {
            offerData.sub_category_id = body.subCategoryId;
          }

          let data = await AnonderJhorOffers.create(offerData).fetch();

          return res.status(200).json({
            success: true,
            message: 'Anonder jhor Offer created successfully',
            data
          });

        });

      } else {
        let offerData = {
          calculation_type: body.calculationType,
          discount_amount: body.discountAmount,
          start_date: body.offerStartDate,
          end_date: body.offerEndDate,
          category_id: body.categoryId,
          anonder_jhor_id: 1,
          status: 0
        };

        if (body.subSubCategoryId && body.subSubCategoryId !== 'null' && body.subSubCategoryId !== 'undefined') {
          offerData.sub_sub_category_id = body.subSubCategoryId;
          const subSubCat = await AnonderJhorOffers.findOne({
            sub_sub_category_id: body.subSubCategoryId,
            status: 1
          });
          if (subSubCat !== undefined) {
            return res.status(200).json({
              code: 'INVALID_SUBSUBCAT',
              message: 'Subsub category already in another anonder jhor offer'
            });
          }
        }

        if (body.subCategoryId && body.subCategoryId !== 'null' && body.subCategoryId !== 'undefined') {
          offerData.sub_category_id = body.subCategoryId;
        }

        let data = await AnonderJhorOffers.create(offerData).fetch();

        return res.status(200).json({
          success: true,
          message: 'Anonder jhor Offer created successfully',
          data
        });
      }
    } catch (error) {
      console.log('error in insert offer: ', error);
      return res.status(400).json({
        success: false,
        message: 'Error in creating the Anonder jhor  offer',
        error
      });
    }
  },

  getAllCategories: async (req, res) => {
    try {
      let allCategories = await Category.find({type_id: 2, parent_id: 0, deletedAt: null});
      return res.status(200).json({
        success: true,
        message: 'all categories fetched successfully',
        data: allCategories
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: 'Failed to get all categories',
        error
      });
    }
  },

  getAllSubCategories: async (req, res) => {
    try {
      let allSubCategories = await Category.find({
        type_id: 2,
        parent_id: parseInt(req.query.parentId),
        deletedAt: null
      });
      return res.status(200).json({
        success: true,
        message: 'all sub-categories fetched successfully',
        data: allSubCategories
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: 'Failed to get all sub-categories',
        error
      });
    }
  },

  getAllSubSubCategories: async (req, res) => {
    try {
      let allSubSubCategories = await Category.find({
        type_id: 2,
        parent_id: parseInt(req.query.parentId),
        deletedAt: null
      });
      return res.status(200).json({
        success: true,
        message: 'all sub-sub-categories fetched successfully',
        data: allSubSubCategories
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: 'Failed to get all sub-sub-categories',
        error
      });
    }
  },

  getAnonderJhorOfferById: async (req, res) => {
    try {
      await OfferService.anonderJhorOfferDurationCheck();
      let anonderJhorOffer = await AnonderJhorOffers.findOne({id: req.query.id})
        .populate('category_id')
        .populate('sub_category_id')
        .populate('sub_sub_category_id');

      res.status(200).json({
        success: true,
        message: 'Anonder Jhor Offer data by id',
        anonderJhorOffer
      });
    } catch (error) {
      console.log('error in getAnonderJhorOfferById: ', error);
      res.status(400).json({
        success: false,
        message: 'failed to get Anonder Jhor offer by id',
        error
      });
    }
  },

  updateAnonderJhorOffer: async (req, res) => {
    console.log('body updateAnonderJhorOffer: ', req.body);
    try {
      let body = req.body;
      if (req.body.hasImage === 'true') {
        req.file('image').upload(imageUploadConfig(), async (err, files) => {
          if (err) {
            return res.serverError(err);
          }

          if (files.length === 0) {
            return res.badRequest('No image was uploaded');
          }

          const newPath = files[0].fd.split(/[\\//]+/).reverse()[0];

          body.image = '/' + newPath;

          let offerData = {
            image: body.image,
            calculation_type: body.calculationType,
            discount_amount: body.discountAmount,
            start_date: body.offerStartDate,
            end_date: body.offerEndDate,
            category_id: body.categoryId,
            anonder_jhor_id: 1,
            status: 0
          };

          if (body.subSubCategoryId && body.subSubCategoryId !== 'null' && body.subSubCategoryId !== 'undefined') {
            offerData.sub_sub_category_id = body.subSubCategoryId;
            const subSubCat = await AnonderJhorOffers.findOne({
              sub_sub_category_id: body.subSubCategoryId,
              status: 1
            });
            if (subSubCat !== undefined) {
              return res.status(200).json({
                code: 'INVALID_SUBSUBCAT',
                message: 'Subsub category already in another anonder jhor offer'
              });
            }
          }else {
            offerData.sub_sub_category_id = null;
          }

          if (body.subCategoryId && body.subCategoryId !== 'null' && body.subCategoryId !== 'undefined') {
            offerData.sub_category_id = body.subCategoryId;
          }else {
            offerData.sub_category_id = null;
          }

          let data = await AnonderJhorOffers.updateOne({id: body.id}).set(offerData);

          return res.status(200).json({
            success: true,
            message: 'Anonder Jhor Offer updated successfully',
            data
          });

        });

      } else {
        let offerData = {
          calculation_type: body.calculationType,
          discount_amount: body.discountAmount,
          start_date: body.offerStartDate,
          end_date: body.offerEndDate,
          category_id: body.categoryId,
          anonder_jhor_id: 1,
          status: 0
        };

        if (body.subSubCategoryId && body.subSubCategoryId !== 'null' && body.subSubCategoryId !== 'undefined') {
          offerData.sub_sub_category_id = body.subSubCategoryId;
          const subSubCat = await AnonderJhorOffers.findOne({
            sub_sub_category_id: body.subSubCategoryId,
            status: 1
          });
          if (subSubCat !== undefined) {
            return res.status(200).json({
              code: 'INVALID_SUBSUBCAT',
              message: 'Subsub category already in another anonder jhor offer'
            });
          }
        }else {
          offerData.sub_sub_category_id = null;
        }

        if (body.subCategoryId && body.subCategoryId !== 'null' && body.subCategoryId !== 'undefined') {
          offerData.sub_category_id = body.subCategoryId;
        }else {
          offerData.sub_category_id = null;
        }


        let data = await AnonderJhorOffers.updateOne({id: body.id}).set(offerData);

        return res.status(200).json({
          success: true,
          message: 'Anonder Jhor Offer updated successfully',
          data
        });
      }

    } catch (error) {
      console.log('updateOffer error: ', error);
      res.status(400).json({
        success: false,
        message: 'Failed to update Anonder Jhor Offer',
        error
      });
    }
  },

};

