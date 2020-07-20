#! /bin/bash

npm run build
rm -rf /home/pietervdvn/git/pietervdvn.github.io/MapComplete/*
cp -r dist/* /home/pietervdvn/git/pietervdvn.github.io/MapComplete/
cd /home/pietervdvn/git/pietervdvn.github.io/MapComplete/
git add .
git commit -m "New mapcomplete version"
git push
