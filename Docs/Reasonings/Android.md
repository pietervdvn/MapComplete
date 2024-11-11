# Android experiments

This document keeps track of the approaches used to implement https://github.com/pietervdvn/MapComplete/issues/2112

It is espacially used to document the dead ends

## 1. Bubblewrap

Guide: https://developers.google.com/codelabs/pwa-in-play#1

TODO: add "shortcuts" to the web manifest: https://web.dev/articles/app-shortcuts
TODO: add "screenshots" to the web manifest
Keystore: /home/pietervdvn/git/MapComplete-android-bubblewrap/android.keystore

### To build and deploy the latest version

bubblewrap build
adb install app-release-signed.apk

### Results

Quick to setup, but opens in Fennec/Brave/some default browser... _with_ a UI Element

Seems to only support chrome

## 2. Capacitor

Seemingly works. Some drawbacks: 

- Geolocation plugin relies on Google Play Services (but this can be fixed)
- Login doesn't work out of the box (but this can be fixed)

## 3. Svelte Native

Svelte native is unmaintained. The example projects are from 5 years ago.
I didn't look very hard, but I didn't see a lot of apps using this tech
