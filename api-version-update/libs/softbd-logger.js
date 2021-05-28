// Firstly we'll need to import the fs library
const fs = require('fs');
const {isObject} = require('lodash');
const moment = require('moment');
// next we'll want make our Logger object available
// to whatever file references it.
const Logger = (exports.Logger = {});

// Create 3 sets of write streams for the 3 levels of logging we wish to do
// every time we get an error we'll append to our error streams, any debug message
// to our debug stream etc...
const paymentTransactionStream = fs.createWriteStream('logs/payment-transaction.log');
// Notice we set the path of our log files in the first parameter of
// fs.createWriteStream. This could easily be pulled in from a config
// file if needed.
const errorStream = fs.createWriteStream('logs/error.log');
// createWriteStream takes in options as a second, optional parameter
// if you wanted to set the file encoding of your output file you could
// do so by setting it like so: ('logs/debug.txt' , { encoding : 'utf-8' });
const debugStream = fs.createWriteStream('logs/debug.log');

function formatObject(message) {
  if (isObject(message)) {
    return JSON.stringify(message, null, 2);
  }
  return message;
}

// Finally we create 3 different functions
// each of which appends our given messages to
// their own log files along with the current date as an
// iso string and a \n newline character
Logger.orderLog = function (userId, label = '', msg = '') {

  let message = 'UserID: ' + userId + ' [' + moment().format('DD-MM-YYYY HH:mm:ss') + ']: '+ label + ': \n' ;
  paymentTransactionStream.write(message);
  console.log(message);
  if(msg){
    paymentTransactionStream.write(formatObject(msg) + '\n');
    console.log(msg);
  }
};

Logger.debug = function (msg) {
  let message = new Date().toISOString() + ' : ' + msg + '\n';
  debugStream.write(message);
};

Logger.error = function (msg) {
  let message = new Date().toISOString() + ' : ' + msg + '\n';
  errorStream.write(message);
};
