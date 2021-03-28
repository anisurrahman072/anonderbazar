module.exports = {
  devEnv: false,
  radisEnabled: false,
  jwtTokenExpirationTime: 60 * 60 * 24,
  couponCodePadCount: 6,
  adminPaymentAddressId: 75,
  cashOnDeliveryNotAllowedForCategory: 428,
  dhakaZilaId: 2942,
  sslCommerceSandbox: true,
  sslCommerzSandboxCred: {
    store_id: 'anond5efeb984e900f',
    store_passwd: 'anond5efeb984e900f@ssl'
  },
  sslWebUrl: 'http://test.anonderbazar.com',
  sslApiUrl: 'http://api.test.anonderbazar.com/api/v1',
  sslCommerzProductionCred: {
    store_id: 'anonderbazarlive@ssl',
    store_passwd: 'i2EFz@ZNt57@t@r'
  },
  bangladeshSMSConfig: {
    api_key: 'C20075355fdae5af5f8c82.48883475',
    senderid: '8809612446331',
  },
  sslCommerzOTPSMSConfig: {
    'api_token': 'SOFTBD-753ba2f0-f1a3-4388-a19f-62e47260f148',
    'sid': 'ANONDERBAZARAPI',
  },
  sslCommerzSMSConfig: {
    'api_token': 'SOFTBD-753ba2f0-f1a3-4388-a19f-62e47260f148',
    'sid': 'ANONDERBAZARBULK',
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
      'payment_query': 'https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/payment/status',
      'transaction_search': 'https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/general/searchTransaction',
    },
    'sandbox': {
      'app_key': '4f6o0cjiki2rfm34kfdadl1eqq',
      'app_secret': '2is7hdktrekvrbljjh44ll3d9l1dtjo4pasmjvs5vl5qr3fug4b',
      'username': 'sandboxTokenizedUser02',
      'password': 'sandboxTokenizedUser02@12345',
      'script': 'https://scripts.sandbox.bka.sh/versions/1.2.0-beta/checkout/bKash-checkout-sandbox.js',
      'token_grant_url': 'https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/token/grant',
      'agreement_create': 'https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/create',
      'agreement_execute': 'https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/execute',
      'agreement_status': 'https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/agreement/status',
      'agreement_cancel': 'https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/agreement/cancel',
      'payment_create': 'https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/create',
      'payment_execute': 'https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/execute',
      'payment_query': 'https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/payment/status',
      'transaction_search': 'https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/general/searchTransaction',
    }
  }
};
