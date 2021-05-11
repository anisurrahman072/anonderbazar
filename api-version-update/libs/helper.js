const fetch = require('node-fetch');
const {devEnv, bKash, dhakaZilaId} = require('../config/softbd');
const AbortController = require('node-abort-controller');
const _ = require('lodash');

exports.bKashModeConfigKey = function () {
  let bKashModeConfigKey = 'production';
  if (bKash.isSandboxMode) {
    bKashModeConfigKey = 'sandbox';
  }
  return bKashModeConfigKey;
};

exports.fetchWithTimeout = async function (resource, options) {
  const {timeout = 30000} = options;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  const response = await fetch(resource, {
    ...options,
    signal: controller.signal
  });
  clearTimeout(id);

  return response;
};

const asyncForEach = async (array, callback) => {
  if (array && Array.isArray(array) && array.length > 0) {
    for (let index = 0; index < array.length; index++) {
      // eslint-disable-next-line callback-return
      await callback(array[index], index, array);
    }
  }
};
exports.asyncForEach = asyncForEach;

exports.initLogPlaceholder = (req, funcName) => {
  sails.log(`call from ${funcName}`);
  sails.log('query ========>', req.query);
  sails.log('params =======>', req.params);
  sails.log('body =========>', req.body);
};

exports.baseFilter = (reqBody, Model, localWhere) => {

  const where = localWhere ? localWhere : {};
  where.deletedAt = null;
  const modelAttributes = Object.keys(Model.definition);

  modelAttributes.map((attr) => {
    if (reqBody[attr]) {
      where[attr] = reqBody[attr];
    }
  });
  return where;
};

exports.calcCartTotal = function (cart, cartItems) {
  let grandOrderTotal = 0;
  let totalQty = 0;
  cartItems.forEach((cartItem) => {
    if (cartItem.product_id && cartItem.product_id.id && cartItem.product_quantity > 0) {
      grandOrderTotal += cartItem.product_total_price;
      totalQty += cartItem.product_quantity;
    }
  });
  return {
    grandOrderTotal,
    totalQty
  };
};

exports.escapeExcel = function (str) {
  if (!str) {
    return '';
  }
  return str.replace(/[&]/g, 'and').replace(/['"]/g, '').replace('-', ' ').replace(/\s+/g, ' ');
};

const imageUploadConfig = function () {

  if (devEnv) {
    return {
      maxBytes: 10000000,
      dirname: sails.config.appPath + '/.tmp/public',
    };
  }
  return {
    adapter: require('skipper-s3'),
    key: 'AKIATYQRUSGN2DDD424I',
    secret: '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',
    bucket: 'anonderbazar',
    maxBytes: 10000000
  };

};
exports.imageUploadConfig = imageUploadConfig;

exports.uploadImgAsync = (param, option = {}) => {
  return new Promise(((resolve, reject) => {
    param.upload(option, (err, data) => {
      if (err !== null) {
        return reject(err);
      }
      resolve(data);
    });
  }));
};

exports.deleteImages = async (imageList, path) => {
  asyncForEach(imageList, (item) => {
    console.log(item);

    let dir = __dirname.split('/api');
    let assestsdir = dir[0] + '/assets';

    try {
      fs.unlinkSync(assestsdir + item);
      console.log('successfully deleted' + item);
    } catch (err) {

      console.log(err);
      console.log('error to delete' + item);
      // handle the error
    }
  });
};
exports.uploadImages = (imageFile) => {
  return new Promise((resolve, reject) => {
    imageFile.upload(imageUploadConfig(), async (err, uploaded) => {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        resolve(uploaded);
      }
    });
  });
};
exports.uploadImagesWithConfig = (imageFile, customConfig) => {
  let config = imageUploadConfig();
  config = {
    ...config,
    ...customConfig
  };
  return new Promise((resolve, reject) => {
    imageFile.upload(config, async (err, uploaded) => {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        resolve(uploaded);
      }
    });
  });
};
exports.comparePasswords = (passwordProvided, userPassword) => {
  return new Promise((resolve, reject) => {
    User.comparePassword(passwordProvided, userPassword, (err, valid) => {
      if (err) {
        reject(err);
      } else {
        resolve(valid);
      }
    });
  });
};

exports.getContentTypeByFile = function (fileName) {
  var rc = 'application/octet-stream';
  var fn = fileName.toLowerCase();

  if (fn.indexOf('.html') >= 0) {
    rc = 'text/html';
  } else if (fn.indexOf('.css') >= 0) {
    rc = 'text/css';
  } else if (fn.indexOf('.json') >= 0) {
    rc = 'application/json';
  } else if (fn.indexOf('.js') >= 0) {
    rc = 'application/x-javascript';
  } else if (fn.indexOf('.png') >= 0) {
    rc = 'image/png';
  } else if (fn.indexOf('.jpg') >= 0) {
    rc = 'image/jpg';
  }

  return rc;
};

exports.makeUniqueId = function (length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

exports.countTotalPrice = async function (allProducts, zila_id){
  let total_price = 0;
  let isFreeShipping = true;
  let maxDhakaDeliveryCharge = 0;
  let maxOutsideDhakaDeliveryCharge = 0;

  let globalConfigs = await GlobalConfigs.findOne({
    deletedAt: null
  });

  allProducts.map(product => {
    if(!parseInt(product.free_shipping)){
      isFreeShipping = false;
    }
    let productPrice = product.promotion ? parseFloat(product.promo_price) : parseFloat(product.price);
    total_price += productPrice;

    let dhakaCharge = (_.isNull(product.dhaka_charge) || _.isUndefined(product.dhaka_charge)) ? globalConfigs.dhaka_charge : product.dhaka_charge;
    let outsideDhakaCharge = (_.isNull(product.outside_dhaka_charge) || _.isUndefined(product.outside_dhaka_charge)) ? globalConfigs.outside_dhaka_charge : product.outside_dhaka_charge;

    maxDhakaDeliveryCharge = Math.max(maxDhakaDeliveryCharge, dhakaCharge);
    maxOutsideDhakaDeliveryCharge = Math.max(maxOutsideDhakaDeliveryCharge, outsideDhakaCharge);
  });
  if(!isFreeShipping){
    if(zila_id === dhakaZilaId){
      total_price += maxDhakaDeliveryCharge;
    }
    else {
      total_price += maxOutsideDhakaDeliveryCharge;
    }
  }
  return total_price;
};
