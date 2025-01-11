#! /bin/bash

# Creates various empty (stub) version of files

mkdir -p ./src/assets/generated/layers
mkdir -p ./public/assets/generated/themes
echo '{"layers": []}' > ./src/assets/generated/known_layers.json
rm -f ./src/assets/generated/layers/*.json
rm -f ./public/assets/generated/themes/*.json
cp ./assets/layers/usersettings/usersettings.json ./src/assets/generated/layers/usersettings.json
echo '{}' > ./src/assets/generated/layers/favourite.json
echo '{}' > ./src/assets/generated/layers/summary.json
echo '{}' > ./src/assets/generated/layers/last_click.json
echo '{}' > ./src/assets/generated/layers/search.json
echo '[]' > ./src/assets/generated/theme_overview.json
echo '{}' > ./src/assets/generated/layers/geocoded_image.json
