#! /bin/bash
echo "Starting build"
# The build script; we build the application step by step as building everything at once takes too much RAM
# Should be run from the repository root
# This is the main deployment script
rm -rf dist/*
rm -rf .cache
mkdir dist 2> /dev/null
mkdir dist/assets 2> /dev/null

# This script ends every line with '&&' to chain everything. A failure will thus stop the build
npm run generate:editor-layer-index 
npm run generate &&
npm run test &&
npm run generate:layouts

if [ $? -ne 0 ]; then
    echo "ERROR - stopping the build"
    exit 1
fi

# Copy the layer files, as these might contain assets (e.g. svgs)
cp -r assets/layers/ dist/assets/layers/
cp -r assets/themes/ dist/assets/themes/
cp -r assets/svg/ dist/assets/svg/
cp assets/*.png dist/assets/
cp assets/*.svg dist/assets/

SRC_MAPS="--no-source-maps"
BRANCH=`git rev-parse --abbrev-ref HEAD`
echo "The branch name is $BRANCH"
if [ $BRANCH = "develop" ]
then
    SRC_MAPS=""
    echo "Source maps are enabled"
fi

if [ $BRANCH = "master" ]
then
    PUBLIC_URL="./"
else
    PUBLIC_URL="./mc/$BRANCH"
fi

echo -e "\n\n   Building non-theme pages"
echo -e "  ==========================\n\n"
parcel build --public-url "$PUBLIC_URL" $SRC_MAPS "index.html" "404.html" "professional.html" "automaton.html" "import_helper.html" "import_viewer.html" "land.html" "customGenerator.html" "theme.html" vendor
if [ $? -ne 0 ]; then
    echo "ERROR - stopping the build"
    exit 1
fi
echo -e "\n\n   Building theme pages"
echo -e "  ======================\n\n"

for file in $(ls index_*.ts)
do
    theme=${file:6:-3}
    echo -e "\n\n  $theme"
    echo -e " ------------ \n\n"
    # Builds the necessary files for just one theme, e.g. 'bookcases.html' + 'index_bookcases.ts' + supporting file
    parcel build --public-url './' $SRC_MAPS "$theme.html"
    if [ $? -ne 0 ]; then
        echo "ERROR - stopping the build"
        exit 1
    fi
done
# At last: a workaround; parcel 1.x borks the link to social images; the public-URL (./) is setup incorrectly, so we fix those
cd dist
echo -e "Fixing social images..."
for file in $(ls *.html)
do
    echo "Hi!"
    # sed -i 's!<meta content="\([^"]\+\)" property="og:image">!<meta content="./\1" property="og:image">!' $file
    # sed -i 's!<meta property="og:image" content="\([^"]\+\)">!<meta content="./\1" property="og:image">!' $file
done