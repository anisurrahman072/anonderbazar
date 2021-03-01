const {uploadImages} = require('../../libs/helper');

module.exports = {
  update: async (req, res) => {
    try {
      let user = await User.updateOne({id: req.param('_id')}).set(req.body);
      return res.status(200).json(user);
    } catch (error) {
      return res.status(400).json({error});
    }
  },
  updateImage: async (req, res) => {
    try {

      let body = {...req.body};
      const uploaded = await uploadImages(req.file('image'));
      if (uploaded.length === 0) {
        return res.badRequest('No file was uploaded');
      }
      const newPath = uploaded[0].fd.split(/[\\//]+/).reverse()[0];
      body.avatar = '/' + newPath;

      let user = await User.updateOne({id: req.params._id}).set(body);
      return res.status(200).json(user);

    } catch (error) {
      return res.status(400).json({error});
    }
  }
};
