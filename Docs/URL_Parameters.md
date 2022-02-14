

 URL-parameters and URL-hash 
=============================



## Table of contents

1. [URL-parameters and URL-hash](#url-parameters-and-url-hash)
  - [What is a URL parameter?](#what-is-a-url-parameter)
  - [fs-userbadge](#fs-userbadge)
  - [fs-search](#fs-search)
  - [fs-background](#fs-background)
  - [fs-filter](#fs-filter)
  - [fs-add-new](#fs-add-new)
  - [fs-welcome-message](#fs-welcome-message)
  - [fs-iframe-popout](#fs-iframe-popout)
  - [fs-more-quests](#fs-more-quests)
  - [fs-share-screen](#fs-share-screen)
  - [fs-geolocation](#fs-geolocation)
  - [fs-all-questions](#fs-all-questions)
  - [fs-export](#fs-export)
  - [fs-pdf](#fs-pdf)
  - [backend](#backend)
  - [test](#test)
  - [debug](#debug)
  - [fake-user](#fake-user)
  - [overpassUrl](#overpassurl)
  - [overpassTimeout](#overpasstimeout)
  - [overpassMaxZoom](#overpassmaxzoom)
  - [osmApiTileSize](#osmapitilesize)
  - [background](#background)
  - [layer-&lt;layer-id&gt;](#layer-&ltlayer-id&gt;)



This document gives an overview of which URL-parameters can be used to influence MapComplete.



 What is a URL parameter? 
--------------------------



"URL-parameters are extra parts of the URL used to set the state.

For example, if the url is `https://mapcomplete.osm.be/cyclofix?lat=51.0&lon=4.3&z=5&test=true#node/1234`, the URL-parameters are stated in the part between the `?` and the `#`. There are multiple, all separated by `&`, namely: 



  - The url-parameter `lat` is `51.0` in this instance
  - The url-parameter `lon` is `4.3` in this instance
  - The url-parameter `z` is `5` in this instance
  - The url-parameter `test` is `true` in this instance


Finally, the URL-hash is the part after the `#`. It is `node/1234` in this case.



 fs-userbadge 
--------------

 Disables/Enables the user information pill (userbadge) at the top left. Disabling this disables logging in and thus disables editing all together, effectively putting MapComplete into read-only mode. The default value is _true_



 fs-search 
-----------

 Disables/Enables the search bar The default value is _true_



 fs-background 
---------------

 Disables/Enables the background layer control The default value is _true_



 fs-filter 
-----------

 Disables/Enables the filter view The default value is _true_



 fs-add-new 
------------

 Disables/Enables the 'add new feature'-popup. (A theme without presets might not have it in the first place) The default value is _true_



 fs-welcome-message 
--------------------

 Disables/enables the help menu or welcome message The default value is _true_



 fs-iframe-popout 
------------------

 Disables/Enables the extraLink button. By default, if in iframe mode and the welcome message is hidden, a popout button to the full mapcomplete instance is shown instead (unless disabled with this switch or another extraLink button is enabled) The default value is _true_



 fs-more-quests 
----------------

 Disables/Enables the 'More Quests'-tab in the welcome message The default value is _true_



 fs-share-screen 
-----------------

 Disables/Enables the 'Share-screen'-tab in the welcome message The default value is _true_



 fs-geolocation 
----------------

 Disables/Enables the geolocation button The default value is _true_



 fs-all-questions 
------------------

 Always show all questions The default value is _false_



 fs-export 
-----------

 Enable the export as GeoJSON and CSV button The default value is _false_



 fs-pdf 
--------

 Enable the PDF download button The default value is _false_



 backend 
---------

 The OSM backend to use - can be used to redirect mapcomplete to the testing backend when using 'osm-test' The default value is _osm_



 test 
------

 If true, 'dryrun' mode is activated. The app will behave as normal, except that changes to OSM will be printed onto the console instead of actually uploaded to osm.org The default value is _false_



 debug 
-------

 If true, shows some extra debugging help such as all the available tags on every object The default value is _false_



 fake-user 
-----------

 If true, 'dryrun' mode is activated and a fake user account is loaded The default value is _false_



 overpassUrl 
-------------

 Point mapcomplete to a different overpass-instance. Example: https://overpass-api.de/api/interpreter The default value is _https://overpass-api.de/api/interpreter,https://overpass.kumi.systems/api/interpreter,https://overpass.openstreetmap.ru/cgi/interpreter_



 overpassTimeout 
-----------------

 Set a different timeout (in seconds) for queries in overpass The default value is _30_



 overpassMaxZoom 
-----------------

  point to switch between OSM-api and overpass The default value is _16_



 osmApiTileSize 
----------------

 Tilesize when the OSM-API is used to fetch data within a BBOX The default value is _17_



 background 
------------

 The id of the background layer to start with The default value is _osm_



 layer-&lt;layer-id&gt; 
------------------------

 Wether or not the layer with id <layer-id> is shown The default value is _true_ 

This document is autogenerated from QueryParameters