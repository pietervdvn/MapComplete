Professional support with MapComplete
==========

What can MapComplete do for your organisation?
----

Maintaining a set of up-to-date geodata is hard, error prone and expensive.

To add insult to injury, many organizations end up collecting the same data independently - resulting in duplicated efforts, non-standardized data formats and many incomplete datasets.

At the same time, there is a huge community which gathers a lot of geodata into one shared and standardized database - namely OpenStreetMap.org.
This dataset has a very liberal license which allows for infinite reuse but can be hard to edit, especially for non-technical users as most OpenStreetMap editors show _all_ data at once.
A user who wishes to update information on their topic of choice (e.g. a bench, a shop, a waste basket, ...) is confronted with every street, every building and every other feature nearby.

MapComplete is the in-between solution, offering a more traditional map focused on just one topic while offering powerful editing capabilities disguised as simple-to-use building blocks. 

What data can be found in OpenStreetMap?
=====

OpenStreetMap is a shared, global database, built by volunteers. All geodata can be contributed to OpenStreetMap, as long as **it can be verified on the ground**.

OpenStreetMap has grown to be a very broad and deep dataset as it contains data over thousands of categories of objects.
An individual object might also have a ton of attributes, bringing a lot of nuance, e.g.:

- Streets have geometry, but might also have information about the maxspeed, surface, wether they are lit, their name, a link to Wikipedia, a link to what they are named after, which hiking-, cycle- and busroutes run over theme
- Shops and other amenities might have opening hours, a phone number, a link to the website, which payment methods are supported, what they sell, which services they offer, ...
- Toilets might have information about wheelchair accessibility, a changing table, if payment is needed, ...
- and much, much more...

Using MapComplete in your organization
=========

If an existing MapComplete theme is what you need to survey data or to show on your website, feel free to embed it.
Embedding those is free and will always be.

Do you need some other data, but does the theme not exist yet? The MapComplete-developers can build it for you on a decent budget. Get in touch via [email](mailto:pietervdvn@posteo.net), [github](https://github.com/pietervdvn/MapComplete/issues) or [send a message via osm.org](https://www.openstreetmap.org/message/new/Pieter%20Vander%20Vennet)

If you still feel unsure, the possibilities are outlined below. Additionally, some common questions are answered

 What data can be shown with MapComplete?
--------

MapComplete has a powerful templating system, which allows to quickly create a map showing precisely those features that you need and showing relevant attributes in the popups.

This data can be fetched from OpenStreetMap directly, but MapComplete can also use external datasets - 
e.g. to compare OpenStreetMap with another dataset or to show data that is not suited for OpenStreetMap (planned activities, statistics, ...)


What are the survey possibilities?
----

MapComplete also is an easy to use survey tool. It is ideal to collect the necessary data in a few clicks, both on desktop and on mobile.

We can setup a custom survey tool, asking precisely the data you need in a future-proof way.

Do you have a dataset that has to be (re)surveyed?

This is the ideal moment to add those to OpenStreetMap directly.
MapComplete can show your dataset and OpenStreetMap at the same time, making it easier to visit all the locations and to see what the community already contributed.


Benefits of the OSM-ecosystem!
-----

It can be very hard to leave your own dataset behind, as building this dataset often took a lot of time and effort.

However, the benefits of switching over to OSM are huge:

- You are not alone anymore to gather and maintain this dataset - a whole community is at your side
- Your data will reach a bigger audience then ever via Bing Maps, Apple Maps, Facebook, Instagram, Pokemon Go, OsmAnd, Organic Maps, Maps.me, Mapbox, Komoot, nearly all cycle-applications, ...
- Many governement organisations and municipalities use OpenStreetMap on their websites too

What about vandalism?
---------------------

As anyone can edit the data, it is indeed possible that a malicious change is made. However, this is extremely rare for a few reasons:

- the technical barrier to make changes is high
- a small malicious change has low impact, thus little reward for a vandal
- a high impact change is quickly noticed and reverted since so many people use this data
- all changes are tracked and tied to a single user. A repeating offender is quickly banned
- In Belgium (and some other countries), the first edit by a new contributor is systematically checked and corrected if needed.


Using the data in internal processes
------------------------------------

Your MapComplete theme can have a convenient _export_-button, offering to download the data in open formats usable in QGis, ArcGis, Excell, LibreOffice-calc, ...
Someone with basic spreadsheet-skills can thus easily create graphs and insights about the data, whereas the GIS-experts within your organisations can easily work with this data in their preferred program.

The data can also be retrieved for free via an API-call if an automated setup is needed.

Some drawbacks
===========================

While joining this community has tremendous benefits, there are a few topics to carefully consider.

### Data not suited for OpenStreetMap

MapComplete is built to upload data changes to OpenStreetMap, which needs verifiability.

This implies that some data _cannot_ be sent to OpenStreetMap directly - but some workarounds exist.

- Subjective data (such as reviews) are not suited for OpenStreetMap. However, MapComplete has an integration with Mangrove.reviews, an openly licenses review website
- OpenStreetMap only gathers on features that are somewhat permanent and are visible on the ground. Road works that are planned next month are thus _not_ recorded, neither are road works which only last a few days.
- Temporal data (e.g. statistics of air quality, traffic intensity, ...) can not stored on OpenStreetMap as they are hard to verify by a volunteer. _MapComplete can still visualize this data, if provided in a compatible format though_


### Licensing nuances

OpenStreetMap uses the Open Database License. If a contributor adds data to OpenStreetMap, this data will be republished under this license, which states that:

1. All data can be reused for any purpose - including commercial purposes
2. Applications or products using OpenStreetMap should give a clear copyright notice
3. Any dataset or product which contains OpenStreetMap-data must be republished under ODbL too, including modifications to this dataset and in a usable format.

This has a few implications which should be considered for some usecases:

#### Making a map from different data sources

For example, one could make a map with all benches in some city, based on the benches known by OpenStreetMap. This printed map needs a clear statement that the map data is based on OpenStreetMap.
Selling these maps is permitted.

If the mapmaker notices that the benches are missing in some area and adds them on the printed map, the data on the missing benches are automatically open data too. This means that an OpenStreetMap-contributor is allowed to take the paper map and use it to add the missing benches back into OpenStreetMap.
This contributor also has the right to ask for the dataset of the missing benches, which should be provided too.

Of course, a map with only benches can be boring. The mapmaker might also decide to add in a layer with shops, possibly sourced from another geodata provider under another license.
This is permitted to, if the map clearly states that the benches are sourced from OSM (under ODBL) and the shops have a different source (eventually with an all rights reserved).

However, mixing two datasets into one undistinguishible layer might not be permitted. For example, the mapmaker migth find that OSM has excellent data on benches in one part of the city and the closed-source provider might have excellent data on benches in another part of the city, merging these datasets into one could be problematic:
the open license would require the modifications to be openly republished, whereas the all-rights-reserved license would prohibit this.


#### Gathering open data

MapComplete is an excellent way to create Open Data, also in the setting of a government.
However, the ODBL is slightly more restrictive then a public domain license giving a licensing issue.

If you have a legal requirement to republish data as _public data_, MapComplete can still be used as data gathering tool using OpenStreetMap infastructure. In this case, the contributors using your custom built theme can opt-in to publish their edits into the _public domain_ instead of using the ODbL.

