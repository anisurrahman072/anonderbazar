/**
 * AnonderJhorController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const {imageUploadConfig} = require('../../libs/helper');

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
  }

};

