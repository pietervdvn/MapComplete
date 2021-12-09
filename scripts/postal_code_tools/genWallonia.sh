#! /bin/bash

# Generates data for the wallonia address dataset: convex hulls for postal code outlines, tiled address files for import

wget https://opendata.bosa.be/download/best/openaddress-bewal.zip
unzip openaddress-bewal.zip 
rm openaddress-bewal.zip 
mkdir data
mkdir tiles
mv openaddress-bewal.csv data/
ts-node openaddressestogeojson.ts data/openaddress-bewal.csv data/openaddress --per-postal-code
ts-node openaddressestogeojson.ts data/openaddress-bewal.csv data/openaddress.geojson.nljson
ts-node ../slice.ts data/openaddress.geojson.nljson 14 tiles/

