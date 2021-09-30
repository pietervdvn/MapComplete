Release Notes
=============

Some highlights of new releases.

0.10
----

The 0.10 version contains a lot of refactorings on various core of the application, namely in the rendering stack, the fetching of data and uploading.

Some highlights are:

1. The addition of fallback overpass servers
2. Fetching data from OSM directly (especially useful in the personal theme)
3. Splitting all the features per tile (with a maximum amount of features per tile, splitting further if needed), making everything a ton faster
4. If a tile has too much features, the featuers are not shown. Instead, a rectangle with the feature amount is shown.

Furthermore, it contains a few new themes and theme updates:

- Restaurants and fast food
- Pubs and cafés
- Charging stations got a major overhaul - thanks for all the input on the available plugs
- Observation towers and binoculars
- The addition of a hackerspace theme (as made on SOTM)

Other various small improvements:

- The filter state is now exposed in the URL, so can be shared
- Lots of other fixes, as usual

0.8 and 0.9
-----------

Addition of filters per layer
Addition of a download-as-pdf for select themes
Addition of a download-as-geojson and download-as-csv for select themes

...


0.7.0
-----

* New theme: Hailhydrant by @GoWIN/Erwin Olario
* Tags now include metainformation by default - see [CalculatedTags.md]
* Add a membership-function in the calculated tags - useful to add 'part of walking route XXX' on a way
* Fix login when the token has been revoked
* First, experimental support for tiled geojson layers + scripts to generate those layers (see the speelplekken-theme)
* Add a global override
* Ton's of bug fixes
