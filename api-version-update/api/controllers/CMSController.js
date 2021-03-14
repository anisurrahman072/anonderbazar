/**
 * CMSController
 *
 * @description :: Server-side logic for managing categories
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const {uploadImages} = require('../../libs/helper');
const {imageUploadConfig} = require('../../libs/helper');

module.exports = {
  byIds: async (req, res) => {
    try {
      req.query.ids = JSON.parse(req.query.ids);
      console.log(req.query);

      if (req.query.ids && Array.isArray(req.query.ids) && req.query.ids.length > 0) {
        let cmses = await CMS.find({
          id: req.query.ids,
          deletedAt: null
        });
        return res.status(200).json(cmses);
      }

      return res.status(422).json({
        success: false,
        message: 'Invalid'
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error
      });
    }
  },
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
      let body = req.body;
      if (body.hasImage === 'true') {

        const files = await uploadImages(req.file('image'));
        if (files.length === 0) {
          return res.badRequest('No file was uploaded');
        }
        const newPath = files[0].fd.split(/[\\//]+/).reverse()[0];

        body.image = '/' + newPath;
        let data_value = [];

        if (body.subsection === 'OFFER') {
          data_value = [
            {
              title: body.title,
              description: body.description,
              image: body.image,
              link: body.link,
              offers: [],
              products: [],
            }
          ];
        } else {
          data_value = [
            {
              title: body.title,
              description: body.description,
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

        if (body.user_id) {
          _payload.user_id = body.user_id;
        }
        let data = await CMS.updateOne({id: body.id}).set(_payload);
        return res.status(201).json({
          success: true,
          message: 'cms updated successfully',
          data
        });
      } else {
        let data_value = [];
        if (body.subsection === 'OFFER') {
          data_value = [
            {
              title: body.title,
              description: body.description,
              link: body.link,
              offers: [],
              products: [],
            }
          ];
        } else {
          data_value = [
            {
              title: body.title,
              description: body.description,
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

        if (body.user_id) {
          _payload.user_id = body.user_id;
        }

        let data = await CMS.updateOne({id: body.id}).set(_payload);
        return res.status(201).json({
          success: true,
          message: 'cms updated successfully',
          data
        });
      }
    } catch (error) {
      console.log(error);
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
        const uploaded = await uploadImages(req.file('image'));

        if (uploaded.length === 0) {
          return res.badRequest('No image was uploaded');
        }

        const newPath = uploaded[0].fd.split(/[\\//]+/).reverse()[0];
        const dataValueIndex = parseInt(req.body.dataValueId);

        let dataValue = cms.data_value;
        if (!dataValue) {
          dataValue = [];
        }

        dataValue[dataValueIndex] = {
          title: req.body.title,
          description: req.body.description,
          image: '/' + newPath
        };

        let data = await CMS.updateOne({id: cms.id}).set({data_value: dataValue});

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
      } else {

        const dataValueIndex = parseInt(req.body.dataValueId);

        let dataValue = cms.data_value;
        if (!dataValue) {
          dataValue = [];
        }

        dataValue[dataValueIndex] = {
          title: req.body.title,
          description: req.body.description,
          image: req.body.image
        };

        let data = await CMS.updateOne({id: cms.id}).set({data_value: dataValue});
        return res.json({
          success: true,
          message: 'cms updated successfully',
          data
        });
      }
    } catch (error) {
      console.log('customPostUpdate-error: ', error);
      res.status(error.status).json({
        success: false,
        message: 'Error Occurred',
        error: error
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

          let data = await CMS.updateOne({id: cms.id}).set(req.body);

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

      let cms = await CMS.findOne({id: req.body.id, deletedAt: null});

      if (req.body.hasImage === 'true') {
        const uploaded = await uploadImages(req.file('image'));
        if (uploaded.length === 0) {
          return res.badRequest('No file was uploaded');
        }
        const newPath = uploaded[0].fd.split(/[\\//]+/).reverse()[0];
        const dataValueIndex = parseInt(req.body.dataValueId);

        let dataValue = cms.data_value;
        if (!dataValue) {
          dataValue = [];
        }
        dataValue[dataValueIndex] = {
          title: req.body.title,
          description: req.body.description,
          image: '/' + newPath
        };

        // cms.data_value = JSON.stringify(cms.data_value);
        let data = await CMS.updateOne({id: cms.id}).set({
          data_value: dataValue
        });

        if (data) {
          return res.json({
            success: true,
            message: 'cms updated successfully',
            data: cms.data_value[dataValueIndex]
          });
        } else {
          return res.json(400, {
            success: false,
            message: 'cms updated failed'
          });
        }

      } else {
        const dataValueIndex = parseInt(req.body.dataValueId);
        if (!cms.data_value) {
          cms.data_value = [];
        }
        cms.data_value[dataValueIndex] = {
          title: req.body.title,
          description: req.body.description,
          image: cms.data_value[dataValueIndex].image
        };
        cms.data_value = JSON.stringify(cms.data_value);
        let data = await CMS.updateOne({id: cms.id}).set(cms);
        if (data) {
          return res.status(201).json({
            success: true,
            message: 'cms updated successfully',
            data: cms.data_value[dataValueIndex]
          });
        } else {
          return res.status(400).json({success: false, message: 'cms updated failed'});
        }
      }
    } catch (error) {
      console.log(error);
      res.status(400).json({
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
