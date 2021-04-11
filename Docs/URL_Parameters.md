custom-css
------------
If specified, the custom css from the given link will be loaded additionaly

test
------
If true, 'dryrun' mode is activated. The app will behave as normal, except that changes to OSM will be printed onto the console instead of actually uploaded to osm.org
The default value is _false_

layout
--------
The layout to load into MapComplete

userlayout
------------

The default value is _false_

layer-control-toggle
----------------------
Whether or not the layer control is shown
The default value is _false_

tab
-----
The tab that is shown in the welcome-message. 0 = the explanation of the theme,1 = OSM-credits, 2 = sharescreen, 3 = more themes, 4 = about mapcomplete (user must be logged in and have >50 changesets)
The default value is _0_

z
---
The initial/current zoom level
The default value is set by the loaded theme

lat
-----
The initial/current latitude
The default value is set by the loaded theme

lon
-----
The initial/current longitude of the app
The default value is set by the loaded theme

fs-userbadge
--------------
Disables/Enables the user information pill (userbadge) at the top left. Disabling this disables logging in and thus disables editing all together, effectively putting MapComplete into read-only mode.
The default value is _true_

fs-search
-----------
Disables/Enables the search bar
The default value is _true_

fs-layers
-----------
Disables/Enables the layer control
The default value is _true_

fs-add-new
------------
Disables/Enables the 'add new feature'-popup. (A theme without presets might not have it in the first place)
The default value is _true_

fs-welcome-message
--------------------
Disables/enables the help menu or welcome message
The default value is _true_

fs-iframe
-----------
Disables/Enables the iframe-popup
The default value is _false_

fs-more-quests
----------------
Disables/Enables the 'More Quests'-tab in the welcome message
The default value is _true_

fs-share-screen
-----------------
Disables/Enables the 'Share-screen'-tab in the welcome message
The default value is _true_

fs-geolocation
----------------
Disables/Enables the geolocation button
The default value is _true_

debug
-------
If true, shows some extra debugging help such as all the available tags on every object
The default value is _false_

oauth_token
-------------
Used to complete the login
No default value set

background
------------
The id of the background layer to start with
The default value is set by the loaded theme

layer-<layer-id>
-----------------
Wether or not layer with _<layer-id>_ is shown
The default value is _true_

