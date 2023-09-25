#! /bin/bash
### To be run from the root of the repository 

# Some pointers to get started:
# apt install npm
# apt install unzip
# npm i -g csp-logger

# wget https://github.com/pietervdvn/latlon2country/raw/main/tiles.zip
# unzip tiles.zip

MAPCOMPLETE_CONFIGURATION="config_hetzner"
npm run reset:layeroverview
npm run test
cp config.json config.json.bu &&
cp ./scripts/hetzner/config.json . &&
npm run prepare-deploy &&
mv config.json.bu config.json &&
zip dist.zip -r dist/* &&
scp -r dist.zip hetzner:/root/ &&
scp ./scripts/hetzner/config/* hetzner:/root/
ssh hetzner -t "unzip dist.zip && rm dist.zip && rm -rf public/ && mv dist public && caddy stop && caddy start"
rm dist.zip
