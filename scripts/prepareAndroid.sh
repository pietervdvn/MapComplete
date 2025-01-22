#! /bin/bash

# Copy all necessary files from the 'dist' directory into dist full
# To be executed from the `MapComplete` repo root
nvm use
if [[ ! -f bookcases.html ]]
then
  npm run generate:layeroverview
  npm run generate:layouts
fi

npm run build
echo '''
import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "org.mapcomplete",
  appName: "MapComplete",
  webDir: "dist-full"
};

export default config;
''' > capacitor.config.ts

# copy distribution files
rm -rf dist-full
mkdir dist-full
cp dist/*.html dist-full/
cp dist/*.css dist-full/
# cp dist/*.webmanifest dist-full/ # Not needed
cp -r dist/css dist-full/

mkdir dist-full/assets
mkdir dist-full/assets/generated

cp dist/assets/*.js dist-full/assets
cp dist/assets/*.svg dist-full/assets
cp dist/assets/*.woff dist-full/assets
cp dist/assets/*.ttf dist-full/assets
cp dist/assets/*.png dist-full/assets
cp dist/assets/*.json dist-full/assets
cp dist/assets/*.css dist-full/assets

cp -r dist/assets/data dist-full/assets/
cp -r dist/assets/docs dist-full/assets/
cp -r dist/assets/fonts dist-full/assets/
cp -r dist/assets/langs dist-full/assets/
cp -r dist/assets/layers dist-full/assets/
cp -r dist/assets/png dist-full/assets/
cp -r dist/assets/svg dist-full/assets/
cp -r dist/assets/templates dist-full/assets/
cp -r dist/assets/generated/themes/ dist-full/assets/generated/
cp -r dist/assets/themes dist-full/assets/
# mkdir dist-full/assets/generated
nvm use

# assets/icon-only.png will be used as the app icon
# See https://capacitorjs.com/docs/guides/splash-screens-and-icons
npx capacitor-assets generate

npx cap sync
cd android
echo "All done! Don't forget to click 'gradle sync files' in Android Studio"
tput bel
tput bel
