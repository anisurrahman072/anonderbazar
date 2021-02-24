/**
 * ChatuserController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const { Helper, asyncForEach, initLogPlaceholder, pagination } = require('../../libs');

module.exports = {
  //Method called for creating chat user data
  //Model models/ChatUser.js
  create: async (req, res) => {
    initLogPlaceholder(req, 'chat Service create');
    async function create(body) {
      try {
        let data = await ChatUser.create(body);

        if (data) {
          return res.json(200, data);
        } else {
          return res.status(400).json({ success: false });
        }
      } catch (error) {
        return res.status(400).json({ success: false });
      }
    }
    if (req.body) {
      req.body.status = 1;
    }
    create(req.body);
  },
  //Method called for getting chat notification data
  //Model models/ChatUser.js
  getNotification: async function (req, res) {
    let total = 0;
    try {

      let _where = {};
      _where.deletedAt = null;
      if (req.query.warehouse_id) {
        _where.warehouse_id = req.query.warehouse_id;
      }
      let chats = await ChatUser.find({
        where: _where
      }).populate('product_id', { deletedAt: null })
      .populate('user_id', { deletedAt: null })
      .populate('warehouse_id', { deletedAt: null });



      let allChats = await Promise.all(
        chats.map(async item => {
          item.messages = await Chat.find({
            deletedAt: null,
            notification_view_status:1,
            chat_user_id: item.id
          });
          total+=item.messages.length;
          return item;

        })
      );
      return res.status(200).json({
        success: true,
        message: 'get chat in search',
        totalnotification:total,
        data: allChats,
      });
    } catch (error) {
      let message = 'Error in Get All Chats';
      res.status(400).json({
        success: false,
        message
      });
    }

  },
};
