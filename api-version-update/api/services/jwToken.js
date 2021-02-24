/**
 * jwToken
 *
 * @description :: JSON Webtoken Service for sails
 * @help        :: See https://github.com/auth0/node-jsonwebtoken & http://sailsjs.org/#!/documentation/concepts/Services
 */

let jwt = require('jsonwebtoken');
let tokenSecret = 'secretissecet';

// Generates a token from supplied payload
module.exports.issue = function (payload) {
  return jwt.sign(
    payload,
    tokenSecret, {
      // expiresIn: '1h',
      issuer: 'cccg',
      algorithm: 'HS256'
    });
};

// Verifies token on a request
module.exports.verify = function (token, callback) {
  return jwt.verify(
    token, // The token to be verified
    tokenSecret, // Same token we used to sign
    {}, // No Option, for more see https://github.com/auth0/node-jsonwebtoken#jwtverifytoken-secretorpublickey-options-callback
    callback //Pass errors or decoded token to callback
  );
};


