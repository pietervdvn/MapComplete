#!/bin/bash
# to be run from the repo root
nvm use
npm run generate:layeroverview
./scripts/prepareAndroid.sh

cd android
./gradlew assemble

# Output location of the apk:
# MapComplete/android/app/build/outputs/apk/release/app-release-unsigned.apk
