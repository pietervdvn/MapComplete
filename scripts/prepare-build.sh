#! /usr/bin/env bash

echo "Starting prepare-build"
# The build script; we build the application step by step as building everything at once takes too much RAM
# Should be run from the repository root
# This is the main deployment script
rm -rf dist/*
rm -rf .cache
mkdir dist 2> /dev/null
mkdir dist/assets 2> /dev/null


export NODE_OPTIONS="--max-old-space-size=16384"

# This script ends every line with '&&' to chain everything. A failure will thus stop the build
npm run generate:editor-layer-index &&
npm run prep:layeroverview &&
npm run generate && # includes a single "refresh:layeroverview". Resetting the files is unnecessary as they are not in there in the first place
npm run generate:mapcomplete-changes-theme  &&
npm run refresh:layeroverview && # run refresh:layeroverview a second time to propagate all calls
npm run generate:layeroverview &&  # run refresh:layeroverview a third time to fix some issues with the favourite layer all calls

npm run generate:layouts

if [ $? -ne 0 ]; then
    echo "ERROR - stopping the build"
    exit 1
fi



BRANCH=`git rev-parse --abbrev-ref HEAD`
echo "The branch name is $BRANCH"

if [ $BRANCH = "master" ] || [ $BRANCH = "develop" ]
then
    ASSET_URL="./"
    export ASSET_URL
    echo "$ASSET_URL"
else
  # ASSET_URL="$BRANCH"
  ASSET_URL="./"
  export ASSET_URL
  echo "$ASSET_URL"
fi

# sanity check
if [[ -f "bookcases.html" ]]
then
  echo "Bookcases exists"
else
  echo "Bookcases.html does not exist - aborting"
  exit 1
fi
