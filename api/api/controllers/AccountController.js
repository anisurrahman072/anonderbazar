import {
  initLogPlaceholder,
  uploadImgAsync
} from '../../libs';
import {imageUploadConfig} from "../../libs/helper";

module.exports = {
  update: async (req, res) => {
    initLogPlaceholder(req, 'update user account');

    try {
      let user = await User.update({id: req.param('_id')}, req.body);
      return res.status(200).json(user[0]);
    } catch (error) {
      return res.status(400).json({error});
    }
  },
  updateImage: async (req, res) => {
    initLogPlaceholder(req, 'update user avatar');

    try {
      let tempImg = await uploadImgAsync(req.file('image'), imageUploadConfig());
      req.body.avatar = tempImg;

      let user = await User.update({id: req.params._id}, req.body);
      return res.status(200).json(user[0]);

      return res.status(200).json({
        success: true
      });
    } catch (error) {
      return res.status(400).json({error});
    }
  }
};
