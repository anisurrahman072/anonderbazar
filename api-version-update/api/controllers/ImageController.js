/**
 * ImageController
 *
 * @description :: Server-side logic for managing images
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const {performance} = require('perf_hooks');

const {uploadImages, deleteImageS3} = require('../../libs/helper');
module.exports = {
  //Method called for sending a image data
  sendImage: function (req, res) {
    const time1 = performance.now();

    const time2 = performance.now();
    sails.log.debug(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

    res.attachment('images/ec2d14ab-03e8-47ba-9437-497e64834a0b.jpg');
    res.send();
  },
  //Method called for uploading a image data
  upload: async (req, res) => {
    try {
      const time1 = performance.now();

      if (req.method === 'GET') {
        return res.json({'status': 'GET not allowed'});
      }
      const files = await uploadImages(req.file('imageFile'));
      const time2 = performance.now();
      sails.log.debug(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.status(200).json({files: files});
    } catch (error) {
      console.log(error);
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      return res.status(error.status).json({'Error': error});
    }
  },

  insertImage: async (req, res) => {
    try {
      const time1 = performance.now();

      if (!req.file('image')) {
        return res.status(400).json({success: false, message: 'No image uploaded!'});
      }
      const uploaded = await uploadImages(req.file('image'));
      const newImagePath = '/' + uploaded[0].fd.split(/[\\//]+/).reverse()[0];

      console.log('newImagePath: ', newImagePath);

      const time2 = performance.now();
      sails.log.debug(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.status(200).json({
        success: true,
        path: newImagePath
      });

    } catch (error) {
      console.log('Error occurred!');
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      res.status(400).json({
        success: false,
        message: 'Error occurred while inserting new image in database!'
      });
    }
  },

  deleteImage: async (req, res) => {
    try {
      const time1 = performance.now();

      if (!req.body.oldImagePath) {
        return res.status(400).json({success: false, message: 'No image path was given to delete!'});
      }

      const OLD_IMAGE_PATH = req.body.oldImagePath;

      /** Delete Image from RDS */
      await deleteImageS3(OLD_IMAGE_PATH);

      /** Delete Image from Database */
      if (req.body.id && req.body.tableName && req.body.column) {
        const TABLE_NAME = req.body.tableName;
        const COLUMN_NAME = req.body.column;
        const ROW_ID = req.body.id;
        const FORMAT = req.body.format;

        let findQuery = `
            SELECT ${COLUMN_NAME} as image
            FROM ${TABLE_NAME}
            WHERE id = ${ROW_ID} AND deleted_at IS NULL
         `;
        let rawResult = await sails.sendNativeQuery(findQuery, []);

        console.log('Images from database: ', rawResult.rows[0].image);

        let images = null;

        if (FORMAT && FORMAT === 'JSON') {

          images = JSON.parse(rawResult.rows[0].image);
          if (images) {
            let key;
            for (let v in images) {
              if (images[v] === OLD_IMAGE_PATH) {
                key = v;
              }
            }

            delete images[key];

            if (images) {
              images = JSON.stringify(images);
            }
          }
        }

        let updateQuery = `
            UPDATE ${req.body.tableName}
            SET ${req.body.column} = '${images}'
            WHERE id = ${req.body.id} AND deleted_at IS NULL
        `;
        let updatedResult = await sails.sendNativeQuery(updateQuery, []);
        console.log('updatedResult: ', updatedResult);
      }

      const time2 = performance.now();
      sails.log.debug(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      res.status(200).json({
        success: true,
        message: 'Successfully deleted image'
      });

    } catch (error) {
      console.log('Error occurred in deleting order!', error);
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      res.status(400).json({
        success: false,
        message: error
      });
    }
  }


};



