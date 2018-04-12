// @flow

import 'isomorphic-fetch';
import { URLSearchParams } from 'url';

import type {
  SendSmsResponseT,
  GetStatusResponseT,
  GetBalanceResponseT,
  SmsStatusT,
  ProviderI,
} from '../definitions';

type CredentialsT = {|
  apiKey: string,
|};

export default class Mobizon implements ProviderI {
  credentials: CredentialsT;

  constructor(credentials: CredentialsT) {
    this.credentials = credentials;
  }

  async _send(params: Object): Promise<Object> {
    const { apiKey } = this.credentials || {};
    const extendedParams = {
      apiKey,
      ...params,
    };
    const paramsUrl = new URLSearchParams(extendedParams);
    const url = `https://api.mobizon.com/service/message/sendsmsmessage?${paramsUrl.toString()}`;
    const res = await fetch(url);
    return res.json();
  }

  async sendSms(phone: string, message: string): Promise<SendSmsResponseT> {
    const params = {
      recipient: phone,
      text: message,
    };
    const { data } = await this._send(params);
    const res = {
      messageId: data.messageId,
      rawResponse: data,
    };
    return res;
  }

  // eslint-disable-next-line class-methods-use-this
  _prepareStatus(status: string): SmsStatusT {
    switch (status) {
      case 'NEW':
        return 'pending'; // Новое сообщение, еще не было отправлено
      case 'ENQUEUD':
        return 'pending'; // Прошло модерацию и поставлено в очередь на отправку
      case 'ACCEPTED':
        return 'pending'; // Отправлено из системы и принято оператором
      case 'UNDELIV':
        return 'error'; // Не доставлено получателю
      case 'REJECTD':
        return 'error'; // Отклонено оператором
      case 'PDLIVRD':
        return 'pending'; // Идет кусочками, первый пошел
      case 'DELIVRD':
        return 'ok'; // Доставлено получателю полностью
      case 'EXPIRED':
        return 'error'; // Доставка не удалась, истек срок жизни сообщения
      case 'DELETED':
        return 'error'; // Удалено из-за ограничений и не доставлено
      default:
        return 'error';
    }
  }

  async getStatus(messageId: string | string[]): Promise<GetStatusResponseT> {
    const { apiKey } = this.credentials || {};
    const params = {
      apiKey,
      ids: Array.isArray(messageId) ? messageId.join(',') : messageId,
    };

    const paramsUrl = new URLSearchParams(params);

    const url = `https://api.mobizon.com/service/message/getsmsstatus?${paramsUrl.toString()}`;
    const response = await fetch(url);
    const { data } = await response.json();

    const res = {
      status: data.map(d => this._prepareStatus(d.status)),
      rawResponse: data,
    };
    return res;
  }

  async getBalance(): Promise<GetBalanceResponseT> {
    const { apiKey } = this.credentials || {};
    const params = {
      apiKey,
    };

    const paramsUrl = new URLSearchParams(params);

    const url = `https://api.mobizon.com/service/user/getownbalance/?${paramsUrl.toString()}`;
    const response = await fetch(url);
    const { data } = await response.json();

    const res = {
      balance: data.balance,
      rawResponse: data,
    };
    return res;
  }

  // eslint-disable-next-line class-methods-use-this
  async getCost() {
    return {
      cost: '',
      rawResponse: {},
    };
  }

  // eslint-disable-next-line class-methods-use-this
  getProviderName(): string {
    return 'mobizon';
  }
}
