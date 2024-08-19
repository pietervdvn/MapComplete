#! /bin/bash

# Full database update. DOwnload latest from planet.osm.org, build update script, setup and seed it

npm run init
npm run generate
npm run refresh:layeroverview
npm run generate:buildDbScript
mv build_db.sh ~/data/
TIMESTAMP=$(osmium fileinfo planet-latest.osm.pbf -g header.option.timestamp)
DATE=$(echo $TIMESTAMP | sed "s/T.*//")
vite-node scripts/osm2pgsql/createNewDatabase.ts -- ${DATE/T.*//}

cd ~/data || exit
rm planet-latest.osm.pbf
wget https://planet.osm.org/pbf/planet-latest.osm.pbf

rm seeddb.log
nohup osm2pgsql -O flex -S build_db.lua -s --flat-nodes=import-help-file -d postgresql://user:password@localhost:5444/osm-poi planet-latest.osm.pbf >> seeddb.log

# To see the progress
# tail -f seeddb.log

# Restart tileserver
export DATABASE_URL=postgresql://user:password@localhost:5444/osm-poi.${DATE}
nohup ./pg_tileserv >> pg_tileserv.log &
