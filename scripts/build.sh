#! /usr/bin/env bash

echo "Starting build"
# The build script; we build the application step by step as building everything at once takes too much RAM
# Should be run from the repository root
# This is the main deployment script


# sanity check
if [[ -f "bookcases.html" ]]
then
  echo "Bookcases theme exists"
else
  echo "Bookcases.html does not exist - aborting"
  exit 1
fi

# sanity check
if [[ -f "waste.html" ]]
then
  echo "Waste theme exists"
else
  echo "waste.html does not exist - aborting"
  exit 1
fi

cp node_modules/name-suggestion-index/dist/nsi.min.json public/assets/data/nsi
cp node_modules/name-suggestion-index/dist/wikidata.min.json public/assets/data/nsi
vite-node scripts/nsiLogos.ts -- patch

export NODE_OPTIONS=--max-old-space-size=20000
which vite
vite --version
vite build --sourcemap || { echo 'Vite build failed' ; exit 1; }
# Copy the layer files, as these might contain assets (e.g. svgs)
cp -r assets/layers/ dist/assets/layers/
cp -r assets/themes/ dist/assets/themes/
cp -r assets/svg/ dist/assets/svg/
cp -r assets/png/ dist/assets/png/
mkdir dist/assets/langs
mkdir dist/assets/langs/layers
cp -r langs/layers/ dist/assets/langs/
ls dist/assets/langs/layers/
export NODE_OPTIONS=""
