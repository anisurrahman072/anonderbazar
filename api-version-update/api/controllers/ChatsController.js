/**
 * ChatsController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const {performance} = require('perf_hooks');

module.exports = {
  //Method called for getting chat users data
  //Model models/Chat.js
  getUsers: function (req, res) {
    const time1 = performance.now();

    Chat.find()
      .where({ warehouse_id: req.query.warehouse_id, deletedAt: null })
      .then((chatUsers) => {

        const time2 = performance.now();
        sails.log.debug(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

        res.json(200, chatUsers);
      });
  },
  //Method called for getting chat messages data
  //Model models/Chat.js
  getAllMessages: async function (req, res) {
    const time1 = performance.now();

    let _where = {};
    _where.deletedAt = null;
    if (req.query.chat_user_id) {
      _where.chat_user_id = req.query.chat_user_id;
    }
    let chats = await Chat.find({
      where: _where
    }).populate('chat_user_id');

    let allChats = await Promise.all(
      chats.map(async item => {
        item.files = await ChatFile.find({
          deletedAt: null,
          chat_id: item.id
        });
        return item;
      })
    );

    const time2 = performance.now();
    sails.log.debug(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

    return res.status(200).json({
      success: true,
      message: 'get product in search',
      data: allChats,
    });
  },
};

