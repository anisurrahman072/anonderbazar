/**
 * OfferController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const {imageUploadConfig} = require('../../libs/helper');

module.exports = {
  /**Method for getting all the shop, brand and category */
  getAllOptions: async (req, res) => {
    try {
      let allOptions;
      if (req.query.offerSelectionType && req.query.offerSelectionType === 'Vendor wise') {
        allOptions = await Warehouse.find({deletedAt: null});
      } else if (req.query.offerSelectionType && req.query.offerSelectionType === 'Brand wise') {
        allOptions = await Brand.find({deletedAt: null});
      } else {
        allOptions = await Category.find({deletedAt: null, parent_id: 0, type_id: 2});
      }

      res.status(200).json({
        success: true,
        message: 'Get all options for shop/ brand/ category',
        data: allOptions
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({
        success: false,
        message: 'failed in Getting all options for shop/ brand/ category',
        error
      });
    }
  },

  /**Method called for creating offer data*/
  /**Model models/Offer.js*/
  offerInsert: async (req, res) => {
    /**console.log('offer request to controller from client: ', req.body);*/
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

          if (files.length === 2) {
            if (req.body.hasBannerImage) {
              let bannerImagePath = files[1].fd.split(/[\\//]+/).reverse()[0];
              body.banner_image = '/' + bannerImagePath;
            } else if (req.body.hasSmallImage) {
              let smallImagePath = files[1].fd.split(/[\\//]+/).reverse()[0];
              body.small_image = '/' + smallImagePath;
            }
          } else if (files.length === 3) {
            let smallImagePath = files[1].fd.split(/[\\//]+/).reverse()[0];
            body.small_image = '/' + smallImagePath;

            let bannerImagePath = files[2].fd.split(/[\\//]+/).reverse()[0];
            body.banner_image = '/' + bannerImagePath;
          }

          body.image = '/' + newPath;

          let offerData = {
            title: body.title,
            image: {
              image: body.image,
              small_image: body.small_image,
              banner_image: body.banner_image,
            },
            description: body.description,
            calculation_type: body.calculationType,
            discount_amount: body.discountAmount,
            start_date: body.offerStartDate,
            end_date: body.offerEndDate,
            show_in_homepage: body.showInHome
          };

          if (body.frontend_position) {
            offerData.frontend_position = body.frontend_position;
          }

          if (body.category_id && body.category_id !== 'null' && body.category_id !== 'undefined') {
            offerData.category_ids = body.category_id;
          }

          if (body.brand_id && body.brand_id !== 'null' && body.brand_id !== 'undefined') {
            offerData.brand_ids = body.brand_id;
          }

          if (body.vendor_id && body.vendor_id !== 'null' && body.vendor_id !== 'undefined') {
            offerData.vendor_ids = body.vendor_id;
          }

          if (body.selectedProductIds && body.selectedProductIds !== 'null' && body.selectedProductIds !== 'undefined') {
            offerData.product_ids = body.selectedProductIds.split(',');
          }

          let data = await Offer.create(offerData).fetch();
          /**console.log('offer fetched data from database: with image: ', data);*/

          return res.status(200).json({
            success: true,
            message: 'Offer created successfully',
            data
          });

        });

      } else {
        let offerData = {
          title: body.title,
          description: body.description,
          calculation_type: body.calculationType,
          discount_amount: body.discountAmount,
          start_date: body.offerStartDate,
          end_date: body.offerEndDate,
          show_in_homepage: body.showInHome
        };

        if (body.frontend_position) {
          offerData.frontend_position = body.frontend_position;
        }

        if (body.category_id && body.category_id !== 'null' && body.category_id !== 'undefined') {
          offerData.category_ids = body.category_id;
        }

        if (body.brand_id && body.brand_id !== 'null' && body.brand_id !== 'undefined') {
          offerData.brand_ids = body.brand_id;
        }

        if (body.vendor_id && body.vendor_id !== 'null' && body.vendor_id !== 'undefined') {
          offerData.vendor_ids = body.vendor_id;
        }

        if (body.selectedProductIds && body.selectedProductIds !== 'null' && body.selectedProductIds !== 'undefined') {
          offerData.product_ids = body.selectedProductIds.split(',');
        }

        let data = await Offer.create(offerData).fetch();
        /**console.log('offer fetched data from database: ', data);*/

        return res.status(200).json({
          success: true,
          message: 'Offer created successfully',
          data
        });
      }
    } catch (error) {
      console.log('error in insert offer: ', error);
      return res.status(400).json({
        success: false,
        message: 'Error in creating the offer',
        error
      });
    }
  }

};

