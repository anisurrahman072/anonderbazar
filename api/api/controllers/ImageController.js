/**
 * ImageController
 *
 * @description :: Server-side logic for managing images
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

import {imageUploadConfig} from "../../libs/helper";

module.exports = {
    //Method called for sending a image data
  sendImage: function (req, res) {

     res.attachment('images/ec2d14ab-03e8-47ba-9437-497e64834a0b.jpg');
    res.send()
  },
  //Method called for uploading a image data
  upload: function (req, res) {
    if (req.method === 'GET')
      return res.json({'status': 'GET not allowed'});

    req.file('imageFile').upload(imageUploadConfig(), function (err, files) {
      // maxBytes: 10000000;
      if (err) return res.serverError(err);
      res.json(200, files);
    });
  }
};

