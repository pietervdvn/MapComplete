#! /bin/bash

# The build script; we build the application step by step as building everything at once takes too much RAM
# Should be run from the repository root
rm -rf dist/*
rm -rf .cache
mkdir dist 2> /dev/null

# Copy the layer files, as these might contain assets (e.g. svgs)
cp -r assets/layers/ dist/assets/layers/
cp -r assets/themes/ dist/assets/themes/
cp -r assets/svg/ dist/assets/svg/
parcel build --no-source-maps --public-url ./ "index.html" "404.html" "professional.html" "automaton.html" "land.html" "customGenerator.html" "theme.html" vendor

for file in $(ls index_*.ts)
do
    theme=${file:6:-3}
    echo $theme
    # Builds the necessary files for just one theme, e.g. 'bookcases.html' + 'index_bookcases.ts' + supporting file
    # npm run generate && node --max_old_space_size=12000 $(which parcel)  build 
    parcel build --no-source-maps --public-url ./ "$theme.html" 
done