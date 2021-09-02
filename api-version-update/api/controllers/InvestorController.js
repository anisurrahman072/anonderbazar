/**
 * InvestorController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const {performance} = require('perf_hooks');

const {pagination} = require('../../libs/pagination');
const {NOT_VERIFIED_INVESTOR_OTP_STATUS, VERIFIED_INVESTOR_OTP_STATUS, EXPIRED_INVESTOR_OTP_STATUS} = require('../../libs/constants');
const moment = require('moment');
const ___ = require('lodash');
const Promise = require('bluebird');

module.exports = {
  generateOtp: async (req, res) => {
    try{
      const time1 = performance.now();

      let otp = '';
      const allChars = '0123456789';
      for (let i = 0; i < 6; i++) {
        otp += allChars.charAt(Math.floor(Math.random() * allChars.length));
      }

      let newOtp = await InvestorOTP.create({
        phone: req.body.phone,
        otp: otp,
        status: NOT_VERIFIED_INVESTOR_OTP_STATUS
      }).fetch();

      if(newOtp){
        let smsText = `Your OTP for investor registration ${newOtp.otp}`;
        let smsPhone = newOtp.phone;
        try {
          SmsService.sendingOneSmsToOne([smsPhone], smsText);
        }
        catch (error){
          throw new Error('SMS not send');
        }
      }
      else {
        return res.status(400).json({
          success: false,
          message: 'Error occurred while generating OTP for investor',
          error
        });
      }

      const time2 = performance.now();
      sails.log.debug(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.status(200).json({
        success: true,
        message: 'Successfully created the OTP for the given phone number',
        otpData: newOtp
      });
    }
    catch (error){
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      return res.status(400).json({
        success: false,
        message: 'Error occurred while generating OTP for investor',
        error
      });
    }
  },

  verifyOTP: async (req, res) => {
    try {
      const time1 = performance.now();

      let otpInfo = await InvestorOTP.findOne({
        phone: req.body.phone,
        status: NOT_VERIFIED_INVESTOR_OTP_STATUS,
        otp: req.body.otp,
        deletedAt: null
      });

      console.log('otpInfo: ', otpInfo);

      if(otpInfo){
        await InvestorOTP.updateOne({ id: otpInfo.id }, {status: VERIFIED_INVESTOR_OTP_STATUS});
      }
      else {
        return res.status(400).json({
          code: 'wrong',
          success: false,
          message: 'OTP not found!'
        });
      }

      let allowedUpTo = moment(otpInfo.createdAt, 'YYYY-MM-DD HH:mm:ss').add(5, 'minutes');
      const currentDate = moment();
      if(allowedUpTo.isBefore(currentDate)){
        await InvestorOTP.updateOne({ id: otpInfo.id }, {status: EXPIRED_INVESTOR_OTP_STATUS});
        return res.status(400).json({
          code: 'Expired',
          success: false,
          message: 'OTP verification time has been expired!'
        });
      }

      const time2 = performance.now();
      sails.log.debug(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.status(200).json({
        success: true,
        message: 'Successfully verified OTP'
      });

    }
    catch (error){
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      return res.status(400).json({
        success: false,
        message: 'Error occurred while OTP verification',
        error
      });
    }
  },

  registerInvestor: async (req, res) => {
    try{
      const time1 = performance.now();

      let data = req.body;

      const investorQuery = Promise.promisify(Investor.getDatastore().sendNativeQuery);
      let query = ` select * from investors ORDER BY id DESC LIMIT 1 `;
      const rawResult = await investorQuery(query, []);

      const lockingQuery = ` select * from investors WHERE id = ${rawResult.rows[0].id} FOR UPDATE `;
      await investorQuery(lockingQuery, []);

      let code = ++rawResult.rows[0].id + '';
      code = ___.padStart(code, 5, '0');
      code = 'ABI' + code;

      let newInvestor = await Investor.create({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        investor_code: code
      }).fetch();

      console.log('new investor: ', newInvestor);

      if(newInvestor){
        let smsText = `Your registration for investor at Anonderbazar has been received. Your ID is ${newInvestor.investor_code}`;
        let smsPhone = newInvestor.phone;
        try{
          SmsService.sendingOneSmsToOne([smsPhone], smsText);
        }
        catch (error){
          console.log('error in sms:', error);
          sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

          // throw new Error('Error occurred while sending sms');
        }

        try {
          EmailService.investorMail(newInvestor);
        }
        catch (error){
          console.log('error in email:', error);
          sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

          // throw new Error('Error occurred while sending email');
        }
      }

      const time2 = performance.now();
      sails.log.debug(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.status(200).json({
        success: true,
        message: 'Successfully registered for investor',
        data: newInvestor
      });
    }
    catch (error){
      console.log(error);
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      return res.status(400).json({
        success: false,
        message: 'Error occurred while registered for investor',
        error
      });
    }
  },

  getAllInvestor: async (req, res) => {
    try {
      const time1 = performance.now();

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

      const time2 = performance.now();
      sails.log.debug(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.status(200).json({
        success: true,
        message: 'Successfully fetched all investors',
        data: allInvestor,
        total: totalInvestor
      });
    }
    catch (error){
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      return res.status(400).json({
        success: false,
        message: 'Error occurred while fetched all investors',
        error
      });

    }
  },

  updateInvestorStatus: async (req, res) => {
    try {
      const time1 = performance.now();

      let data = req.body;

      let updatedInvestor = await Investor.updateOne({
        id: data.id
      }).set({
        status: data.status
      });

      const time2 = performance.now();
      sails.log.debug(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.status(200).json({
        success: true,
        message: 'Successfully updated status of Investor',
        data: updatedInvestor
      });
    }
    catch (error){
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      return res.status(400).json({
        success: false,
        message: 'Error occurred while updating status of Investor',
        error
      });
    }
  }
};

