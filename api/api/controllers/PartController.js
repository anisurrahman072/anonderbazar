import { uploadImgAsync } from '../../libs';
import {imageUploadConfig} from "../../libs/helper";

/**
 * DesignCategoryController
 *
 * @description :: Server-side logic for managing categories
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
let asyncForEach = require('../../libs').asyncForEach;

module.exports = {
  //Method called for creating a product part data
  //Model models/Part.js
  create: function(req, res) {
    function create(body) {
      Part.create(body).exec(function(err, design) {
        if (err) {
          return res.json(err.status, { err: err });
        }
        if (design) {
          res.json(200, design);
        }
      });
    }

    if (req.body.hasImage === 'true') {
      req.file('image').upload(
        {
         ...imageUploadConfig,
          saveAs: Date.now() + '_part.jpg'
        },
        function(err, uploaded) {
          if (err) {
            return res.json(err.status, { err: err });
          }
          const newPath = uploaded[0].fd.split(/[\\//]+/).reverse()[0];
          if (err) return res.serverError(err);
          req.body.image = '/' + newPath;
          create(req.body);
        }
      );
    } else {
      create(req.body);
    }
  },
  //Method called for updating a product part data
  //Model models/Part.js
  update: async (req, res) => {
    if (req.body.hasImage == 'true') {

      req.file("image").upload(imageUploadConfig,
        function(err, uploaded) {
          if (err) {
            return res.json(err.status, { err: err });
          }
          const newPath = uploaded[0].fd.split(/[\\//]+/).reverse()[0];
          if (err) return res.serverError(err);
          req.body.image = "/" + newPath;
          Part.update({ id: req.param("id") }, req.body).exec(function(
            err,
            part
          ) {
            if (err) {
              return res.json(err.status, { err: err });
            }
            if (part) {
              return res.json(200, {
                part: part,
                token: jwToken.issue({ id: part.id })
              });
            }
          });
        }
      );
    } else {
      let updatedPart = await Part.update({ id: req.param('id') }, req.body);
      return res.json(200, updatedPart[0]);
    }
  },

  // destroy a row
  destroy: function(req, res) {
    Part.update({ id: req.param('id') }, { deletedAt: new Date() }).exec(
      function(err, part) {
        if (err) return res.json(err, 400);
        return res.json(part[0]);
      }
    );
  }
};
