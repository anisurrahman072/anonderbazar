/**
 * ChatsController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  //Method called for getting chat users data
  //Model models/Chat.js
  getUsers: function (req, res) {
    Chat.find()
      .where({ warehouse_id: req.query.warehouse_id, deletedAt: null })
      .then(function (chatUsers) {
        res.json(200, chatUsers);
      });
  },
  //Method called for getting chat messages data
  //Model models/Chat.js
  getAllMessages: async function (req, res) {
    let _where = {};
    _where.deletedAt = null;
    if (req.query.chat_user_id) {
      _where.chat_user_id = req.query.chat_user_id;
    }
    let chats = await Chat.find({
      where: _where
    }).populate('chat_user_id',{deletedAt: null});

    let allChats = await Promise.all(
      chats.map(async item => {
        item.files = await ChatFile.find({
          deletedAt: null,
          chat_id: item.id
        });
        return item;
      })
    );
    return res.status(200).json({
      success: true,
      message: 'get product in search',
      data: allChats,
    });
  },
};

