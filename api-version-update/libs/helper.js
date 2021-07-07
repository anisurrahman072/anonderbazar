const fetch = require('node-fetch');
const {devEnv, bKash, dhakaZilaId} = require('../config/softbd');
const AbortController = require('node-abort-controller');
const _ = require('lodash');
const fs = require('fs');
const {s3Config} = require('../config/softbd');

const asyncForEach = async (array, callback) => {
  if (array && Array.isArray(array) && array.length > 0) {
    for (let index = 0; index < array.length; index++) {
      // eslint-disable-next-line callback-return
      await callback(array[index], index, array);
    }
  }
};
exports.asyncForEach = asyncForEach;


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

exports.escapeExcel = function (str) {
  if (!str) {
    return '';
  }
  return str.replace(/[&]/g, 'and').replace(/['"]/g, '').replace('-', ' ').replace(/\s+/g, ' ');
};

/*exports.calcCartTotal = function (cart, cartItems) {
  let grandOrderTotal = 0;
  let totalQty = 0;
  cartItems.forEach((cartItem) => {
    if (cartItem.product_quantity > 0) {
      //  console.log('ttttt', cartItem);
      grandOrderTotal += cartItem.product_total_price;
      totalQty += cartItem.product_quantity;
    }
  });
  return {
    grandOrderTotal,
    totalQty
  };
};*/

/*exports.uploadImgAsync = (param, option = {}) => {
  return new Promise(((resolve, reject) => {
    param.upload(option, (err, data) => {
      if (err !== null) {
        return reject(err);
      }
      resolve(data);
    });
  }));
};*/
const imageUploadConfig = function () {
  if (devEnv) {
    return {
      maxBytes: 52428800,
      dirname: sails.config.appPath + '/.tmp/public',
    };
  }
  return {
    adapter: require('skipper-s3'),
    ...s3Config
  };
};
exports.imageUploadConfig = imageUploadConfig;
exports.deleteImagesLocal = async (imageList, path) => {
  await asyncForEach(imageList, (item) => {
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

exports.deleteImageS3 = async (imageName, path) => {
  const skipper = require('skipper-s3')({key: s3Config.key, secret: s3Config.secret, bucket: s3Config.bucket});
  return new Promise((resolve, reject) => {
    skipper.rm(imageName, (err, result) => {
      if (err) {
        reject(err);
      }
      resolve(result);
    });
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
exports.getGlobalConfig = async () => {
  let globalConfigs = await GlobalConfigs.findOne({
    deletedAt: null
  });

  if (!globalConfigs) {
    throw new Error('Global config was not found!');
  }

  return globalConfigs;
};

exports.getAuthUser = (req) => {
  if (!_.isUndefined(req.token) && !_.isUndefined(req.token.userInfo)) {
    return req.token.userInfo;
  }
  throw new Error('Auth user was not found.');
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


exports.calculateCourierCharge = async function (freeShipping, allProducts, zilaId) {
  let courierCharge = 0;
  let maxDhakaDeliveryCharge = 0;
  let maxOutsideDhakaDeliveryCharge = 0;

  let globalConfigs = await GlobalConfigs.findOne({
    deletedAt: null
  });

  allProducts.forEach(product => {

    let dhakaCharge = (_.isNull(product.dhaka_charge) || _.isUndefined(product.dhaka_charge)) ? globalConfigs.dhaka_charge : product.dhaka_charge;
    let outsideDhakaCharge = (_.isNull(product.outside_dhaka_charge) || _.isUndefined(product.outside_dhaka_charge)) ? globalConfigs.outside_dhaka_charge : product.outside_dhaka_charge;

    maxDhakaDeliveryCharge = Math.max(maxDhakaDeliveryCharge, dhakaCharge);
    maxOutsideDhakaDeliveryCharge = Math.max(maxOutsideDhakaDeliveryCharge, outsideDhakaCharge);
  });
  if (!freeShipping) {
    if (zilaId === dhakaZilaId) {
      courierCharge = maxDhakaDeliveryCharge;
    } else {
      courierCharge = maxOutsideDhakaDeliveryCharge;
    }
  }
  return courierCharge;
};
