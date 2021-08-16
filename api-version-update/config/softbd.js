module.exports = {
  devEnv: false,
  radisEnabled: false,
  jwtTokenExpirationTime: 60 * 60 * 24,
  couponCodePadCount: 6,
  adminPaymentAddressId: 75,
  cashOnDeliveryNotAllowedForCategory: 428,
  dhakaZilaId: 2942,
  anonderbazarEmail: 'anonderbazar001@gmail.com',
  anonderbazarEmailPassword: 'happy4321',
  investorEmail: 'investor@anonderbazar.com',
  s3Config: {
    key: 'AKIATYQRUSGN2DDD424I',
    secret: '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',
    bucket: 'anonderbazar',
    maxBytes: 50 * 1024 * 1024,
    limit: 50 * 1024 * 1024
  },
  sslCommerceSandbox: true,
  sslCommerzSandboxCred: {
    store_id: 'anond5efeb984e900f',
    store_passwd: 'anond5efeb984e900f@ssl'
  },
  sslWebUrl: 'https://test.anonderbazar.com',
  sslApiUrl: 'https://api-test.anonderbazar.com/api/v1',
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
      'app_key': '23qdvpcctmb5lor0b3k17p3qho',
      'app_secret': '10i00q9staf67qfcr65runrb03khco6tiuqvdprvq9vbqsfjg4un',
      'username': 'ANONDERBAZARLTDTC',
      'password': 'aN9@dE7rT1C',
      'script': 'https://tokenized.pay.bka.sh/v1.2.0-beta/checkout/bKash-checkout-sandbox.js',
      'token_grant_url': 'https://tokenized.pay.bka.sh/v1.2.0-beta/tokenized/checkout/token/grant',
      'agreement_create': 'https://tokenized.pay.bka.sh/v1.2.0-beta/tokenized/checkout/create',
      'agreement_execute': 'https://tokenized.pay.bka.sh/v1.2.0-beta/tokenized/checkout/execute',
      'agreement_status': 'https://tokenized.pay.bka.sh/v1.2.0-beta/tokenized/checkout/agreement/status',
      'agreement_cancel': 'https://tokenized.pay.bka.sh/v1.2.0-beta/tokenized/checkout/agreement/cancel',
      'payment_create': 'https://tokenized.pay.bka.sh/v1.2.0-beta/tokenized/checkout/create',
      'payment_execute': 'https://tokenized.pay.bka.sh/v1.2.0-beta/tokenized/checkout/execute',
      'payment_query': 'https://tokenized.pay.bka.sh/v1.2.0-beta/tokenized/checkout/payment/status',
      'transaction_search': 'https://tokenized.pay.bka.sh/v1.2.0-beta/tokenized/checkout/general/searchTransaction',
      'refund_transaction': 'https://tokenized.pay.bka.sh/v1.2.0-beta/tokenized/checkout/payment/refund',
      'refund_status': 'https://tokenized.pay.bka.sh/v1.2.0-beta/tokenized/checkout/payment/refund',
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
      'refund_transaction': 'https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/payment/refund',
      'refund_status': 'https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/payment/refund',
    }
  },
  nagad: {
    isSandboxMode: true,
    'merchant_id': 683002007104225,
    'sandbox': {
      'pgPublicKey': 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAjBH1pFNSSRKPuMcNxmU5jZ1x8K9LPFM4XSu11m7uCfLUSE4SEjL30w3ockFvwAcuJffCUwtSpbjr34cSTD7EFG1Jqk9Gg0fQCKvPaU54jjMJoP2toR9fGmQV7y9fz31UVxSk97AqWZZLJBT2lmv76AgpVV0k0xtb/0VIv8pd/j6TIz9SFfsTQOugHkhyRzzhvZisiKzOAAWNX8RMpG+iqQi4p9W9VrmmiCfFDmLFnMrwhncnMsvlXB8QSJCq2irrx3HG0SJJCbS5+atz+E1iqO8QaPJ05snxv82Mf4NlZ4gZK0Pq/VvJ20lSkR+0nk+s/v3BgIyle78wjZP1vWLU4wIDAQAB',
      'merchantPrivateKey': 'MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCJakyLqojWTDAVUdNJLvuXhROV+LXymqnukBrmiWwTYnJYm9r5cKHj1hYQRhU5eiy6NmFVJqJtwpxyyDSCWSoSmIQMoO2KjYyB5cDajRF45v1GmSeyiIn0hl55qM8ohJGjXQVPfXiqEB5c5REJ8Toy83gzGE3ApmLipoegnwMkewsTNDbe5xZdxN1qfKiRiCL720FtQfIwPDp9ZqbG2OQbdyZUB8I08irKJ0x/psM4SjXasglHBK5G1DX7BmwcB/PRbC0cHYy3pXDmLI8pZl1NehLzbav0Y4fP4MdnpQnfzZJdpaGVE0oI15lq+KZ0tbllNcS+/4MSwW+afvOw9bazAgMBAAECggEAIkenUsw3GKam9BqWh9I1p0Xmbeo+kYftznqai1pK4McVWW9//+wOJsU4edTR5KXK1KVOQKzDpnf/CU9SchYGPd9YScI3n/HR1HHZW2wHqM6O7na0hYA0UhDXLqhjDWuM3WEOOxdE67/bozbtujo4V4+PM8fjVaTsVDhQ60vfv9CnJJ7dLnhqcoovidOwZTHwG+pQtAwbX0ICgKSrc0elv8ZtfwlEvgIrtSiLAO1/CAf+uReUXyBCZhS4Xl7LroKZGiZ80/JE5mc67V/yImVKHBe0aZwgDHgtHh63/50/cAyuUfKyreAH0VLEwy54UCGramPQqYlIReMEbi6U4GC5AQKBgQDfDnHCH1rBvBWfkxPivl/yNKmENBkVikGWBwHNA3wVQ+xZ1Oqmjw3zuHY0xOH0GtK8l3Jy5dRL4DYlwB1qgd/Cxh0mmOv7/C3SviRk7W6FKqdpJLyaE/bqI9AmRCZBpX2PMje6Mm8QHp6+1QpPnN/SenOvoQg/WWYM1DNXUJsfMwKBgQCdtddE7A5IBvgZX2o9vTLZY/3KVuHgJm9dQNbfvtXw+IQfwssPqjrvoU6hPBWHbCZl6FCl2tRh/QfYR/N7H2PvRFfbbeWHw9+xwFP1pdgMug4cTAt4rkRJRLjEnZCNvSMVHrri+fAgpv296nOhwmY/qw5Smi9rMkRY6BoNCiEKgQKBgAaRnFQFLF0MNu7OHAXPaW/ukRdtmVeDDM9oQWtSMPNHXsx+crKY/+YvhnujWKwhphcbtqkfj5L0dWPDNpqOXJKV1wHt+vUexhKwus2mGF0flnKIPG2lLN5UU6rs0tuYDgyLhAyds5ub6zzfdUBG9Gh0ZrfDXETRUyoJjcGChC71AoGAfmSciL0SWQFU1qjUcXRvCzCK1h25WrYS7E6pppm/xia1ZOrtaLmKEEBbzvZjXqv7PhLoh3OQYJO0NM69QMCQi9JfAxnZKWx+m2tDHozyUIjQBDehve8UBRBRcCnDDwU015lQN9YNb23Fz+3VDB/LaF1D1kmBlUys3//r2OV0Q4ECgYBnpo6ZFmrHvV9IMIGjP7XIlVa1uiMCt41FVyINB9SJnamGGauW/pyENvEVh+ueuthSg37e/l0Xu0nm/XGqyKCqkAfBbL2Uj/j5FyDFrpF27PkANDo99CdqL5A4NQzZ69QRlCQ4wnNCq6GsYy2WEJyU2D+K8EBSQcwLsrI7QL7fvQ==',
      'initialize_url': 'http://sandbox.mynagad.com:10080/remote-payment-gateway-1.0/api/dfs/check-out/initialize/',
      'complete_payment_url': 'http://sandbox.mynagad.com:10080/remote-payment-gateway-1.0/api/dfs/check-out/complete/',
      'payment_verification_url': 'http://sandbox.mynagad.com:10080/remote-payment-gateway-1.0/api/dfs/verify/payment/',
    }
  }
};
