#! /bin/bash

npm run init
npm run generate
npm run refresh:layeroverview
npm run generate:buildDbScript
mv build_db.sh ~/data/
transmission-cli https://planet.osm.org/pbf/planet-latest.osm.pbf.torrent -f ./on_data_downloaded.sh &>nohup_transmission.log
