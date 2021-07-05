/**
 * ImageController
 *
 * @description :: Server-side logic for managing images
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const {uploadImages, deleteImageS3} = require('../../libs/helper');
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
  },

  insertImage: async (req, res) => {
    try {
      if (!req.file('image')) {
        return res.status(400).json({success: false, message: 'No image uploaded!'});
      }
      const uploaded = await uploadImages(req.file('image'));
      const newImagePath = '/' + uploaded[0].fd.split(/[\\//]+/).reverse()[0];

      if (req.body.oldImagePath) {
        /** Update section */
        const ROW_ID = req.body.id;
        const TABLE_NAME = req.body.tableName;
        const COLUMN_NAME = req.body.column;
        const OLD_IMAGE_PATH = req.body.oldImagePath;

        await deleteImageS3(OLD_IMAGE_PATH);



        let query = `
        UPDATE ${TABLE_NAME}
        SET ${COLUMN_NAME} = ${newImagePath}
        WHERE id = ${ROW_ID} AND deleted_at IS NULL
      `;
        await sails.sendNativeQuery(query, []);
      }

      return res.status(200).json({
        success: true,
        path: newImagePath
      });

    } catch (error) {
      console.log('Error occurred!');
      res.status(400).json({
        success: false,
        message: 'Error occurred while inserting new image in database!'
      });
    }
  },

  deleteImage: async (req, res) => {
    console.log('ttttttttt');
    try {
      if(!req.body.oldImagePath){
        return res.status(400).json({success: false, message: 'No image path was given to delete!'});
      }

      const OLD_IMAGE_PATH = req.body.oldImagePath;

      await deleteImageS3(OLD_IMAGE_PATH);

      if(req.body.id && req.body.tableName && req.body.column && req.body.format){
        /** Update section */
        const TABLE_NAME = req.body.tableName;
        const COLUMN_NAME = req.body.column;
        const ROW_ID = req.body.id;
        const FORMAT = req.body.format;
        console.log('tt: ',OLD_IMAGE_PATH, TABLE_NAME, COLUMN_NAME,  ROW_ID, FORMAT);

        if(FORMAT === 'JSON'){
          let findQuery = `
            SELECT ${COLUMN_NAME}
            FROM ${TABLE_NAME}
            WHERE id = ${ROW_ID} AND deleted_at IS NULL
          `;

          let rawResult = await sails.sendNativeQuery(findQuery, []);
          let images = rawResult.rows;

          console.log('Annnntttyy: ', images);
        }
        /*let query = `
        UPDATE ${req.body.tableName}
        SET ${req.body.column} = ''
        WHERE id = ${req.body.id} AND deleted_at IS NULL
      `;
        await sails.sendNativeQuery(query, []);*/
      }

    } catch (error) {
      console.log('Error occurred in deleting order!');
      res.status(400).json({
        success: false,
        message: 'Error occurred while inserting new image in database!'
      });
    }
  }


};



