# MapComplete

> Let a thousand flowers bloom


MapComplete attempts to be a webversion crossover of StreetComplete and MapContrib. It tries to be just as easy to use as StreetComplete, but it allows to focus on one single theme per instance (e.g. nature, bicycle infrastructure, ...)

The design goals of MapComplete are to be:

- Easy to use, both on web and on mobile
- Easy to deploy (by not having a backand)
- Easy to set up a custom theme
- Easy to fall down the rabbit hole of OSM

The basic functionality is to download some map features from Overpass and then ask certain questions. An answer is sent back to directly to OpenStreetMap.

Furthermore, it shows images present in the `image` tag or, if a `wikidata` or `wikimedia_commons`-tag is present, it follows those to get these images too.

An explicit non-goal of MapComplete is to modify geometries of ways. Although adding a point to a way or splitting a way in two parts might be added one day.

## Examples

- [Buurtnatuur.be](http://buurtnatuur.be), developed for the Belgian [Green party](https://www.groen.be/). They also funded the initial development!
- [Cyclofix](https://pietervdvn.github.io/MapComplete/index.html?layout=cyclofix), further development on [Open Summer of Code](https://summerofcode.be/) funded by [Brussels Mobility](https://mobilite-mobiliteit.brussels/en). Landing page at https://cyclofix.osm.be/
- [Bookcases](https://pietervdvn.github.io/MapComplete/index.html?quests=bookcases#element) cause I like to collect them.
- [Map of Maps](https://pietervdvn.github.io/MapComplete/index.html?layout=metamap&z=14&lat=50.650&lon=4.2668#element), after a tweet

Have a theme idea? Drop it in the [issues](https://github.com/pietervdvn/MapComplete/issues)

## User journey

MapComplete is set up to lure people into OpenStreetMap and to teach them while they are on the go, step by step.

A typical user journey would be:

0) Oh, this is a cool map of _my specific interest_! There is a lot of data already...
0a) The user might discover the explanation about OSM in the dedicated tab page
0b) The user might discover the other themes in the other tab
0c) The user might share the map and/or embed it

1) The user clicks that big tempting button 'login' in order to answer questions. The user makes an account - a big step.

2) The user answers a question! Hooray!
    When at least one question is answered (aka: having one changeset on OSM), adding a new point is unlocked
    
3) The user adds a new POI somewhere 
3a) Note that _all messages_ must be read before being able to add a point. In other words, sending a message to a misbehaving MapComplete user acts as having a zero-minutes-block. This is added deliberately to avoid new users fucking up too much

4) At 50 changesets, the custom layout becomes available
5) At 200 changesets, the tags become visible when answering questions and when adding a new point from a preset. This is to give more control to power users and to teach new users the tagging scheme
5) At 250 changesets, the tags get linked to the wiki
6) At 500 changesets, I expect users to be power users and to be comfortable with tagging scheme and such. The custom theme generator is unlocked.


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


The UI-event-source is a class where the entire system is built upon, it acts as an observable object: another object can register for changes to update when needed.


### Searching images

Images are fetched from:

- The OSM `image`, `image:0`, `image:1`, ... tags
- The OSM `wikimedia_commons` tags
- If wikidata is present, the wikidata `P18` (image) claim and, if a commons link is present, the commons images

### Uploading images

Images are uplaoded to imgur, as their API was way easier to handle. The URL is written into the changes

The idea is that one in a while, the images are transfered to wikipedia


# Privacy

Privacy is important, we try to leak as little information as possible.
All major personal information is handled by OSM.
Geolocation is available on mobile only throught hte device's GPS location (so no geolocation is sent of to google)

TODO: erase cookies of third party websites and API's

# Translating MapComplete

Help to translate mapcomplete. Fork this project, open [the file containing all translations](https://github.com/pietervdvn/MapComplete/blob/master/UI/i18n/Translations.ts), add your language and send a pull request.

# Creating your own theme

You can create [your own theme too](https://pietervdvn.github.io/MapComplete/customGenerator.html)


# Attributions:

Data from OpenStreetMap
Images from Wikipedia/Wikimedia

https://commons.wikimedia.org/wiki/File:Camera_font_awesome.svg
Camera Icon, Dave Gandy, CC-BY-SA 3.0

https://commons.wikimedia.org/wiki/File:OOjs_UI_indicator_search-rtl.svg
Search Icon, MIT

https://commons.wikimedia.org/wiki/File:Trash_font_awesome.svg
Trash icon by Dave Gandy, CC-BY-SA
 	
https://commons.wikimedia.org/wiki/File:Home-icon.svg
Home icon by Timothy Miller, CC-BY-SA 3.0

https://commons.wikimedia.org/wiki/File:Map_icons_by_Scott_de_Jonge_-_bicycle-store.svg
Bicycle logo,  	Scott de Jonge
