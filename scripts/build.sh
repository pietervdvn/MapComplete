#! /bin/bash

echo "Starting build.Should"
# The build script; we build the application step by step as building everything at once takes too much RAM
# Should be run from the repository root
rm -rf dist/*
rm -rf .cache
mkdir dist 2> /dev/null
mkdir dist/assets 2> /dev/null

# Copy the layer files, as these might contain assets (e.g. svgs)
cp -r assets/layers/ dist/assets/layers/
cp -r assets/themes/ dist/assets/themes/
cp -r assets/svg/ dist/assets/svg/
echo "\n\n   Building non-theme pages"
echo "  ==========================\n\n"
parcel build --public-url './' --no-source-maps "index.html" "404.html" "professional.html" "automaton.html" "land.html" "customGenerator.html" "theme.html" vendor
echo "\n\n   Building theme pages"
echo "  ======================\n\n"

for file in $(ls index_*.ts)
do
    theme=${file:6:-3}
    echo "\n\n  $theme"
    echo " ------------ \n\n"
    # Builds the necessary files for just one theme, e.g. 'bookcases.html' + 'index_bookcases.ts' + supporting file
    # npm run generate && node --max_old_space_size=12000 $(which parcel)  build 
    parcel build --public-url './' --no-source-maps "$theme.html" 
done

# Optimize images
cd dist/ &&  find -name '*.png' -exec optipng '{}' \; && echo 'PNGs are optimized'
