#! /bin/bash

# Creates the build for just a single theme
export NODE_OPTIONS="--max-old-space-size=12000"
THEME=$1
if [ $# -eq 0 ]
  then
    echo "No arguments given. Expected a themename"
fi

npm run prep:layeroverview
npm run refresh:layeroverview
npm run generate:layeroverview
npm run test
npm run generate:layouts

if [[ -f "$THEME.html" ]]
then
    echo "$THEME.html found."
else
  pwd
  ls
  echo "Theme '$THEME' not found. Did you run 'npm run generate:layouts'? Is the theme name correct?"
  exit 1
fi

echo "Building theme $THEME"
rm -rf dist/*

cp vite.config.js vite_single.config.js

if [ -f index.bu.html ]
then
  echo "Backup already exists"
else
  cp index.html index.bu.html
fi

rm index.html
cp "$THEME.html" index.html

sed -i "s/input,/input: {index:\".\/index.html\", land: \".\/land.html\"}/" vite_single.config.js
sed -i "s/\/\/ LAYOUT.ADD_CONFIG/layout.enableMoreQuests = false/" index_"$THEME".ts


export NODE_OPTIONS=--max-old-space-size=20000
vite build --sourcemap --config vite_single.config.js || { echo 'Vite build failed' ; exit 1; }


cp -r assets/layers/ dist/assets/layers/
cp -r assets/themes/ dist/assets/themes/
cp -r assets/svg/ dist/assets/svg/
cp -r assets/png/ dist/assets/png/
mkdir dist/assets/langs
mkdir dist/assets/langs/layers
cp -r langs/layers/ dist/assets/langs/
ls dist/assets/langs/layers/
export NODE_OPTIONS=""
rm vite_single.config.js



mkdir "dist_$THEME"
cp -r dist/* "dist_$THEME"


cd "dist_$THEME" || exit 1
mv "$THEME.webmanifest" manif
rm *.webmanifest
mv manif "$THEME.webmanifest"

rm -rf assets/docs/
cd assets/generated/images/ || exit
pwd
ls .
for f in *
do
  case "$f" in
    *$THEME* )
    echo "Keeping $f"
    ;;
  *)
    rm "$f"
    # echo "Not keeping $f"
  esac

done
cd -

cd ..

if [ -f index.bu.html ]
then
  rm index.html
  mv index.bu.html index.html
fi
npm run clean

echo "BUILD COMPLETED"
echo "On what domain will you deploy?"
echo "  ! Don't forget to add `https://yourdomain.tld/land.html` to the Redirect URIs on https://www.openstreetmap.org/oauth2/applications/"
echo "Deploying on github pages?"
echo " 1. Don't forget to add a CNAME file (containing your domain name verbatim, without protocol)"
echo " 2 .nojekyll file (which is empty)"
