/**
 * InvestorController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const {pagination} = require('../../libs/pagination');

module.exports = {
  registerInvestor: async (req, res) => {
    try{
      let data = req.body;
      let newInvestor = await Investor.create({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone
      }).fetch();
      return res.status(200).json({
        success: true,
        message: 'Successfully registered for investor',
        data: newInvestor
      });
    }
    catch (error){
      return res.status(400).json({
        success: false,
        message: 'Error occurred while registered for investor',
        error
      });
    }
  },

  getAllInvestor: async (req, res) => {
    try {
      let params = req.allParams();
      let paginate = pagination(params);

      let _where = {};
      _where.deletedAt = null;
      if(params.status !== ''){
        _where.status = params.status;
      }

      let totalInvestor = await Investor.count({
        where: _where
      });

      let allInvestor = await Investor.find({
        where: _where
      }).limit(paginate.limit).skip(paginate.skip);

      return res.status(200).json({
        success: true,
        message: 'Successfully fetched all investors',
        data: allInvestor,
        total: totalInvestor
      });
    }
    catch (error){
      return res.status(400).json({
        success: false,
        message: 'Error occurred while fetched all investors',
        error
      });

    }
  },

  updateInvestorStatus: async (req, res) => {
    try {
      let data = req.body;

      let updatedInvestor = await Investor.updateOne({
        id: data.id
      }).set({
        status: data.status
      });

      return res.status(200).json({
        success: true,
        message: 'Successfully updated status of Investor',
        data: updatedInvestor
      });
    }
    catch (error){
      return res.status(400).json({
        success: false,
        message: 'Error occurred while updating status of Investor',
        error
      });
    }
  }
};

