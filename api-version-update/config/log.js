/**
 * Built-in Log Configuration
 * (sails.config.log)
 *
 * Configure the log level for your app, as well as the transport
 * (Underneath the covers, Sails uses Winston for logging, which
 * allows for some pretty neat custom transports/adapters for log messages)
 *
 * For more information on the Sails logger, check out:
 * https://sailsjs.com/docs/concepts/logging
 */
let {transports, createLogger, format} = require('winston');
let { combine, timestamp, label, prettyPrint } = format;

let commonSettings = {
  colorize: false,
  format: combine(
    label({ label: `Anonderbazar log!` }),
    timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    prettyPrint()
  ),
  json: true
};

let settings = [
  {filename: `${__dirname}/../logs/warn.log`, level: 'warn'},
  {filename: `${__dirname}/../logs/error.log`, level: 'error'},
  {filename: `${__dirname}/../logs/debug.log`, level: 'debug'},
  {filename: `${__dirname}/../logs/info.log`, level: 'info'}
];

let loggerSettings = {
  transports: [...settings.map(s => new transports.File({...s, ...commonSettings})), new transports.Console({
    format: format.simple()
  })],
  exitOnError: false
};

// This is the workaround
let winstonLogger = createLogger(loggerSettings);
let logger = {
  'info': function () {
    winstonLogger.info(...arguments);
  },
  'debug': function () {
    winstonLogger.debug(...arguments);
  },
  'error': function () {
    winstonLogger.error(...arguments);
  },
  'warn': function () {
    winstonLogger.warn(...arguments);
  },
  'log': function () {
    winstonLogger.log(...arguments);
  }
};

module.exports.log = {

  /***************************************************************************
  *                                                                          *
  * Valid `level` configs: i.e. the minimum log level to capture with        *
  * sails.log.*()                                                            *
  *                                                                          *
  * The order of precedence for log levels from lowest to highest is:        *
  * silly, verbose, info, debug, warn, error                                 *
  *                                                                          *
  * You may also set the level to "silent" to suppress all logs.             *
  *                                                                          *
  ***************************************************************************/
  custom: logger,
  inspect: false

  /*level: 'debug'*/
};
