#! /bin/bash

ts-node GenerateSeries.ts
# Move to the root of the repo
cd ../..
cd ../MapComplete-data
git pull
cd -
ts-node scripts/slice.ts Docs/Tools/centerpoints.geojson 8 ../MapComplete-data/mapcomplete-changes/
cd -
git add mapcomplete-changes/*
git commit -am "New changeset data"
git push
