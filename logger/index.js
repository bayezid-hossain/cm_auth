const winston = require('winston');
const dotenv = require('dotenv');

//config
dotenv.config({ path: __dirname + '/config/config.env' });
require('winston-mongodb');
const { createLogger, format, transports } = require('winston');
const { combine, splat, timestamp, printf } = format;
const myFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}] : ${message} `;
  return msg;
});
const levelFilter = (level) =>
  format((info, opts) => {
    if (info.level != level) {
      return false;
    }
    return info;
  })();
const logger = createLogger({
  levels: {
    info: 0,
    ok: 1,
    warning: 2,
    error: 3,
  },
  defaultMeta: { service: 'auth-service' },
  transports: [
    new transports.MongoDB({
      format: combine(
        levelFilter('info'),
        splat(),
        myFormat,
        format.metadata()
      ),
      level: 'info',
      db: process.env.DB_URI_CM,
      collection: 'logs_auth',
      options: { useUnifiedTopology: true },
    }),
    // new transports.Console({
    //   format: combine(
    //     format.colorize(),
    //     levelFilter('info'),
    //     splat(),
    //     timestamp(),
    //     myFormat,
    //     format.metadata()
    //   ),
    //   level: 'info',
    // }),

    new transports.MongoDB({
      format: combine(
        levelFilter('error'),
        splat(),
        myFormat,
        format.metadata()
      ),
      level: 'error',
      db: process.env.DB_URI_CM,
      collection: 'logs_auth',
      options: { useUnifiedTopology: true },
    }),
    new transports.MongoDB({
      format: combine(
        levelFilter('warning'),
        splat(),
        myFormat,
        format.metadata()
      ),
      level: 'warning',
      db: process.env.DB_URI_CM,
      collection: 'logs_auth',
      options: { useUnifiedTopology: true },
    }),
  ],
});

module.exports = logger;
