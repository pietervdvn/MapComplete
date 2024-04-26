#! /bin/bash
### To be run from the root of the repository
### Prepares and builds MapComplete, uploads it to hetzner for hosted.mapcomplete.org. Will upload about 500MB to this computer

# Some pointers to get started:
# apt install npm
# apt install unzip
# npm i -g csp-logger

# wget https://github.com/pietervdvn/latlon2country/raw/main/tiles.zip
# unzip tiles.zip

cp config.json config.json.bu &&
cp ./scripts/hetzner/config.json . && # Copy the config _before_ building, as the config might contain some needed URLs
npm run reset:layeroverview
npm run test &&
npm run prepare-deploy &&
zip dist.zip -r dist/* &&
mv config.json.bu config.json &&
scp ./Docs/ServerConfig/hetzner/* hetzner:/root/ &&
rsync -rzh --progress dist.zip hetzner:/root/ &&
echo "Upload completed, deploying config and booting" &&
ssh hetzner -t "unzip dist.zip && rm dist.zip && rm -rf public/ && mv dist public && caddy stop && caddy start" &&
rm dist.zip
npm run clean
