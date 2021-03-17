module.exports = {
  devEnv: false,
  radisEnabled: false,
  couponCodePadCount: 6,
  adminPaymentAddressId: 75,
  dhakaZilaId: 2942,
  sslCommerceSandbox: false,
  sslCommerzSandboxCred: {
    store_id: 'anond5efeb984e900f',
    store_passwd: 'anond5efeb984e900f@ssl'
  },
  sslWebUrl: 'https://anonderbazar.com',
  sslApiUrl: 'https://api.anonderbazar.com/api/v1',
  sslCommerzProductionCred: {
    store_id: 'anonderbazarlive@ssl',
    store_passwd: 'i2EFz@ZNt57@t@r'
  },
  bangladeshSMSConfig: {
    api_key: 'C20075355fdae5af5f8c82.48883475',
    senderid: '8809612446331',
  },
  sslCommerzSMSConfig: {
    'api_token': 'SOFTBD-753ba2f0-f1a3-4388-a19f-62e47260f148',
    'sid': 'SOFTBDNONAPI',
  },
  bKash: {
    isSandboxMode: true,
    'production': {
      'app_key': '',
      'app_secret': '',
      'username': '',
      'password': '',
      'script': 'https://scripts.sandbox.bka.sh/versions/1.2.0-beta/checkout/bKash-checkout-sandbox.js',
      'token_grant_url': 'https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/token/grant',
      'agreement_create': 'https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/create',
      'agreement_execute': 'https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/execute',
      'agreement_status': 'https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/agreement/status',
      'agreement_cancel': 'https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/agreement/cancel',
      'payment_create': 'https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/create',
      'payment_execute': 'https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/execute',
    },
    'sandbox': {
      'app_key': '7epj60ddf7id0chhcm3vkejtab',
      'app_secret': '18mvi27h9l38dtdv110rq5g603blk0fhh5hg46gfb27cp2rbs66f',
      'username': 'sandboxTokenizedUser01',
      'password': 'sandboxTokenizedUser12345',
      'script': 'https://scripts.sandbox.bka.sh/versions/1.2.0-beta/checkout/bKash-checkout-sandbox.js',
      'token_grant_url': 'https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/token/grant',
      'agreement_create': 'https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/create',
      'agreement_execute': 'https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/execute',
      'agreement_status': 'https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/agreement/status',
      'agreement_cancel': 'https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/agreement/cancel',
      'payment_create': 'https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/create',
      'payment_execute': 'https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/execute',
    }
  }
};
