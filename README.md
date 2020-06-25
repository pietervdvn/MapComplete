# MapComplete

MapComplete attempts to be a webversion of StreetComplete.

The design goals of MapComplete are to be:

- Easy to use
- Easy to deploy
- Easy to modify

The basic functionality is to download some map features with overpass and then ask certain questions. An answer is sent back to OpenStreetMap.

Furthermore, it shows images present in the `image` tag or, if a `wikidata` or `wikimedia_commons`-tag is present, it follows those to get these images too

## License

GPL + pingback.

I love it to see where the project ends up. You are free to reuse the software (under GPL) but, when you have made your own change and are using it, I would like to know about it. Drop me a line, give a pingback in the issues, ...

## Dev

To develop:

1. Install `npm`.
2. Run `npm install` to install the dependencies
3. Run `npm run start` to build and host a local testversion

To deploy:

0. `rm -rf dist/` to remove the local build
1. `npm run build`
2. copy the entire `dist` folder to where you host your website. Visiting `index.html` gives you the website

## Architecture

### High-level overview

The website is purely static. This means that there is no database here, nor one is needed as all the data is kept in OpenStreetMap or Wikimedia (for images).

When viewing, the data is loaded from overpass. The data is then converted (in the browser) to geojson, which is rendered by Leaflet. 

When a map feature is clicked, a popup shows the information, images and questions that are relevant for that object.
The answers given by the user are sent (after a few seconds) to OpenStreetMap directly - if the user is logged in. If not logged in, the user is prompted to do so. 


### Searching images

Images are fetched from:

- The OSM `image`, `image:0`, `image:1`, ... tags
- The OSM `wikimedia_commons` tags
- If wikidata is present, the wikidata `P18` (image) claim and, if a commons link is present, the commons images

### Uploading images

Images are uplaoded to imgur, as their API was way easier to handle. The URL is written into the changes

The idea is that one in a while, the images are transfered to wikipedia