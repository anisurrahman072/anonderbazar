const util = require('util');
const {radisEnabled} = require('../config/softbd');
exports.fetchFromCache = async (cacheKey) => {
  if (!radisEnabled) {
    return undefined;
  }
  return await sails.getDatastore('cache').leaseConnection(async (db) => {
    let found = await (util.promisify(db.get).bind(db))(cacheKey);
    if (found === null) {
      return undefined;
    } else {
      return JSON.parse(found);
    }
  });
};

const storeToCache = async (cacheKey, value) => {
  if (!radisEnabled) {
    return null;
  }
  const expiresIn = 1000 * 60 * 60 * 24;
  const ttlInSeconds = Math.ceil(expiresIn / 1000);

  await sails.getDatastore('cache').leaseConnection(async (db) => {
    await (util.promisify(db.setex).bind(db))(cacheKey, ttlInSeconds, JSON.stringify(value));
  });
};

exports.storeToCache = storeToCache;

const removeCacheByKey = async (cacheKey) => {
  await storeToCache(cacheKey, undefined);
};

exports.removeCacheByKey = removeCacheByKey;

const removeCacheForProduct = async (productId) => {
  let keyWithPop = 'product-' + productId + '-with-pop';
  let keyNoPop = 'product-' + productId + '-no-pop';
  let keyDetails = 'product-' + productId + '-details';
  await removeCacheByKey(keyWithPop);
  await removeCacheByKey(keyNoPop);
  await removeCacheByKey(keyDetails);
};

exports.removeCacheForProduct = removeCacheForProduct;
