#! /bin/bash
: '
echo "Starting build.Should"
# The build script; we build the application step by step as building everything at once takes too much RAM
# Should be run from the repository root
rm -rf dist/*
rm -rf .cache
mkdir dist 2> /dev/null
mkdir dist/assets 2> /dev/null

npm run generate
npm run test
npm run generate:editor-layer-index 
npm run generate:layouts

# Copy the layer files, as these might contain assets (e.g. svgs)
cp -r assets/layers/ dist/assets/layers/
cp -r assets/themes/ dist/assets/themes/
cp -r assets/svg/ dist/assets/svg/
echo -e "\n\n   Building non-theme pages"
echo -e "  ==========================\n\n"
parcel build --public-url "./"  --no-source-maps "index.html" "404.html" "professional.html" "automaton.html" "land.html" "customGenerator.html" "theme.html" vendor
echo -e "\n\n   Building theme pages"
echo -e "  ======================\n\n"

for file in $(ls index_*.ts)
do
    theme=${file:6:-3}
    echo -e "\n\n  $theme"
    echo -e " ------------ \n\n"
    # Builds the necessary files for just one theme, e.g. 'bookcases.html' + 'index_bookcases.ts' + supporting file
    # npm run generate && node --max_old_space_size=12000 $(which parcel)  build 
    parcel build --public-url './' --no-source-maps "$theme.html" 
done
'
# At last: a workaround; parcel 1.x borks the link to social images; the public-URL (./) is setup incorrectly, so we fix those
cd dist
echo -e "Fixing social images..."
for file in $(ls *.html)
do
    sed -i 's!<meta content="\([^"]\+\)" property="og:image">!<meta content="./\1" property="og:image">!' $file
    sed -i 's!<meta property="og:image" content="\([^"]\+\)">!<meta content="./\1" property="og:image">!' $file
done