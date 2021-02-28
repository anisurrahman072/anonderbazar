/**
 * EventController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const {uploadImagesWithConfig} = require('../../libs/helper');
const {initLogPlaceholder, uploadImgAsync} = require('../../libs');
const {imageUploadConfig} = require('../../libs/helper');
module.exports = {
  //Method called for getting a event data
  //Model models/EventManagement.js
  findOne: async (req, res) => {
    try {
      const event = await await EventManagement.findOne(req.params.id);
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
  update: function (req, res) {
    if (req.body.hasImage === 'true') {

      req.file('image').upload(imageUploadConfig(),
        (err, uploaded) => {
          if (err) {
            return res.json(err.status, {err: err});
          }
          const newPath = uploaded[0].fd.split(/[\\//]+/).reverse()[0];
          if (err) {
            return res.serverError(err);
          }
          req.body.image = '/' + newPath;


          EventManagement.update({id: req.param('id')}, req.body).exec((
            err,
            eventManagement
          ) => {
            if (err) {
              return res.json(err.status, {err: err});
            }
            if (eventManagement) {
              res.json(200, {
                eventManagement: eventManagement,
                token: jwToken.issue({id: eventManagement.id})
              });
            }
          });
        }
      );
    } else {
      EventManagement.update({id: req.param('id')}, req.body).exec((err, eventManagement) => {
        if (err) {
          return res.json(err.status, {err: err});
        }
        if (eventManagement) {
          res.json(200, {eventManagement: eventManagement, token: jwToken.issue({id: eventManagement.id})});
        }
      });
    }
  },
  //Method called for deleting a event data
  //Model models/EventManagement.js
  destroy: function (req, res) {
    EventManagement.update({id: req.param('id')}, {deletedAt: new Date()}).exec(
      (err, EventManagement) => {
        if (err) {
          return res.json(err, 400);
        }
        return res.json(EventManagement[0]);
      }
    );
  }
};

