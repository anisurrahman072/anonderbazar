module.exports = {
  destroy: async (req, res) => {
    try {
      const user = await Area.updateOne({id: req.param('id')}).set({deletedAt: new Date()});

      return res.json(200, user);

    } catch (error) {
      console.log(error);
      res.json(400, {success: false, message: 'Something went wrong!', error});
    }
  }
};

