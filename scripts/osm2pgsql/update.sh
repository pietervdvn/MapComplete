#! /bin/bash

# Full database update. DOwnload latest from planet.osm.org, build update script, setup and seed it
nvm use
npm run init # contains a 'npm run generate, which builds the layers'
npm run generate:buildDbScript
mv build_db.lua ~/data/
TIMESTAMP=$(osmium fileinfo ~/data/planet-latest.osm.pbf -g header.option.timestamp)
DATE=$(echo $TIMESTAMP | sed "s/T.*//")
echo $DATE
npm run create:database -- -- ${DATE/T.*//}

cd ~/data || exit
rm planet-latest.osm.pbf
wget https://planet.osm.org/pbf/planet-latest.osm.pbf

rm seeddb.log
osm2pgsql -O flex -S build_db.lua -s --flat-nodes=import-help-file -d postgresql://user:password@localhost:5444/osm-poi planet-latest.osm.pbf >> seeddb.log

# To see the progress
# tail -f seeddb.log

cd ~/git/MapComplete || exit
npm run delete:database:old
nohup npm run server:summary >> summary_server.log &
cd - || exit

# Restart tileserver
export DATABASE_URL=postgresql://user:password@localhost:5444/osm-poi.${DATE}
nohup ./pg_tileserv >> pg_tileserv.log &
