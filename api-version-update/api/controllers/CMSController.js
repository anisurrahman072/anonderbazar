const {imageUploadConfig} = require('../../libs/helper');

module.exports = {
  // destroy a row
  destroy: (req, res) => {
    CMS.update({id: req.param('id')}, {deletedAt: new Date()}).exec(
      (err, cms) => {
        if (err) {return res.json(err, 400);}
        return res.json(cms[0]);
      }
    );
  },
  //Method called for creating offer data
  //Model models/CMS.js
  offerInsert: async (req, res) => {
    try {

      if (req.body.hasImage === 'true') {
        let body;
        req.file('image').upload(imageUploadConfig(), async (err, files) => {
          // maxBytes: 10000000;
          if (err) {return res.serverError(err);}
          const newPath = files[0].fd.split(/[\\//]+/).reverse()[0];
          body = req.body;
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

          if (req.body.user_id) {_payload.user_id = req.body.user_id;}

          let data = await CMS.create(_payload);
          return res.json({
            success: true,
            message: 'cms updated successfully',
            data
          });
        });

      } else {
        let data_value = [];

        data_value = [
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

        if (req.body.user_id) {_payload.user_id = req.body.user_id;}

        let data = await CMS.create(_payload);
        return res.json({
          success: true,
          message: 'cms updated successfully',
          data
        });
      }

    } catch (error) {
      res.json({
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
      if (req.body.user_id) {_payload.user_id = req.body.user_id;}

      let data = await CMS.update({id: req.body.id}, req.body);
      return res.json({
        success: true,
        message: 'cms updated successfully',
        data
      });
    } catch (error) {
      res.json({
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
        let body;
        req.file('image').upload(imageUploadConfig(), async (err, files) => {
          // maxBytes: 10000000;
          if (err) {return res.serverError(err);}
          var newPath = files[0].fd.split(/[\\//]+/).reverse()[0];
          body = req.body;
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

          if (req.body.user_id) {_payload.user_id = req.body.user_id;}
          let data = await CMS.update({id: req.body.id}, _payload);
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

        if (req.body.user_id) {_payload.user_id = req.body.user_id;}

        let data = await CMS.update({id: req.body.id}, _payload);
        return res.json({
          success: true,
          message: 'cms updated successfully',
          data
        });
      }
    } catch (error) {
      res.json({
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
      if (req.body.hasImage == 'true') {
        req.file('image').upload(imageUploadConfig(),

          async (err, uploaded) => {
            if (err) {
              return res.json(err.status, {err: err});
            }

            const newPath = uploaded[0].fd.split(/[\\//]+/).reverse()[0];
            if (err) {return res.serverError(err);}

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

            if (req.body.user_id) {_payload.user_id = req.body.user_id;}

            let data = await CMS.create(_payload);
            if (data) {
              return res.json({
                success: true,
                message: 'cms updated successfully',
                data: data
              });
            } else {
              return res.json({
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

        if (req.body.user_id) {_payload.user_id = req.body.user_id;}

        let data = await CMS.create(_payload);
        return res.json({
          success: true,
          message: 'cms updated successfully',
          data
        });
      }
    } catch (error) {
      res.json({
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
      console.log('customPostUpdate', req.body);
      if (req.body.hasImage === 'true') {
        req.file('image').upload(imageUploadConfig(),

          async (err, uploaded) => {
            if (err) {
              return res.json(err.status, {err: err});
            }
            if (err) {return res.serverError(err);}

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

            if (req.body.user_id) {cms.user_id = req.body.user_id;}
            let data = await CMS.update({id: cms.id}, cms);

            if (data) {
              return res.json({
                success: true,
                message: 'cms updated successfully',
                data: data
              });
            } else {
              return res.json({
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
        if (req.body.user_id) {cms.user_id = req.body.user_id;}

        let data = await CMS.update({id: cms.id}, cms);
        return res.json({
          success: true,
          message: 'cms updated successfully',
          data
        });
      }
    } catch (error) {
      console.log('customPostUpdate-error', error);
      res.json({
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

      if (req.body.hasImage == 'true') {
        req.file('image').upload(imageUploadConfig(),

          async (err, uploaded) => {
            if (err) {
              return res.json(err.status, {err: err});
            }
            var newPath = uploaded[0].fd.split(/[\\//]+/).reverse()[0];
            if (err) {return res.serverError(err);}

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

            let data = await CMS.update({id: cms.id}, cms);
            if (data) {
              return res.json({
                success: true,
                message: 'cms updated successfully',
                data: _payload
              });
            } else {
              return res.json({
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
          image: '/images/' + newPath
        });

        let data = await CMS.update({id: cms.id}, cms);
        return res.json({
          success: true,
          message: 'cms updated successfully',
          data
        });
      }
    } catch (error) {
      res.json({
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
      console.log('customUpdate',  req.body);
      let cms = await CMS.findOne({id: req.body.id, deletedAt: null});
      if (req.body.hasImage === 'true') {
        req.file('image').upload(imageUploadConfig(),
          async (err, uploaded) => {
            if (err) {
              return res.json(err.status, {err: err});
            }
            var newPath = uploaded[0].fd.split(/[\\//]+/).reverse()[0];
            if (err) {return res.serverError(err);}

            cms.data_value[req.body.dataValueId] = {
              title: req.body.title,
              description: req.body.description,
              image: '/' + newPath
            };

            let data = await CMS.update({id: cms.id}, cms);
            if (data) {
              return res.json({
                success: true,
                message: 'cms updated successfully',
                data: cms.data_value[req.body.dataValueId]
              });
            } else {
              return res.json({
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

        let data = await CMS.update({id: cms.id}, cms);
        if (data) {
          return res.json({
            success: true,
            message: 'cms updated successfully',
            data: cms.data_value[req.body.dataValueId]
          });
        } else {
          return res.json({success: false, message: 'cms updated failed'});
        }
      }
    } catch (error) {
      res.json({
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

      let data = await CMS.update({id: cms.id}, cms);

      return res.json({
        success: true,
        message: 'cms element deleted successfully',
        data
      });
    } catch (error) {
      res.json({
        success: false,
        message: 'Error Occurred',
        error
      });
    }
  }
};
