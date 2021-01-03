#!/usr/bin/env bash
export PATH=$PATH:/root/.nvm/versions/node/v10.6.0/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

node -v 
npm i 
pm2 delete bitcommerceApi
pm2 start npm --no-automation --name bitcommerceApi -- run prod:server

