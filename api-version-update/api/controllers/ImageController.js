/**
 * ImageController
 *
 * @description :: Server-side logic for managing images
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const {imageUploadConfig} = require('../../libs/helper');

module.exports = {
  //Method called for sending a image data
  sendImage: function (req, res) {

    res.attachment('images/ec2d14ab-03e8-47ba-9437-497e64834a0b.jpg');
    res.send();
  },
  //Method called for uploading a image data
  upload: async (req, res) => {
    try{
      if (req.method === 'GET'){
        return res.json({'status': 'GET not allowed'});
      }
      const files = await uploadImages(req.file('imageFile'));
      return res.status(200).json({files: files});
    }
    catch(error){
      console.log(error);
      return res.status(error.status).json({'Error': error});
    }
  }
};



