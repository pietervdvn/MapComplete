#! /bin/bash
rm *.js
rm Logic/*.js
rm Logic/*.js
rm Logic/*/*.js
rm Logic/*/*/*.js
rm UI/*.js
rm UI/*/*.js
rm UI/*/*/*.js
rm Customizations/*.js
rm Customizations/*/*.js
rm Customizations/*/*/*.js

rm *.webmanifest
rm q*.html
rm assets/generated/*

for f in ./*.html; do
    if [[ "$f" == "./index.html" ]] || [[ "$f" == "./land.html" ]] || [[ "$f" == "./test.html" ]]
    then
        echo "Not removing $f"
    else
        rm $f
    fi
done