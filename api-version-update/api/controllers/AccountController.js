const {performance} = require('perf_hooks');
const {uploadImages} = require('../../libs/helper');

module.exports = {
  update: async (req, res) => {
    try {
      const time1 = performance.now();

      let user = await User.updateOne({id: req.param('_id')}).set(req.body);

      const time2 = performance.now();
      sails.log.debug(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.status(200).json(user);
    } catch (error) {
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);
      return res.status(400).json({error});
    }
  },
  updateImage: async (req, res) => {
    try {
      const time1 = performance.now();

      let body = {...req.body};
      const uploaded = await uploadImages(req.file('image'));
      if (uploaded.length === 0) {
        return res.badRequest('No file was uploaded');
      }
      const newPath = uploaded[0].fd.split(/[\\//]+/).reverse()[0];
      body.avatar = '/' + newPath;

      let user = await User.updateOne({id: req.params._id}).set(body);

      const time2 = performance.now();
      sails.log.debug(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.status(200).json(user);

    } catch (error) {
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);
      return res.status(400).json({error});
    }
  }
};
