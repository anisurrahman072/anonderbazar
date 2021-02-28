/**
 * EventController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const {uploadImages} = require('../../libs/helper');
const {uploadImagesWithConfig} = require('../../libs/helper');

module.exports = {
  //Method called for getting a event data
  //Model models/EventManagement.js
  findOne: async (req, res) => {
    try {
      const event = await EventManagement.findOne(req.params.id);
      res.status(200).json(event);
    } catch (error) {
      let message = 'Error in Getting the events';
      res.status(400).json({
        success: false,
        message,
        error
      });
    }
  },
  //Method called for creating a event data
  //Model models/EventManagement.js
  create: async (req, res) => {

    if (req.body.hasImage === 'true') {
      try {
        let uploaded = await uploadImagesWithConfig(req.file('image'), {
          saveAs: Date.now() + '_event.jpg'
        });

        if (uploaded.length === 0) {
          return res.badRequest('No file was uploaded');
        }
        let newPath = uploaded[0].fd.split(/[\\//]+/).reverse()[0];
        req.body.image = '/' + newPath;
      } catch (err) {
        console.log('err', err);
        return res.json(err.status, {err: err});
      }

    }
    try {
      let data = await EventManagement.create(req.body);
      if (data) {
        return res.json(200, data);
      } else {
        return res.status(400).json({success: false});
      }
    } catch (error) {
      return res.status(400).json({success: false, error});
    }

  },
  //Method called for updating a event data
  //Model models/EventManagement.js
  update: async (req, res) => {
    try {
      if (req.body.hasImage === 'true') {

        try {
          let uploaded = await uploadImages(req.file('image'));

          if (uploaded.length === 0) {
            return res.badRequest('No image was uploaded');
          }
          let newPath = uploaded[0].fd.split(/[\\//]+/).reverse()[0];
          req.body.image = '/' + newPath;
        } catch (err) {
          console.log('err', err);
          return res.json(err.status, {err: err});
        }
      }

      const eventManagement = await EventManagement.updateOne({id: req.param('id')}).set(req.body);

      return res.json(200, {eventManagement: eventManagement, token: jwToken.issue({id: eventManagement.id})});

    } catch (error) {
      return res.status(400).json({
        success: false,
        message: '',
        error
      });
    }
  },
  //Method called for deleting a event data
  //Model models/EventManagement.js
  destroy: async (req, res) => {
    try {
      const eventManagement = await EventManagement.updateOne({id: req.param('id')}).set({deletedAt: new Date()});
      return res.json(eventManagement);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: '',
        error
      });
    }

  }
};

