#! /bin/bash

cd ~/Downloads

for F in *.osm.pbf
do
 LATEST="$F"
done
mv "$LATEST" ~/data/planet-latest.osm.pbf
cd ~/data
osm2pgsql -O flex -S build_db.lua -s --flat-nodes=import-help-file -d postgresql://user:password@localhost:5444/mapcomplete-cache planet-latest.osm.pbf
echo "on_data_downloaded.sh has finished!"
