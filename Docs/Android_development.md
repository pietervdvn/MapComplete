# Creating an APK from the code

We are using capacitor. This is a tool which packages some files into an Android shell.

## Developing

0. `nvm use` to make sure your using the correct android version
1. Build all the necessary files.
   a. If no layer/theme changes were made, `npm run build` is sufficient
   b. Otherwise, run `npm run prepare-deploy`.
2. All the web assets will now be in `dist/`
3. Run `scripts/prepareAndroid.sh`
4. Switch to Android Studio, open the subproject "Android" in it
