/**
 * EventController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
import { initLogPlaceholder, pagination, uploadImgAsync } from '../../libs';
import {imageUploadConfig} from "../../libs/helper";
module.exports = {
  //Method called for getting a event data
  //Model models/EventManagement.js
  findOne: async (req, res) => {
    try {
      res.status(200).json(
        await EventManagement.findOne(req.params.id)
      );
    } catch (error) {
      let message = "Error in Geting the product";
      res.status(400).json({
        success: false
      });
    }
  },
  //Method called for creating a event data
  //Model models/EventManagement.js
  create: async (req, res) => {

    initLogPlaceholder(req, 'event create');

    async function create(body) {
      try {
        let data = await EventManagement.create(body);
        if (data) {
          return res.json(200, data);
        } else {
          return res.status(400).json({ success: false });
        }
      } catch (error) {
        return res.status(400).json({ success: false });
      }
    }

    if (req.body.hasImage === 'true') {
      let tempImg = await uploadImgAsync(req.file('image'), {
        ...imageUploadConfig,
        saveAs: Date.now() + '_event.jpg'
      });

      let newPath = tempImg[0].fd.split(/[\\//]+/).reverse()[0];
      req.body.image = '/' + newPath;
      create(req.body);
    } else {
      create(req.body);
    }
  },
  //Method called for updating a event data
  //Model models/EventManagement.js
  update: function (req, res) {
    if (req.body.hasImage === "true") {

      req.file("image").upload( imageUploadConfig,
        function(err, uploaded) {
          if (err) {
            return res.json(err.status, { err: err });
          }
          const newPath = uploaded[0].fd.split(/[\\//]+/).reverse()[0];
          if (err) return res.serverError(err);
          req.body.image = "/" + newPath;


          EventManagement.update({ id: req.param("id") }, req.body).exec(function(
            err,
            eventManagement
          ) {
            if (err) {
              return res.json(err.status, { err: err });
            }
            if (eventManagement) {
              res.json(200, {
                eventManagement: eventManagement,
                token: jwToken.issue({ id: eventManagement.id })
              });
            }
          });
        }
      );
    } else {
      EventManagement.update({ id: req.param("id") }, req.body).exec(function(err, eventManagement) {
        if (err) {
          return res.json(err.status, { err: err });
        }
        if (eventManagement) {
          res.json(200, { eventManagement: eventManagement, token: jwToken.issue({ id: eventManagement.id }) });
        }
      });
    }
  },
  //Method called for deleting a event data
  //Model models/EventManagement.js
  destroy: function(req, res) {
    EventManagement.update({ id: req.param('id') }, { deletedAt: new Date() }).exec(
      function(err, EventManagement) {
        if (err) return res.json(err, 400);
        return res.json(EventManagement[0]);
      }
    );
  }
};

