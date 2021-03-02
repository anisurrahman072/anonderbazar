/**
 * BrandController
 *
 * @description :: Server-side logic for managing brands
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const {uploadImagesWithConfig} = require('../../libs/helper');

module.exports = {

  // destroy a row
  destroy: async (req, res) => {
    try {
      const genre = await Genre.updateOne({id: req.param('id')}).set({deletedAt: new Date()});
      return res.status(200).json({genre: genre});
    } catch (error) {
      console.log(error);
      res.status(error.status).json({error: error});
    }
  },
  //Method called for creating a genre data
  //Model models/Genre.js
  create: async (req, res) => {
    try {
      if (req.body.hasImage === 'true') {
        const uploaded = await uploadImagesWithConfig(req.file('image'), {saveAs: Date.now() + '_genre.jpg'});
        if (uploaded.length === 0) {
          return res.badRequest('No files were uploaded');
        }
        let newPath = uploaded[0].fd.split(/[\\//]+/).reverse()[0];
        req.body.image = '/' + newPath;
      }
      const genre = await Genre.create(req.body).fetch();
      return res.status(200).json({genre: genre});
    } catch (error) {
      console.log(error);
      res.status(error.status).json({error: error});
    }
  },

  //Method called for updating a genre data
  //Model models/Genre.js
  update: async (req, res) => {
    try {
      if (req.body.hasImage === 'true') {
        const uploaded = await uploadImages(req.file('image'));
        if (uploaded.length === 0) {
          return res.badRequest('No file was uploaded');
        }
        let newPath = uploaded[0].fd.split(/[\\//]+/).reverse()[0];
        req.body.image = '/' + newPath;
      }

      const genreUpdated = await Genre.updateOne({id: req.param('id')}).set(req.body);
      return res.status(200).json({
        genre: genreUpdated,
        token: jwToken.issue({id: genreUpdated.id})
      });
    } catch (error) {
      console.log(error);
      return res.json(error.status, {error: error});
    }
  }
};

