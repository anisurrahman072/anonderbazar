/**
 * CMSController
 *
 * @description :: Server-side logic for managing categories
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const {imageUploadConfig} = require('../../libs/helper');

module.exports = {
  // destroy a row
  destroy: async (req, res) => {
    try {
      const cms = await CMS.updateOne({id: req.param('id')}).set({deletedAt: new Date()});
      return res.status(201).json(cms);
    } catch (error) {
      console.log(error);
      res.json(400, {message: 'Something went wrong!', error});
    }
  },
  //Method called for creating offer data
  //Model models/CMS.js
  offerInsert: async (req, res) => {
    try {

      if (req.body.hasImage === 'true') {
        let body = req.body;
        req.file('image').upload(imageUploadConfig(), async (err, files) => {

          if (err) {
            return res.serverError(err);
          }

          if (files.length === 0) {
            return res.badRequest('No image was uploaded');
          }

          const newPath = files[0].fd.split(/[\\//]+/).reverse()[0];

          body.image = '/' + newPath;
          let data_value = [];

          if (body.subsection === 'OFFER') {
            data_value = [
              {
                title: req.body.title,
                description: req.body.description,
                image: body.image,
                link: body.link,
                offers: [],
                products: [],
              }
            ];
          } else {
            data_value = [
              {
                title: req.body.title,
                description: req.body.description,
                offers: [],
                products: [],
              }
            ];
          }

          let _payload = {
            page: 'POST',
            section: 'HOME',
            sub_section: body.subsection,
            data_value: data_value
          };

          if (req.body.user_id) {
            _payload.user_id = req.body.user_id;
          }

          let data = await CMS.create(_payload).fetch();
          return res.json({
            success: true,
            message: 'cms updated successfully',
            data
          });
        });

      } else {
        let data_value = [
          {
            title: req.body.title,
            description: req.body.description,
            offers: [],
            products: [],
          }
        ];

        let _payload = {
          page: 'POST',
          section: 'HOME',
          sub_section: req.body.subsection,
          data_value: data_value
        };

        if (req.body.user_id) {
          _payload.user_id = req.body.user_id;
        }

        let data = await CMS.create(_payload).fetch();

        return res.json({
          success: true,
          message: 'cms updated successfully',
          data
        });
      }

    } catch (error) {
      return res.json(400, {
        success: false,
        message: 'Error Occurred',
        error
      });
    }
  },
  //Method called for updating product offer data
  //Model models/CMS.js
  offerProductUpdate: async (req, res) => {
    try {
      let data = await CMS.updateOne({id: req.body.id}).set(req.body);
      return res.json({
        success: true,
        message: 'cms updated successfully',
        data
      });
    } catch (error) {
      return res.json(400, {
        success: false,
        message: 'Error Occurred',
        error
      });
    }
  },

  //Method called for updating child offer data
  //Model models/CMS.js
  updateOffer: async (req, res) => {
    try {
      if (req.body.hasImage === 'true') {
        let body = req.body;
        req.file('image').upload(imageUploadConfig(), async (err, files) => {

          if (err) {
            return res.serverError(err);
          }

          if (files.length === 0) {
            return res.badRequest('No file was uploaded');
          }

          const newPath = files[0].fd.split(/[\\//]+/).reverse()[0];

          body.image = '/' + newPath;
          let data_value = [];

          if (req.body.subsection === 'OFFER') {
            data_value = [
              {
                title: req.body.title,
                description: req.body.description,
                image: body.image,
                link: body.link,
                offers: [],
                products: [],
              }
            ];
          } else {
            data_value = [
              {
                title: req.body.title,
                description: req.body.description,
                offers: [],
                products: [],
              }
            ];
          }

          let _payload = {
            page: 'POST',
            section: 'HOME',
            sub_section: req.body.subsection,
            data_value: data_value
          };

          if (req.body.user_id) {
            _payload.user_id = req.body.user_id;
          }
          let data = await CMS.updateOne({id: req.body.id}).set(_payload);
          return res.json({
            success: true,
            message: 'cms updated successfully',
            data
          });
        });

      } else {
        let data_value = [];
        if (req.body.subsection === 'OFFER') {
          data_value = [
            {
              title: req.body.title,
              description: req.body.description,
              link: req.body.link,
              offers: [],
              products: [],
            }
          ];
        } else {
          data_value = [
            {
              title: req.body.title,
              description: req.body.description,
              offers: [],
              products: [],
            }
          ];
        }

        let _payload = {
          page: 'POST',
          section: 'HOME',
          sub_section: req.body.subsection,
          data_value: data_value
        };

        if (req.body.user_id) {
          _payload.user_id = req.body.user_id;
        }

        let data = await CMS.updateOne({id: req.body.id}).set(_payload);
        return res.json({
          success: true,
          message: 'cms updated successfully',
          data
        });
      }
    } catch (error) {
      res.json(400, {
        success: false,
        message: 'Error Occurred',
        error
      });
    }
  },

  //Method called for creating post data
  //Model models/CMS.js
  customPostInsert: async (req, res) => {
    try {
      if (req.body.hasImage === 'true') {
        req.file('image').upload(imageUploadConfig(), async (err, uploaded) => {
          if (err) {
            return res.json(err.status, {err: err});
          }
          if (uploaded.length === 0) {
            return res.badRequest('No file was uploaded');
          }
          const newPath = uploaded[0].fd.split(/[\\//]+/).reverse()[0];
          let data_value = [
            {
              title: req.body.title,
              description: req.body.description,
              slug: (req.body.title.toLowerCase()).replace(' ', '_'),
              image: '/' + newPath
            }
          ];

          let _payload = {
            page: 'POST',
            section: req.body.section,
            sub_section: req.body.sub_section,
            data_value: data_value
          };

          if (req.body.user_id) {
            _payload.user_id = req.body.user_id;
          }

          let data = await CMS.create(_payload).fetch();
          if (data) {
            return res.json({
              success: true,
              message: 'cms updated successfully',
              data: data
            });
          } else {
            return res.json(400, {
              success: false,
              message: 'cms updated failed'
            });
          }
        }
        );
      } else {
        let data_value = [
          {
            title: req.body.title,
            description: req.body.description
          }
        ];

        let _payload = {
          page: 'POST',
          section: req.body.section,
          sub_section: req.body.sub_section,
          data_value: data_value
        };

        if (req.body.user_id) {
          _payload.user_id = req.body.user_id;
        }

        let data = await CMS.create(_payload).fetch();
        return res.json({
          success: true,
          message: 'cms updated successfully',
          data
        });
      }
    } catch (error) {
      res.json(400, {
        success: false,
        message: 'Error Occurred',
        error
      });
    }
  },

  //Method called for updating post data
  //Model models/CMS.js

  customPostUpdate: async (req, res) => {
    try {
      let cms = await CMS.findOne({id: req.body.id, deletedAt: null});

      if (req.body.hasImage === 'true') {
        req.file('image').upload(imageUploadConfig(), async (err, uploaded) => {
          if (err) {
            return res.json(err.status, {err: err});
          }
          if (uploaded.length === 0) {
            return res.badRequest('No image was uploaded');
          }

          const newPath = uploaded[0].fd.split(/[\\//]+/).reverse()[0];

          let data_value = [
            {
              title: req.body.title,
              description: req.body.description,
              category_id: req.body.category_id,
              lowerlimit: req.body.lowerlimit,
              upperlimit: req.body.upperlimit,
              image: '/' + newPath
            }
          ];

          cms.section = req.body.section;
          cms.sub_section = req.body.sub_section;
          cms.data_value = data_value;

          if (req.body.user_id) {
            cms.user_id = req.body.user_id;
          }

          let data = await CMS.updateOne({id: cms.id}).set(cms);

          if (data) {
            return res.json({
              success: true,
              message: 'cms updated successfully',
              data: data
            });
          } else {
            return res.json(400, {
              success: false,
              message: 'cms updated failed'
            });
          }
        }
        );
      } else {
        let data_value = [
          {
            title: req.body.title,
            description: req.body.description,
            category_id: req.body.category_id,
            lowerlimit: req.body.lowerlimit,
            upperlimit: req.body.upperlimit,
            image: req.body.image
          }
        ];

        cms.section = req.body.section;
        cms.sub_section = req.body.sub_section;
        cms.data_value = data_value;
        if (req.body.user_id) {
          cms.user_id = req.body.user_id;
        }

        let data = await CMS.updateOne({id: cms.id}).set(cms);
        return res.json({
          success: true,
          message: 'cms updated successfully',
          data
        });
      }
    } catch (error) {
      console.log('customPostUpdate-error', error);
      res.json(400, {
        success: false,
        message: 'Error Occurred',
        error
      });
    }
  },

  //Method called for creating cms post data
  //Model models/CMS.js
  customInsert: async (req, res) => {
    try {
      let cms = await CMS.findOne({id: req.body.id, deletedAt: null});

      if (req.body.hasImage === 'true') {
        req.file('image').upload(imageUploadConfig(), async (err, uploaded) => {
          if (err) {
            return res.json(err.status, {err: err});
          }
          if (uploaded.length === 0) {
            return res.badRequest('No file was uploaded');
          }
          const newPath = uploaded[0].fd.split(/[\\//]+/).reverse()[0];

          cms.data_value[req.body.dataValueId] = {
            title: req.body.title,
            description: req.body.description,
            image: '/' + newPath
          };

          let _payload = {
            title: req.body.title,
            description: req.body.description,
            image: '/' + newPath
          };

          cms.data_value.push(_payload);

          let data = await CMS.updateOne({id: cms.id}).set(cms);

          if (data) {
            return res.json({
              success: true,
              message: 'cms updated successfully',
              data: _payload
            });
          } else {
            return res.json(400, {
              success: false,
              message: 'cms updated failed'
            });
          }
        }
        );
      } else {
        cms.data_value.push({
          title: req.body.title,
          description: req.body.description,
          image: null
        });

        let data = await CMS.updateOne({id: cms.id}).set(cms);
        return res.json({
          success: true,
          message: 'cms updated successfully',
          data
        });
      }
    } catch (error) {
      res.json(400, {
        success: false,
        message: 'Error Occurred',
        error
      });
    }
  },
  //Method called for updating cms post data
  //Model models/CMS.js
  customUpdate: async (req, res) => {
    try {
      console.log('customUpdate', req.body);
      let cms = await CMS.findOne({id: req.body.id, deletedAt: null});
      if (req.body.hasImage === 'true') {
        req.file('image').upload(imageUploadConfig(), async (err, uploaded) => {
          if (err) {
            return res.json(err.status, {err: err});
          }
          if (uploaded.length === 0) {
            return res.badRequest('No file was uploaded');
          }
          const newPath = uploaded[0].fd.split(/[\\//]+/).reverse()[0];

          cms.data_value[req.body.dataValueId] = {
            title: req.body.title,
            description: req.body.description,
            image: '/' + newPath
          };

          let data = await CMS.updateOne({id: cms.id}).set(cms);
          if (data) {
            return res.json({
              success: true,
              message: 'cms updated successfully',
              data: cms.data_value[req.body.dataValueId]
            });
          } else {
            return res.json(400, {
              success: false,
              message: 'cms updated failed'
            });
          }
        }
        );
      } else {
        cms.data_value[req.body.dataValueId] = {
          title: req.body.title,
          description: req.body.description,
          image: cms.data_value[req.body.dataValueId].image
        };

        let data = await CMS.updateOne({id: cms.id}).set(cms);
        if (data) {
          return res.json({
            success: true,
            message: 'cms updated successfully',
            data: cms.data_value[req.body.dataValueId]
          });
        } else {
          return res.json(400, {success: false, message: 'cms updated failed'});
        }
      }
    } catch (error) {
      res.json(400, {
        success: false,
        message: 'Error Occurred',
        error
      });
    }
  },
  //Method called for deleting cms post data
  //Model models/CMS.js
  customDelete: async (req, res) => {
    try {
      let cms = await CMS.findOne({id: req.body.id, deletedAt: null});

      cms.data_value.splice(req.body.carouselId, 1);

      let data = await CMS.updateOne({id: cms.id}).set(cms);

      return res.json({
        success: true,
        message: 'cms element deleted successfully',
        data
      });
    } catch (error) {
      res.json(400, {
        success: false,
        message: 'Error Occurred',
        error
      });
    }
  }
};
