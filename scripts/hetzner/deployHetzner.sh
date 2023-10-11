#! /bin/bash
### To be run from the root of the repository 

# Some pointers to get started:
# apt install npm
# apt install unzip
# npm i -g csp-logger

# wget https://github.com/pietervdvn/latlon2country/raw/main/tiles.zip
# unzip tiles.zip

MAPCOMPLETE_CONFIGURATION="config_hetzner"
cp config.json config.json.bu &&
cp ./scripts/hetzner/config.json . && # Copy the config _before_ building, as the config might contain some needed URLs
npm run reset:layeroverview
npm run test
npm run prepare-deploy &&
mv config.json.bu config.json &&
zip dist.zip -r dist/* &&
scp ./scripts/hetzner/config/* hetzner:/root/ &&
rsync -rzh --progress dist.zip hetzner:/root/ &&
echo "Upload completed, deploying config and booting" &&
ssh hetzner -t "unzip dist.zip && rm dist.zip && rm -rf public/ && mv dist public && caddy stop && caddy start" &&
rm dist.zip
mv config.json.bu config.json
npm run clean
