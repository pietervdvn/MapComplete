

 Special and other useful layers 
=================================



## Table of contents

1. [Special and other useful layers](#special-and-other-useful-layers)
1. [Priviliged layers](#priviliged-layers)
1. [gps_location](#gps_location)
  - [Basic tags for this layer](#basic-tags-for-this-layer)
  - [Supported attributes](#supported-attributes)
1. [gps_location_history](#gps_location_history)
  - [Basic tags for this layer](#basic-tags-for-this-layer)
  - [Supported attributes](#supported-attributes)
1. [home_location](#home_location)
  - [Basic tags for this layer](#basic-tags-for-this-layer)
  - [Supported attributes](#supported-attributes)
1. [gps_track](#gps_track)
  - [Basic tags for this layer](#basic-tags-for-this-layer)
  - [Supported attributes](#supported-attributes)
    + [Privacy notice](#privacy-notice)
    + [export_as_gpx](#export_as_gpx)
    + [minimap](#minimap)
    + [delete](#delete)
1. [type_node](#type_node)
  - [Basic tags for this layer](#basic-tags-for-this-layer)
  - [Supported attributes](#supported-attributes)
1. [note](#note)
  - [Basic tags for this layer](#basic-tags-for-this-layer)
  - [Supported attributes](#supported-attributes)
    + [conversation](#conversation)
    + [add_image](#add_image)
    + [comment](#comment)
    + [report-contributor](#report-contributor)
    + [report-note](#report-note)
1. [import_candidate](#import_candidate)
  - [Basic tags for this layer](#basic-tags-for-this-layer)
  - [Supported attributes](#supported-attributes)
    + [all_tags](#all_tags)
1. [conflation](#conflation)
  - [Basic tags for this layer](#basic-tags-for-this-layer)
  - [Supported attributes](#supported-attributes)
1. [left_right_style](#left_right_style)
  - [Basic tags for this layer](#basic-tags-for-this-layer)
  - [Supported attributes](#supported-attributes)
1. [split_point](#split_point)
  - [Basic tags for this layer](#basic-tags-for-this-layer)
  - [Supported attributes](#supported-attributes)
1. [current_view](#current_view)
  - [Basic tags for this layer](#basic-tags-for-this-layer)
  - [Supported attributes](#supported-attributes)
1. [matchpoint](#matchpoint)
  - [Basic tags for this layer](#basic-tags-for-this-layer)
  - [Supported attributes](#supported-attributes)
1. [Normal layers](#normal-layers)



MapComplete has a few data layers available in the theme which have special properties through builtin-hooks. Furthermore, there are some normal layers (which are built from normal Theme-config files) but are so general that they get a mention here.



 Priviliged layers 
===================





  - [gps_location](#gps_location)
  - [gps_location_history](#gps_location_history)
  - [home_location](#home_location)
  - [gps_track](#gps_track)
  - [type_node](#type_node)
  - [note](#note)
  - [import_candidate](#import_candidate)
  - [conflation](#conflation)
  - [left_right_style](#left_right_style)
  - [split_point](#split_point)
  - [current_view](#current_view)
  - [matchpoint](#matchpoint)




 gps_location 
==============



<img src='https://mapcomplete.osm.be/crosshair:var(--catch-detail-color)' height="100px"> 

Meta layer showing the current location of the user. Add this to your theme and override the icon to change the appearance of the current location. The object will always have `id=gps` and will have _all_ the properties included in the [`Coordinates`-object](https://developer.mozilla.org/en-US/docs/Web/API/GeolocationCoordinates) returned by the browser.






  - **This layer is included automatically in every theme. This layer might contain no points**
  - This layer cannot be toggled in the filter view. If you import this layer in your theme, override `title` to make this toggleable.
  - Not visible in the layer selection by default. If you want to make this layer toggable, override `name`


[Go to the source code](../assets/layers/gps_location/gps_location.json)



 Basic tags for this layer 
---------------------------



Elements must have the all of following tags to be shown on this layer:



  - <a href='https://wiki.openstreetmap.org/wiki/Key:id' target='_blank'>id</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:id%3Dgps' target='_blank'>gps</a>




 Supported attributes 
----------------------





 gps_location_history 
======================





Meta layer which contains the previous locations of the user as single points. This is mainly for technical reasons, e.g. to keep match the distance to the modified object






  - **This layer is included automatically in every theme. This layer might contain no points**
  - This layer cannot be toggled in the filter view. If you import this layer in your theme, override `title` to make this toggleable.
  - Not visible in the layer selection by default. If you want to make this layer toggable, override `name`
  - Not rendered on the map by default. If you want to rendering this on the map, override `mapRenderings`


[Go to the source code](../assets/layers/gps_location_history/gps_location_history.json)



 Basic tags for this layer 
---------------------------



Elements must have the all of following tags to be shown on this layer:



  - <a href='https://wiki.openstreetmap.org/wiki/Key:user:location' target='_blank'>user:location</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:user:location%3Dyes' target='_blank'>yes</a>




 Supported attributes 
----------------------





 home_location 
===============



<img src='https://mapcomplete.osm.be/circle:white;./assets/svg/home.svg' height="100px"> 

Meta layer showing the home location of the user. The home location can be set in the [profile settings](https://www.openstreetmap.org/profile/edit) of OpenStreetMap.






  - **This layer is included automatically in every theme. This layer might contain no points**
  - This layer cannot be toggled in the filter view. If you import this layer in your theme, override `title` to make this toggleable.
  - Not visible in the layer selection by default. If you want to make this layer toggable, override `name`


[Go to the source code](../assets/layers/home_location/home_location.json)



 Basic tags for this layer 
---------------------------



Elements must have the all of following tags to be shown on this layer:



  - <a href='https://wiki.openstreetmap.org/wiki/Key:user:home' target='_blank'>user:home</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:user:home%3Dyes' target='_blank'>yes</a>




 Supported attributes 
----------------------





 gps_track 
===========





Meta layer showing the previous locations of the user as single line. Add this to your theme and override the icon to change the appearance of the current location.






  - **This layer is included automatically in every theme. This layer might contain no points**
  - This layer is not visible by default and must be enabled in the filter by the user. 
  - Not rendered on the map by default. If you want to rendering this on the map, override `mapRenderings`


[Go to the source code](../assets/layers/gps_track/gps_track.json)



 Basic tags for this layer 
---------------------------



Elements must have the all of following tags to be shown on this layer:



  - <a href='https://wiki.openstreetmap.org/wiki/Key:id' target='_blank'>id</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:id%3Dlocation_track' target='_blank'>location_track</a>




 Supported attributes 
----------------------





### Privacy notice 



_This tagrendering has no question and is thus read-only_





### export_as_gpx 



_This tagrendering has no question and is thus read-only_





### minimap 



_This tagrendering has no question and is thus read-only_





### delete 



_This tagrendering has no question and is thus read-only_





 type_node 
===========





This is a priviliged meta_layer which exports _every_ point in OSM. This only works if zoomed below the point that the full tile is loaded (and not loaded via Overpass). Note that this point will also contain a property `parent_ways` which contains all the ways this node is part of as a list. This is mainly used for extremely specialized themes, which do advanced conflations. Expert use only.






  - Not rendered on the map by default. If you want to rendering this on the map, override `mapRenderings`


[Go to the source code](../assets/layers/type_node/type_node.json)



 Basic tags for this layer 
---------------------------



Elements must have the all of following tags to be shown on this layer:



  - id~^node\/.*$




 Supported attributes 
----------------------





 note 
======



<img src='https://mapcomplete.osm.be/./assets/svg/note.svg' height="100px"> 

This layer shows notes on OpenStreetMap. Having this layer in your theme will trigger the 'add new note' functionality in the 'addNewPoint'-popup (or if your theme has no presets, it'll enable adding notes)






  - <img src='../warning.svg' height='1rem'/> This layer is loaded from an external source, namely `https://api.openstreetmap.org/api/0.6/notes.json?limit=10000&closed=7&bbox={x_min},{y_min},{x_max},{y_max}`


[Go to the source code](../assets/layers/note/note.json)



 Basic tags for this layer 
---------------------------



Elements must have the all of following tags to be shown on this layer:



  - id~^..*$




 Supported attributes 
----------------------





### conversation 



_This tagrendering has no question and is thus read-only_





### add_image 



_This tagrendering has no question and is thus read-only_





### comment 



_This tagrendering has no question and is thus read-only_





### report-contributor 



_This tagrendering has no question and is thus read-only_





### report-note 



_This tagrendering has no question and is thus read-only_





 import_candidate 
==================



<img src='https://mapcomplete.osm.be/square:red;' height="100px"> 

Layer used in the importHelper






  - Not visible in the layer selection by default. If you want to make this layer toggable, override `name`


[Go to the source code](../assets/layers/import_candidate/import_candidate.json)



 Basic tags for this layer 
---------------------------



Elements must have the all of following tags to be shown on this layer:








 Supported attributes 
----------------------





### all_tags 



_This tagrendering has no question and is thus read-only_





 conflation 
============



<img src='https://mapcomplete.osm.be/addSmall:#000' height="100px"> 

If the import-button moves OSM points, the imported way points or conflates, a preview is shown. This layer defines how this preview is rendered. This layer cannot be included in a theme.






  - This layer can **not** be included in a theme. It is solely used by [special renderings](SpecialRenderings.md) showing a minimap with custom data.


[Go to the source code](../assets/layers/conflation/conflation.json)



 Basic tags for this layer 
---------------------------



Elements must have the all of following tags to be shown on this layer:



  - <a href='https://wiki.openstreetmap.org/wiki/Key:move' target='_blank'>move</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:move%3Dyes' target='_blank'>yes</a>|<a href='https://wiki.openstreetmap.org/wiki/Key:newpoint' target='_blank'>newpoint</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:newpoint%3Dyes' target='_blank'>yes</a>




 Supported attributes 
----------------------





 left_right_style 
==================





Special meta-style which will show one single line, either on the left or on the right depending on the id. This is used in the small popups with left_right roads. Cannot be included in a theme






  - This layer can **not** be included in a theme. It is solely used by [special renderings](SpecialRenderings.md) showing a minimap with custom data.


[Go to the source code](../assets/layers/left_right_style/left_right_style.json)



 Basic tags for this layer 
---------------------------



Elements must have the all of following tags to be shown on this layer:



  - <a href='https://wiki.openstreetmap.org/wiki/Key:id' target='_blank'>id</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:id%3Dleft' target='_blank'>left</a>|<a href='https://wiki.openstreetmap.org/wiki/Key:id' target='_blank'>id</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:id%3Dright' target='_blank'>right</a>




 Supported attributes 
----------------------





 split_point 
=============



<img src='https://mapcomplete.osm.be/circle:white;./assets/svg/scissors.svg' height="100px"> 

Layer rendering the little scissors for the minimap in the 'splitRoadWizard'






  - This layer can **not** be included in a theme. It is solely used by [special renderings](SpecialRenderings.md) showing a minimap with custom data.


[Go to the source code](../assets/layers/split_point/split_point.json)



 Basic tags for this layer 
---------------------------



Elements must have the all of following tags to be shown on this layer:



  - <a href='https://wiki.openstreetmap.org/wiki/Key:_split_point' target='_blank'>_split_point</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:_split_point%3Dyes' target='_blank'>yes</a>




 Supported attributes 
----------------------





 current_view 
==============





A meta-layer which contains one single feature, namely the BBOX of the current map view. This can be used to trigger special actions. If a popup is defined for this layer, this popup will be accessible via an extra button on screen.

The icon on the button is the default icon of the layer, but can be customized by detecting 'button=yes'.






  - This layer can **not** be included in a theme. It is solely used by [special renderings](SpecialRenderings.md) showing a minimap with custom data.


[Go to the source code](../assets/layers/current_view/current_view.json)



 Basic tags for this layer 
---------------------------



Elements must have the all of following tags to be shown on this layer:



  - <a href='https://wiki.openstreetmap.org/wiki/Key:current_view' target='_blank'>current_view</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:current_view%3Dyes' target='_blank'>yes</a>




 Supported attributes 
----------------------





 matchpoint 
============



<img src='https://mapcomplete.osm.be/./assets/svg/crosshair-empty.svg' height="100px"> 

The default rendering for a locationInput which snaps onto another object






  - This layer can **not** be included in a theme. It is solely used by [special renderings](SpecialRenderings.md) showing a minimap with custom data.


[Go to the source code](../assets/layers/matchpoint/matchpoint.json)



 Basic tags for this layer 
---------------------------



Elements must have the all of following tags to be shown on this layer:








 Supported attributes 
----------------------





 Normal layers 
===============



The following layers are included in MapComplete:



  - [address](./Layers/address.md)
  - [ambulancestation](./Layers/ambulancestation.md)
  - [artwork](./Layers/artwork.md)
  - [barrier](./Layers/barrier.md)
  - [bench](./Layers/bench.md)
  - [bench_at_pt](./Layers/bench_at_pt.md)
  - [bicycle_library](./Layers/bicycle_library.md)
  - [bicycle_rental](./Layers/bicycle_rental.md)
  - [bicycle_tube_vending_machine](./Layers/bicycle_tube_vending_machine.md)
  - [bike_cafe](./Layers/bike_cafe.md)
  - [bike_cleaning](./Layers/bike_cleaning.md)
  - [bike_parking](./Layers/bike_parking.md)
  - [bike_repair_station](./Layers/bike_repair_station.md)
  - [bike_shop](./Layers/bike_shop.md)
  - [bike_themed_object](./Layers/bike_themed_object.md)
  - [binocular](./Layers/binocular.md)
  - [birdhide](./Layers/birdhide.md)
  - [cafe_pub](./Layers/cafe_pub.md)
  - [charging_station](./Layers/charging_station.md)
  - [cluster_style](./Layers/cluster_style.md)
  - [conflation](./Layers/conflation.md)
  - [crab_address](./Layers/crab_address.md)
  - [crossings](./Layers/crossings.md)
  - [current_view](./Layers/current_view.md)
  - [cycleways_and_roads](./Layers/cycleways_and_roads.md)
  - [defibrillator](./Layers/defibrillator.md)
  - [direction](./Layers/direction.md)
  - [drinking_water](./Layers/drinking_water.md)
  - [entrance](./Layers/entrance.md)
  - [etymology](./Layers/etymology.md)
  - [extinguisher](./Layers/extinguisher.md)
  - [fire_station](./Layers/fire_station.md)
  - [food](./Layers/food.md)
  - [ghost_bike](./Layers/ghost_bike.md)
  - [gps_location](./Layers/gps_location.md)
  - [gps_location_history](./Layers/gps_location_history.md)
  - [gps_track](./Layers/gps_track.md)
  - [grass_in_parks](./Layers/grass_in_parks.md)
  - [home_location](./Layers/home_location.md)
  - [hydrant](./Layers/hydrant.md)
  - [import_candidate](./Layers/import_candidate.md)
  - [information_board](./Layers/information_board.md)
  - [left_right_style](./Layers/left_right_style.md)
  - [map](./Layers/map.md)
  - [matchpoint](./Layers/matchpoint.md)
  - [named_streets](./Layers/named_streets.md)
  - [nature_reserve](./Layers/nature_reserve.md)
  - [note](./Layers/note.md)
  - [note_import](./Layers/note_import.md)
  - [observation_tower](./Layers/observation_tower.md)
  - [parking](./Layers/parking.md)
  - [pedestrian_path](./Layers/pedestrian_path.md)
  - [picnic_table](./Layers/picnic_table.md)
  - [play_forest](./Layers/play_forest.md)
  - [playground](./Layers/playground.md)
  - [public_bookcase](./Layers/public_bookcase.md)
  - [shops](./Layers/shops.md)
  - [slow_roads](./Layers/slow_roads.md)
  - [split_point](./Layers/split_point.md)
  - [sport_pitch](./Layers/sport_pitch.md)
  - [street_lamps](./Layers/street_lamps.md)
  - [surveillance_camera](./Layers/surveillance_camera.md)
  - [toilet](./Layers/toilet.md)
  - [trail](./Layers/trail.md)
  - [tree_node](./Layers/tree_node.md)
  - [type_node](./Layers/type_node.md)
  - [viewpoint](./Layers/viewpoint.md)
  - [village_green](./Layers/village_green.md)
  - [visitor_information_centre](./Layers/visitor_information_centre.md)
  - [walls_and_buildings](./Layers/walls_and_buildings.md)
  - [waste_basket](./Layers/waste_basket.md)
  - [watermill](./Layers/watermill.md)
 

This document is autogenerated from [Customizations/AllKnownLayouts.ts](https://github.com/pietervdvn/MapComplete/blob/develop/Customizations/AllKnownLayouts.ts)