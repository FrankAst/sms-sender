// @flow
import 'isomorphic-fetch';
import axios from 'axios';

import type {
  SendSmsResponseT,
  GetStatusResponseT,
  SmsStatusT,
  ProviderI,
  GetCostResponseT,
  GetBalanceResponseT,
} from '../definitions';

type CredentialsT = {|
  url: string,
  login: string,
  originator: string,
  password: string,
|};

type OptionsT = { mesId: number, phone: string, message: string };

export default class PlayMobile implements ProviderI {
  credentials: CredentialsT;

  constructor(credentials: CredentialsT) {
    this.credentials = credentials;
  }

  // make request to PlayMobile API
  async _send(cmd: 'send' | 'get-status', params: Object): Promise<Object> {
    const { login, password, url } = this.credentials || {};
    const stringToEncode = `${login}:${password}`;
    try {
      const response = await axios({
        method: 'post',
        url: `${url}/${cmd}`,
        data: params,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${Buffer.from(stringToEncode).toString('base64')}`,
        },
      });
      return cmd === 'get-status'
        ? { body: response.data }
        : { statusCode: response.status, body: response.data };
    } catch (e) {
      return {
        statusCode: e.response.status,
        errMsg: (e.response && e.response.statusText) || ' ',
      };
    }
  }

  // get more detailed description on https://smsc.kz/api/http/status_messages/statuses/#menu
  // eslint-disable-next-line class-methods-use-this
  _prepareStatus(status: string): SmsStatusT {
    switch (status) {
      case 'failed':
        return 'error'; //  - Not delivered
      case 'notDelivered':
        return 'pending'; //  - Waiting for sending
      case 'deferred':
        return 'pending'; //  - Given to operator
      case 'transmitted':
        return 'ok'; //  - Delivered
      case 'delivered':
        return 'ok'; //  - Delivered
      default:
        return 'error';
    }
  }

  // send message
  async sendSms(phone: string, message: string): Promise<SendSmsResponseT> {
    const mesId = Math.floor(100000 + Math.random() * 900000);
    const params = this.createParams({
      mesId,
      phone,
      message,
    });
    const rawResponse = await this._send('send', params);
    const res = {
      messageId: `${mesId}-${phone}`,
      rawResponse,
    };
    return res;
  }

  // get status of message (messageId format: id-phoneNumber)
  async getStatus(messageId: string): Promise<GetStatusResponseT> {
    const params = {
      'message-id': [messageId.trim().split('-')[0]],
    };
    const rawResponse = await this._send('get-status', params);
    const res = {
      status: this._prepareStatus(rawResponse.status),
      rawResponse,
    };
    return res;
  }

  // get current provider name
  // eslint-disable-next-line class-methods-use-this
  getProviderName(): string {
    return 'PlayMobile';
  }
  // eslint-disable-next-line
  async getBalance(): Promise<GetBalanceResponseT> {
    throw new Error(`PlayMobile does not support getting balance`);
  }
  // eslint-disable-next-line
  async getCost(phone: string, message: string): Promise<GetCostResponseT> {
    throw new Error(`PlayMobile does not support getting cost`);
  }
  // eslint-disable-next-line class-methods-use-this
  createParams(options: OptionsT): Object {
    const { mesId, phone, message } = options || {};
    const { originator = '3700' } = this.credentials;
    return {
      messages: [
        {
          'message-id': mesId,
          recipient: phone,
          sms: {
            ttl: '300',
            originator,
            content: {
              text: message,
            },
          },
        },
      ],
    };
  }
}
