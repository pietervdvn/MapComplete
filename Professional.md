

What about vandalism?
---------------------

As anyone can edit the data, it is indeed possible that a malicious change is made. However, this is extremely rare for a few reasons:

- the technical barrier to make changes is high
- a small malicious change has low impact, thus little reward for a vandal
- a high impact change is quickly noticed and reverted since so many people use this data
- all changes are tracked and tied to a single user. A repeating offender is quickly banned
- In Belgium (and some other countries), the first edit by a new contributor is systematically checked and corrected if needed.


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

MapComplete is an easy to use _survey_ tool. It is ideal to collect the necessary in a few clicks, both on desktop and on mobile. This data is contributed directly into OpenStreetMap.

We can setup a custom survey tool, asking precisely the data you need in a future-proof way.

Do you have a dataset that has to be (re)surveyed?

This is the ideal moment to add those to OpenStreetMap directly.
MapComplete can show your dataset and OpenStreetMap at the same time, making it easier to visit all the locations and to see what the community already contributed.



Using the data in internal processes
------------------------------------

Your MapComplete theme can have a convenient _export_-button, offering to download the data in open formats usable in QGis, ArcGis, Excell, LibreOffice-calc, ...
Someone with basic spreadsheet-skills can thus easily create graphs and insights about the data, whereas the GIS-experts within your organisations can easily work with this data in their preferred program.

The data can also be retrieved for free via an API-call if an automated setup is needed.


Some drawbacks
===========================

While joining this community has tremendous benefits, there are a few topics to carefully consider.

## Data not suited for OpenStreetMap

The basic rule for OpenStreetMap is that all data must be verifiable on the ground and are somewhat permanent.

This implies that some data _cannot_ be sent to OpenStreetMap directly - but some workarounds exist.

- Subjective data (such as reviews) are not suited for OpenStreetMap. However, MapComplete has an integration with Mangrove.reviews, an openly licensed review website
- Events of a few days, road works that are planned next month are thus _not_ recorded, neither are road works which only last a few days.
- Temporal data (e.g. statistics of air quality, traffic intensity, ...) can not stored on OpenStreetMap as they are hard to verify by a volunteer. Note that, if this data is available elsewhere, it can still be visualized though.


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

