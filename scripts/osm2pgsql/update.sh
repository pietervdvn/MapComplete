#! /bin/bash

npm run generate:buildDbScript
mv build_db.sh ~/data/
transmission-cli https://planet.osm.org/pbf/planet-latest.osm.pbf.torrent -f ./on_data_downloaded.sh &>nohup_transmission.log
