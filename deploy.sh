#! /bin/bash

cd assets/
wget https://osmlab.github.io/editor-layer-index/imagery.geojson --output-document=editor-layer-index.json
cd ..

mkdir -p assets/generated
ts-node createLayouts.ts || { echo 'Creating layouts failed' ; exit 1; }
find -name '*.png' | parallel optipng '{}'
npm run build || { echo 'Npm build failed' ; exit 1; }

rm -rf .cache

if [[ $1 == "groen" ]]
then
    echo "DEPLOYING TO BUURTNATUUR!"
    mv /home/pietervdvn/git/buurtnatuur.github.io/CNAME /home/pietervdvn/git/
    mv /home/pietervdvn/git/buurtnatuur.github.io/.git /home/pietervdvn/git/
    rm -rf /home/pietervdvn/git/buurtnatuur.github.io/*
    cp -r dist/* /home/pietervdvn/git/buurtnatuur.github.io/
    mv /home/pietervdvn/git/CNAME /home/pietervdvn/git/buurtnatuur.github.io/
    mv /home/pietervdvn/git/.git /home/pietervdvn/git/buurtnatuur.github.io/
    cd /home/pietervdvn/git/buurtnatuur.github.io/
elif [[ $1 == "production" ]]
then
    echo "DEPLOYING TO MAPCOMPLETE"
    rm -rf /home/pietervdvn/git/pietervdvn.github.io/MapComplete/*
    cp -r dist/* /home/pietervdvn/git/pietervdvn.github.io/MapComplete/
    cd /home/pietervdvn/git/pietervdvn.github.io/MapComplete/
else
    echo "Testversion deploy"
    rm -rf /home/pietervdvn/git/pietervdvn.github.io/Staging/*
    cp -r dist/* /home/pietervdvn/git/pietervdvn.github.io/Staging/
    cd /home/pietervdvn/git/pietervdvn.github.io/Staging/
fi

git add *
git commit -am "New mapcomplete version"
git push
cd -
./clean.sh

echo "DEPLOYED $1"
