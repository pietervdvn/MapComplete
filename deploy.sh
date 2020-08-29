#! /bin/bash

mkdir assets/generated
ts-node createLayouts.ts
find -name '*.png' | parallel optipng '{}'
npm run build
rm -rf /home/pietervdvn/git/pietervdvn.github.io/MapComplete/*
cp -r dist/* /home/pietervdvn/git/pietervdvn.github.io/MapComplete/

cd /home/pietervdvn/git/pietervdvn.github.io/MapComplete/
# git add . && git commit -m "New mapcomplete version" &&git push
cd -
# clean up the mess we made
 # rm *.js
 # rm Logic/*.js
 # rm Logic/*.js
 # rm Logic/*/*.js
 # rm Logic/*/*/*.js
 # rm UI/*.js
 # rm UI/*/*.js
 # rm UI/*/*/*.js
 # rm Customizations/*.js
 # rm Customizations/*/*.js
 # rm Customizations/*/*/*.js

rm *.webmanifest
rm assets/generated/*

for f in ./*.html; do
    if [[ "$f" == "./index.html" ]] || [[ "$f" == "./land.html" ]] || [[ "$f" == "./test.html" ]] || [[ "$f" == "./preferences.html" ]] || [[ "$f" == "./customGenerator.html" ]]
    then
        echo "Not removing $f"
    else
        rm $f
    fi
done
