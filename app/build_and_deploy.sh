#! /bin/bash

nvm use
export NODE_OPTIONS="--max-old-space-size=8192"

npm run build:vite:app-landing

mkdir to_upload
mv dist/app/* to_upload/
cp -r .well-known/ to_upload/
mkdir -p to_upload/assets
cp dist/assets/*.js to_upload/assets/
rm -rf dist

ssh hetzner "rm -rf /root/app/"
scp -rp to_upload/ hetzner:/root/app/
scp -rp to_upload/.well-known/ hetzner:/root/app/

rm -rf to_upload
