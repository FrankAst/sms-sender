/* @flow */

import fetchMock from 'fetch-mock';
import Mobizon from '../Mobizon';

describe('Mobizon', () => {
  const apiKey = '38d0a2492a33901f547ef22099e6535589500936';
  const mobizon = new Mobizon({ apiKey });

  beforeEach(() => {
    fetchMock.reset();
  });

  it('sendSms', async () => {
    const rawResponse = {
      data: { campaignId: '18633289', messageId: '39335551', status: 1 },
    };
    fetchMock.mock({
      matcher: `https://api.mobizon.com/service/message/sendsmsmessage?apiKey=${apiKey}&recipient=${77478446651}&text=HELLO`,
      response: rawResponse,
    });

    const res = await mobizon.sendSms('77478446651', 'HELLO');
    expect(res).toEqual({
      messageId: '39335551',
      rawResponse: rawResponse.data,
    });
  });

  it('getStatus', async () => {
    const rawResponse = {
      data: [
        {
          id: '39335551',
          status: 'DELIVRD',
          segNum: '1',
          startSendTs: '2018-04-09 19:36:09',
          statusUpdateTs: '2018-04-09 19:36:13',
        },
      ],
    };
    fetchMock.mock({
      matcher: `https://api.mobizon.com/service/message/getsmsstatus?apiKey=${apiKey}&ids=39335551`,
      response: rawResponse,
    });

    const res = await mobizon.getStatus('39335551');
    expect(res).toEqual({
      status: ['ok'],
      rawResponse: rawResponse.data,
    });
  });

  it('getBalance', async () => {
    const rawResponse = { data: { balance: '83.5300', currency: 'KZT' } };
    fetchMock.mock({
      matcher: `https://api.mobizon.com/service/user/getownbalance/?apiKey=${apiKey}`,
      response: rawResponse,
    });

    const res = await mobizon.getBalance();
    expect(res).toEqual({
      balance: '83.5300',
      rawResponse: rawResponse.data,
    });
  });
});
