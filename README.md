# sms-sender :envelope: :rocket:

[![travis build](https://img.shields.io/travis/FrankAst/sms-sender.svg)](https://travis-ci.org/FrankAst/sms-sender)
[![codecov coverage](https://img.shields.io/codecov/c/github/FrankAst/sms-sender.svg)](https://codecov.io/github/FrankAst/sms-sender)
[![](https://img.shields.io/npm/v/@frankast/sms-sender.svg)](https://www.npmjs.com/package/@frankast/sms-sender)
[![npm](https://img.shields.io/npm/dt/@frankast/sms-sender.svg)](http://www.npmtrends.com/@frankast/sms-sender)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![Greenkeeper badge](https://badges.greenkeeper.io/FrankAst/sms-sender.svg)](https://greenkeeper.io/)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

This is a wrapper for [AWS.SNS](https://aws.amazon.com/sns/) and [SMSC API](https://smsc.ru).

## Installation

```bash
yarn add @frankast/sms-sender
```

## API

There are three providers `Smsc.js` (default), `Sns.js`, `Mobizon`. If you want to use `Sns.js` do not forget to add `aws-sdk` optional dependency.

#### Sending SMS

To send an SMS you have to create an instance of provider and call `sendSms()` method:

```js
import { Smsc } from '@frankast/sms-sender';

const smsc = new Smsc({
  login: YOUR_SMSC_LOGIN,
  password: YOUR_SMSC_PASSSWORD,
});

// You can use Promises as well.
const response = await smsc.sendSms('phone_number', 'message');

// The response object will contain `messageId` and `rawResponse`:
// response = { messageId: 'id-phone_number', rawResponse: { cnt: 1, id: 50 }}
```

#### Get delivery status of SMS

To check the delivery status of SMS call `getStatus()` method:

```js
const response = await smsc.getStatus('40-77718637484'); // takes messageId (id-phone_number)

// The response object will contain 'rawResponse' with general info and 'status':
// response = {
//   rawResponse: {
//     cost: '0.00',
//     country: 'Казахстан',
//     last_date: '13.03.2018 15:50:50',
//     last_timestamp: 1520934650,
//     message: 'hello',
//     operator: 'Beeline',
//     phone: '77718637484',
//     region: '',
//     send_date: '13.03.2018 15:50:46',
//     send_timestamp: 1520934646,
//     sender_id: 'SMS-CENTRE',
//     status: 1,
//     status_name: 'Доставлено',
//     type: 0,
//   },
//   status: 'ok',
// }
```

P.S. You can get status codes [here](https://github.com/FrankAst/sms-sender/blob/3946a34f0d68369914e1ac6c180cc2a5948b718d/src/transporters/Smsc.js#L49) or in [SMSC docs](https://smsc.kz/api/http/status_messages/statuses/#menu).

#### Get cost of SMS

To get a cost of SMS call `getCost()` method:

```js
const response = await smsc.getCost('phone_number','message');

// The response object will contain 'rawResponse' and 'cost':
// response = { cost: '0', rawResponse: { cnt: 1, cost: '25' } };
```

#### Get current balance

To get the current balance on your account call `getBalance()` method:

```js
  const response = await smsc.getBalance();

// The response object will contain 'balance' and 'currency':
// response = { balance: '84.75', currency: 'KZT' };
```

## Examples

Here is an example of usage with RegExp:

```js
// @flow

import { Smsc, Sns, Mobizon } from '@frankast/sms-sender';

// don't forget to put your credentials
const providers = {
  smsc: new Smsc({
    login: '',
    password: '',
  }),

  sns: new Sns({
    region: '',
    accessKeyId: '',
    secretAccessKey: '',
  }),
  mobizon: new Mobizon({
    apiKey: '',
  }),
};

async function send(phone: string, message: string): Promise<Object> {
  const regexp = RegExp('7708', 'g');
  let provider;
  if (regexp.test(phone)) {
    provider = providers.smsc;
  } else {
    provider = providers.sns;
  }
  const res = await provider.sendSms(phone, message);
  return res;
}

send('+77081113344', 'hello world').then(res => {
  console.log(res);
});
```

Other examples are available in [./examples](https://github.com/FrankAst/sms-sender/tree/master/examples).

## Contribution

Feel free to submit pull request to us. Also, be sure all tests has passed otherwise pull request won't be accepted.

## License

[MIT](https://github.com/FrankAst/sms-sender/blob/master/LICENSE.md)
