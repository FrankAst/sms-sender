// @flow
/* eslint-disable no-console */

import mongoose from 'mongoose';
import type { MongooseConnection } from 'mongoose';

mongoose.Promise = global.Promise;

type DBNames = 'data';

export default class DB {
  static mongoose = mongoose;
  static consoleErr = console.error;
  static consoleLog = console.log;

  static data: MongooseConnection = mongoose.createConnection();

  static init() {
    return Promise.all([DB.openDB('data')]);
  }

  static close() {
    return Promise.all([DB.closeDB('data')]);
  }

  static openDB(name: DBNames = 'data'): Promise<MongooseConnection> {
    return new Promise((resolve, reject) => {
      const uri =
        process.env.MONGODB_GOV_STAT_BIN_URI ||
        'mongodb://frankast:v1v2v3b4@ds255588.mlab.com:55588/smsc';
      // (process.env.NODE_ENV === 'frankast'
      //   ? 'mongodb://frankast:v1v2v3b4@ds251827.mlab.com:51827/stat-gov-bin'
      //   : 'mongodb://gov_stat_bin:pass@ds263137.mlab.com:63137/gov_stat_bin');
      const opts = {};

      opts.promiseLibrary = global.Promise;
      opts.autoReconnect = true;
      opts.reconnectTries = Number.MAX_VALUE;
      opts.reconnectInterval = 1000;

      const db: any = DB[name];

      db.consoleErr = DB.consoleErr;
      db.consoleLog = DB.consoleLog;

      db.on('error', e => {
        if (e.message.code === 'ETIMEDOUT') {
          db.consoleErr(Date.now(), e);
          db.connect(uri, opts);
        }
        db.consoleErr(e);
      });

      db.once('open', () => {
        db.consoleLog(`Successfully connected to ${uri}`);
        resolve(db);
      });
      db.once('disconnected', () => {
        db.consoleLog(`Disconnected from ${uri}`);
        reject();
      });

      db.openUri(uri, opts);
    });
  }

  static closeDB(name: DBNames = 'data'): Promise<any> {
    if (DB[name]) {
      return DB[name].close();
    }
    return Promise.resolve();
  }
}
