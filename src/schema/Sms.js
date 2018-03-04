// @flow

import mongoose from 'mongoose';
import DB from './db';

export const SmsSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      description: 'ID sms на сервере SMSC',
    },

    message: {
      type: String,
      description: 'Текст сообщения',
    },

    phones: {
      type: [String],
      description: 'Номера получателей',
    },

    sender: {
      type: String,
      default: 'SALON.KZ',
      description: 'Имя отправителя',
    },

    balance: {
      type: Number,
      description: 'Текущий баланс после отправки сообщения',
    },

    cost: {
      type: Number,
      description: 'Стоимость текущей рассылки',
    },

    status: {
      type: Number,
      description: 'Статус сообщения',
    },
  },
  {
    versionKey: false,
    timestamps: true,
    collection: 'sms',
  }
);

export class SmsDoc /* :: extends Mongoose$Document */ {
  // $FlowFixMe
  id: number;
  message: string;
  phones: Array<string>;
  sender: string;
  status: number;

  static async upsert(data: $Shape<SmsDoc>): Promise<?SmsDoc> {
    return this.findOneAndUpdate(
      { id: data.id },
      { ...data },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).exec();
  }
}

SmsSchema.loadClass(SmsDoc);

export const Sms = DB.data.model('Sms', SmsSchema);
